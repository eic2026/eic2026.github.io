/**
 * Lead submission service — the only place the frontend talks to the backend.
 * Swap the transport (serverless function → Formspree, Supabase, your CRM) here without touching UI code.
 */
import { track, getUTM } from './analytics.js';

const cfg = () => window.EIC_CONFIG || {};
const endpoint = () => cfg().enquiryEndpoint || '/api/enquiry';
const leadId = () => `EIC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/* GitHub-Pages mode: no server, so enquiries are emailed to EIC through Web3Forms. */
async function postWeb3Forms(body) {
  const id = leadId();
  const type = (body.type || 'quote').toUpperCase();
  const payload = {
    access_key: cfg().web3formsKey,
    subject: `[${id}] ${type}: ${body.product || body.resource || 'General'} — ${body.name}`,
    from_name: 'EIC Website',
    replyto: body.email || undefined,
    'Lead ID': id,
    ...body,
  };
  delete payload.consent; payload.Consent = 'yes';
  const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.message || 'Send failed');
  return { ok: true, leadId: id };
}

async function post(body) {
  if (cfg().mode === 'github') return postWeb3Forms(body);
  const res = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return res.json().catch(() => ({}));
}

function context() {
  return { sourcePage: location.pathname + location.search, referrer: document.referrer || null, ...getUTM() };
}

/** Quote / contact enquiry. `data` = fields from the enquiry form. Returns { ok, leadId }. */
export async function submitEnquiry(data) {
  const result = await post({ type: data.type || 'quote', ...data, ...context() });
  track('quote_submit', { product: data.product || null });
  return result;
}

/** Gated download — records the lead, then the caller reveals the file. */
export async function submitDownloadLead(data) {
  return post({ type: 'download', ...data, ...context() });
}

/** Anonymous interaction events (no PII). */
export function trackDownload(resourceType, title, file) {
  const ev = resourceType === 'catalogue' ? 'catalogue_download'
    : resourceType === 'technical_document' ? 'technical_document_download'
    : 'product_document_download';
  track(ev, { title, file });
}
export function trackProductInterest(slug, name) { track('product_view', { product: slug, name }); }

/** Notifications (email / WhatsApp) are sent server-side by /api/enquiry.js. Kept here as the client-side hook name. */
export function sendLeadNotification() { /* handled by the serverless layer */ }
