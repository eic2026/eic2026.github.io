/**
 * /api/admin — backend for the EIC admin panel (/admin/).
 *
 * How content editing works (no database needed):
 *   content/content.json in the Git repo is the source of truth for products, contact details and hero slides.
 *   The admin panel reads it and writes it back through the GitHub Contents API. Each save is a commit, which
 *   triggers the host (Vercel / Netlify) to rebuild the static site automatically — the change is live in ~1 minute.
 *   Product images are committed the same way to public/assets/img/products/.
 *
 * ENVIRONMENT VARIABLES
 *   ADMIN_USER            login username
 *   ADMIN_PASSWORD        login password (use a long one)
 *   ADMIN_SECRET          random 32+ char string used to sign session tokens
 *   GITHUB_TOKEN          fine-grained token with "Contents: read/write" on the site repo
 *   GITHUB_REPO           e.g. wishgeeks/eic-website
 *   GITHUB_BRANCH         default: main
 *   SUPABASE_URL + SUPABASE_SERVICE_KEY   optional — enables the Leads tab (same vars as api/enquiry.js)
 *
 * ACTIONS (POST JSON { action, ... } — except login, all require Authorization: Bearer <token>)
 *   login            { user, password }                → { token }
 *   getContent       {}                                → { content, sha }
 *   saveContent      { content, sha, message }          → { sha, commit }
 *   uploadImage      { filename, base64 }               → { path }   (saved to public/assets/img/products/)
 *   listLeads        { status?, limit? }                → { leads }
 *   updateLead       { leadId, status, followUpNotes, assignedTo, followUpDate } → { ok }
 */
const crypto = require('crypto');

const env = (k, d) => process.env[k] || d;
const GH_REPO = () => env('GITHUB_REPO');
const GH_BRANCH = () => env('GITHUB_BRANCH', 'main');
const CONTENT_PATH = 'content/content.json';

// ---------- auth ----------
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', env('ADMIN_SECRET', '')).update(body).digest('base64url');
  return `${body}.${mac}`;
}
function verify(token) {
  if (!token || !env('ADMIN_SECRET')) return null;
  const [body, mac] = token.split('.');
  const expect = crypto.createHmac('sha256', env('ADMIN_SECRET')).update(body || '').digest('base64url');
  if (!mac || mac.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expect))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  return payload.exp > Date.now() ? payload : null;
}
function safeEqual(a = '', b = '') {
  const A = Buffer.from(String(a)), B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}
const attempts = new Map();
function login({ user, password }, ip) {
  const key = ip || 'x', now = Date.now();
  const arr = (attempts.get(key) || []).filter((t) => now - t < 15 * 60 * 1000);
  if (arr.length >= 8) throw httpErr(429, 'Too many attempts. Try again in 15 minutes.');
  if (!env('ADMIN_USER') || !env('ADMIN_PASSWORD') || !env('ADMIN_SECRET')) throw httpErr(500, 'Admin is not configured. Set ADMIN_USER, ADMIN_PASSWORD and ADMIN_SECRET.');
  if (!safeEqual(user, env('ADMIN_USER')) || !safeEqual(password, env('ADMIN_PASSWORD'))) { arr.push(now); attempts.set(key, arr); throw httpErr(401, 'Incorrect username or password.'); }
  attempts.delete(key);
  return { token: sign({ u: user, exp: now + 12 * 60 * 60 * 1000 }) };
}

// ---------- GitHub content storage ----------
async function gh(path, init = {}) {
  if (!env('GITHUB_TOKEN') || !GH_REPO()) throw httpErr(500, 'GitHub storage is not configured. Set GITHUB_TOKEN and GITHUB_REPO.');
  const res = await fetch(`https://api.github.com/repos/${GH_REPO()}/contents/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env('GITHUB_TOKEN')}`, Accept: 'application/vnd.github+json', 'User-Agent': 'eic-admin', 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw httpErr(res.status === 409 ? 409 : 502, `GitHub error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
async function getContent() {
  const data = await gh(`${CONTENT_PATH}?ref=${GH_BRANCH()}`);
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString()), sha: data.sha };
}
function validateContent(c) {
  if (!c || typeof c !== 'object') throw httpErr(400, 'Invalid content.');
  if (!Array.isArray(c.products)) throw httpErr(400, 'products must be a list.');
  const slugs = new Set();
  for (const p of c.products) {
    if (!p.name || !p.slug) throw httpErr(400, `Every product needs a name and slug (problem near "${p.name || p.slug || '?'}").`);
    if (!/^[a-z0-9-]+$/.test(p.slug)) throw httpErr(400, `Slug "${p.slug}" may only contain lowercase letters, numbers and hyphens.`);
    if (slugs.has(p.slug)) throw httpErr(400, `Duplicate slug "${p.slug}".`);
    slugs.add(p.slug);
  }
  if (c.site && c.site.phone && !/^\d{10}$/.test(c.site.phone)) throw httpErr(400, 'Phone must be a 10-digit number.');
}
async function saveContent({ content, sha, message }, user) {
  validateContent(content);
  if (content.site) {
    content.site.phoneDisplay = content.site.phone.replace(/(\d{5})(\d{5})/, '$1 $2');
    content.site.phoneTel = '+91' + content.site.phone;
    content.site.whatsapp = '91' + (content.site.whatsappNumber || content.site.phone);
  }
  const body = { message: message || `content: update via admin (${user})`, content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'), branch: GH_BRANCH(), sha };
  const r = await gh(CONTENT_PATH, { method: 'PUT', body: JSON.stringify(body) });
  return { sha: r.content.sha, commit: r.commit.sha };
}
async function uploadImage({ filename, base64 }) {
  const name = String(filename || '').toLowerCase().replace(/[^a-z0-9.-]/g, '-');
  if (!/\.(webp|jpg|jpeg|png)$/.test(name)) throw httpErr(400, 'Image must be .webp, .jpg or .png');
  if (!base64 || base64.length > 4 * 1024 * 1024) throw httpErr(400, 'Image missing or larger than 3 MB.');
  const path = `public/assets/img/products/${name}`;
  let sha;
  try { sha = (await gh(`${path}?ref=${GH_BRANCH()}`)).sha; } catch (e) { /* new file */ }
  await gh(path, { method: 'PUT', body: JSON.stringify({ message: `content: upload ${name}`, content: base64, branch: GH_BRANCH(), sha }) });
  return { path: `/assets/img/products/${name}` };
}

// ---------- leads (Supabase) ----------
async function sb(path, init = {}) {
  if (!env('SUPABASE_URL') || !env('SUPABASE_SERVICE_KEY')) throw httpErr(501, 'Leads storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY).');
  const res = await fetch(`${env('SUPABASE_URL')}/rest/v1/${path}`, { ...init, headers: { apikey: env('SUPABASE_SERVICE_KEY'), Authorization: `Bearer ${env('SUPABASE_SERVICE_KEY')}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) } });
  if (!res.ok) throw httpErr(502, `Leads error ${res.status}`);
  return res.json();
}
const listLeads = ({ status, limit = 200 }) => sb(`leads?select=*&order=created_at.desc&limit=${Math.min(Number(limit) || 200, 500)}${status ? `&status=eq.${encodeURIComponent(status)}` : ''}`).then((leads) => ({ leads }));
async function updateLead({ leadId, status, followUpNotes, assignedTo, followUpDate }) {
  const patch = {};
  if (status) patch.status = status;
  if (followUpNotes !== undefined) patch.follow_up_notes = followUpNotes;
  if (assignedTo !== undefined) patch.assigned_to = assignedTo;
  if (followUpDate !== undefined) patch.follow_up_date = followUpDate || null;
  await sb(`leads?lead_id=eq.${encodeURIComponent(leadId)}`, { method: 'PATCH', body: JSON.stringify(patch) });
  return { ok: true };
}

// ---------- router ----------
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }
async function handleAdmin({ method, body, ip, authorization }) {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': env('ALLOWED_ORIGIN', '*'), 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (method === 'OPTIONS') return { status: 204, headers, body: '' };
  try {
    if (method !== 'POST') throw httpErr(405, 'Method not allowed');
    const { action, ...args } = body || {};
    if (action === 'login') return { status: 200, headers, body: JSON.stringify(login(args, ip)) };
    const session = verify((authorization || '').replace(/^Bearer\s+/i, ''));
    if (!session) throw httpErr(401, 'Session expired. Please log in again.');
    const map = { getContent, saveContent: (a) => saveContent(a, session.u), uploadImage, listLeads, updateLead };
    if (!map[action]) throw httpErr(400, 'Unknown action');
    return { status: 200, headers, body: JSON.stringify(await map[action](args)) };
  } catch (e) {
    return { status: e.status || 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}

const safeJson = (s) => { try { return JSON.parse(s || '{}'); } catch { return {}; } };
module.exports = async (req, res) => { // Vercel
  const out = await handleAdmin({ method: req.method, body: typeof req.body === 'string' ? safeJson(req.body) : req.body, ip: req.headers['x-forwarded-for'], authorization: req.headers.authorization });
  Object.entries(out.headers).forEach(([k, v]) => res.setHeader(k, v)); res.status(out.status).send(out.body);
};
module.exports.handler = async (event) => { // Netlify
  const out = await handleAdmin({ method: event.httpMethod, body: safeJson(event.body), ip: event.headers['x-forwarded-for'], authorization: event.headers.authorization });
  return { statusCode: out.status, headers: out.headers, body: out.body };
};
module.exports.handleAdmin = handleAdmin;
