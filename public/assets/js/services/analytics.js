/**
 * Event tracking architecture.
 * Events: product_view, product_search, quote_open, quote_submit, catalogue_download,
 *         technical_document_download, product_document_download, call_click, whatsapp_click, email_click
 *
 * Privacy: only anonymous interaction events are recorded. No personal data is attached to events.
 * Form data is sent to the enquiry endpoint only when the visitor submits a form.
 */
const cfg = () => window.EIC_CONFIG || {};

export function track(event, data = {}) {
  if (!cfg().analyticsEnabled) return;
  const payload = { event, ...data, page: location.pathname, ts: new Date().toISOString() };
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload); // GTM hook
  const provider = cfg().analyticsProvider; // gtag / plausible / custom
  if (provider && typeof window[provider] === 'function') {
    try { window[provider]('event', event, data); } catch (e) { /* noop */ }
  }
  if (location.hostname === 'localhost') console.debug('[eic:track]', payload);
}

export function getUTM() {
  const q = new URLSearchParams(location.search);
  const utm = { utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign') };
  // Persist first-touch UTM for the session so it reaches the lead even after navigation.
  try {
    const saved = JSON.parse(sessionStorage.getItem('eic_utm') || 'null');
    if (utm.utm_source) sessionStorage.setItem('eic_utm', JSON.stringify(utm));
    else if (saved) return saved;
  } catch (e) { /* storage unavailable */ }
  return utm;
}
