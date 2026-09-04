/**
 * POST /api/enquiry — serverless lead intake (Vercel / Netlify Functions compatible, Node 18+).
 *
 * The public site is fully static; this is the only server-side piece. It:
 *   1. validates the submission and applies a light rate limit
 *   2. builds a Lead record (see LEAD_SCHEMA below) with status "NEW"
 *   3. stores it through whichever adapters are configured via environment variables
 *   4. sends the sales team a notification email
 *   5. returns { ok: true, leadId }
 *
 * ENVIRONMENT VARIABLES (never commit values — set them in the hosting dashboard):
 *   LEAD_WEBHOOK_URL      optional  — any JSON webhook: Zapier, Make, n8n, Google Apps Script → Sheet, CRM inbound endpoint
 *   LEAD_WEBHOOK_SECRET   optional  — sent as X-Lead-Secret header for the webhook to verify
 *   SUPABASE_URL          optional  — with SUPABASE_SERVICE_KEY, inserts into table `leads`
 *   SUPABASE_SERVICE_KEY  optional
 *   RESEND_API_KEY        optional  — email notification via Resend (https://resend.com). Any SMTP/SendGrid adapter can be dropped in the same way.
 *   NOTIFY_TO             optional  — where notifications go (defaults to the site email)
 *   NOTIFY_FROM           optional  — verified sender, e.g. "EIC Website <leads@yourdomain.com>"
 *   ALLOWED_ORIGIN        optional  — restrict CORS to the production domain
 *
 * With no adapters configured the function still validates and returns a lead ID, and logs the lead
 * to the function console so the site works end-to-end during setup.
 */

const SITE_EMAIL = 'expertsindustrialcorporation@gmail.com';

/** Lead record shape — mirror this in your database / CRM. */
const LEAD_SCHEMA = {
  leadId: 'string   EIC-YYYYMMDD-XXXX',
  createdAt: 'ISO datetime',
  type: 'quote | contact | download',
  intent: 'quote | info | availability',
  name: 'string', company: 'string', mobile: 'string', email: 'string', city: 'string',
  product: 'string', quantity: 'string', specification: 'string', application: 'string', message: 'string',
  resource: 'string (download title, for type=download)',
  sourcePage: 'string', referrer: 'string', utmSource: 'string', utmMedium: 'string', utmCampaign: 'string',
  consent: 'boolean',
  status: 'NEW | CONTACTED | FOLLOW_UP_REQUIRED | QUOTATION_SENT | NEGOTIATION | CONVERTED | LOST',
  followUpNotes: 'string', assignedTo: 'string', followUpDate: 'ISO date',
};
const LEAD_STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP_REQUIRED', 'QUOTATION_SENT', 'NEGOTIATION', 'CONVERTED', 'LOST'];

// ---------- helpers ----------
const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isMobile = (v) => /^[0-9+\s-]{10,15}$/.test(v);
const isEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function makeLeadId(d = new Date()) {
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EIC-${ymd}-${rand}`;
}

function buildLead(body) {
  const now = new Date();
  return {
    leadId: makeLeadId(now),
    createdAt: now.toISOString(),
    type: ['quote', 'contact', 'download'].includes(body.type) ? body.type : 'quote',
    intent: clean(body.intent, 20) || 'quote',
    name: clean(body.name, 120),
    company: clean(body.company, 160),
    mobile: clean(body.mobile, 20),
    email: clean(body.email, 160),
    city: clean(body.city, 120),
    product: clean(body.product, 160),
    quantity: clean(body.quantity, 120),
    specification: clean(body.specification, 240),
    application: clean(body.application, 160),
    message: clean(body.message, 2000),
    resource: clean(body.resource, 160),
    sourcePage: clean(body.sourcePage, 300),
    referrer: clean(body.referrer, 300),
    utmSource: clean(body.utm_source, 80),
    utmMedium: clean(body.utm_medium, 80),
    utmCampaign: clean(body.utm_campaign, 120),
    consent: body.consent === 'yes' || body.consent === true,
    status: 'NEW',
    followUpNotes: '',
    assignedTo: '',
    followUpDate: '',
  };
}

function validate(lead) {
  if (!lead.name) return 'Name is required.';
  if (!isMobile(lead.mobile)) return 'A valid mobile number is required.';
  if (!isEmail(lead.email)) return 'Email address is not valid.';
  if (!lead.consent) return 'Consent is required.';
  return null;
}

// ---------- storage adapters (each is a no-op unless configured) ----------
async function storeWebhook(lead) {
  if (!process.env.LEAD_WEBHOOK_URL) return;
  await fetch(process.env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(process.env.LEAD_WEBHOOK_SECRET ? { 'X-Lead-Secret': process.env.LEAD_WEBHOOK_SECRET } : {}) },
    body: JSON.stringify(lead),
  });
}
async function storeSupabase(lead) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return;
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`, Prefer: 'return=minimal' },
    body: JSON.stringify(snakeCase(lead)),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status}`);
}
const snakeCase = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase()), v]));

// ---------- notification ----------
async function sendLeadNotification(lead) {
  if (!process.env.RESEND_API_KEY) return;
  const to = process.env.NOTIFY_TO || SITE_EMAIL;
  const rows = ['leadId', 'type', 'intent', 'product', 'name', 'company', 'mobile', 'email', 'city', 'quantity', 'specification', 'application', 'message', 'resource', 'sourcePage', 'utmSource', 'utmMedium', 'utmCampaign']
    .filter((k) => lead[k]).map((k) => `<tr><td style="padding:6px 10px;color:#666;text-transform:capitalize">${k}</td><td style="padding:6px 10px"><strong>${escapeHtml(lead[k])}</strong></td></tr>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px"><h2 style="color:#1A1A1A;border-bottom:3px solid #D4AF37;padding-bottom:8px">New website enquiry — ${escapeHtml(lead.product || lead.type)}</h2><table style="border-collapse:collapse;width:100%">${rows}</table><p style="margin-top:16px"><a href="https://wa.me/91${lead.mobile.replace(/\D/g, '').slice(-10)}" style="background:#25D366;color:#fff;padding:10px 16px;text-decoration:none;border-radius:2px">Reply on WhatsApp</a> &nbsp; <a href="tel:${lead.mobile}" style="background:#1A1A1A;color:#D4AF37;padding:10px 16px;text-decoration:none;border-radius:2px">Call</a></p></div>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: process.env.NOTIFY_FROM || 'EIC Website <onboarding@resend.dev>', to: [to], reply_to: lead.email || undefined, subject: `[${lead.leadId}] ${lead.type.toUpperCase()}: ${lead.product || 'General'} — ${lead.name}`, html }),
  });
}
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- simple in-memory rate limit (per warm instance) ----------
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, max = 8;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > max;
}

// ---------- core handler (framework-agnostic) ----------
async function handleEnquiry({ method, body, ip, origin }) {
  const allowed = process.env.ALLOWED_ORIGIN;
  const cors = { 'Access-Control-Allow-Origin': allowed || origin || '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
  if (method === 'OPTIONS') return { status: 204, headers: cors, body: '' };
  if (method !== 'POST') return { status: 405, headers: cors, body: 'Method not allowed' };
  if (rateLimited(ip || 'unknown')) return { status: 429, headers: cors, body: 'Too many requests. Please try again later or call EIC.' };
  if (body && body.website) return { status: 200, headers: cors, body: JSON.stringify({ ok: true }) }; // honeypot

  const lead = buildLead(body || {});
  const err = validate(lead);
  if (err) return { status: 400, headers: cors, body: err };

  const results = await Promise.allSettled([storeWebhook(lead), storeSupabase(lead), sendLeadNotification(lead)]);
  results.forEach((r) => { if (r.status === 'rejected') console.error('[enquiry] adapter failed:', r.reason && r.reason.message); });
  if (!process.env.LEAD_WEBHOOK_URL && !process.env.SUPABASE_URL) console.log('[enquiry] lead (no storage configured):', JSON.stringify(lead));

  return { status: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, leadId: lead.leadId }) };
}

// ---------- Vercel (Node) ----------
module.exports = async (req, res) => {
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body;
  const out = await handleEnquiry({ method: req.method, body, ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress, origin: req.headers.origin });
  Object.entries(out.headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(out.status).send(out.body);
};
// ---------- Netlify Functions ----------
module.exports.handler = async (event) => {
  const out = await handleEnquiry({ method: event.httpMethod, body: safeJson(event.body), ip: event.headers['x-forwarded-for'] || event.headers['client-ip'], origin: event.headers.origin });
  return { statusCode: out.status, headers: out.headers, body: out.body };
};
const safeJson = (s) => { try { return JSON.parse(s || '{}'); } catch { return {}; } };

module.exports.handleEnquiry = handleEnquiry;
module.exports.LEAD_SCHEMA = LEAD_SCHEMA;
module.exports.LEAD_STATUSES = LEAD_STATUSES;
