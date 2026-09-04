import { track } from './services/analytics.js';
import { submitEnquiry, submitDownloadLead, trackDownload, trackProductInterest } from './services/leads.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- Mobile drawer ---------- */
(() => {
  const drawer = $('#drawer');
  if (!drawer) return;
  const open = () => { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('#drawer-close').focus(); };
  const close = () => { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; $('#menu-btn').focus(); };
  $('#menu-btn').addEventListener('click', open);
  $('#drawer-close').addEventListener('click', close);
  $('.drawer__backdrop', drawer).addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) close(); });
})();

/* ---------- CTA click tracking (call / whatsapp / email) ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-track]');
  if (!a) return;
  track(a.dataset.track, { label: a.dataset.label || a.textContent.trim().slice(0, 60) });
});

/* ---------- Product view ---------- */
(() => {
  const el = $('[data-product-slug]');
  if (el) trackProductInterest(el.dataset.productSlug, el.dataset.productName);
})();

/* ---------- Generic form helpers ---------- */
function validate(form) {
  let ok = true;
  $$('.field', form).forEach((f) => f.classList.remove('is-invalid'));
  $$('[required]', form).forEach((input) => {
    const field = input.closest('.field') || input.closest('.consent');
    let valid = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
    if (valid && input.name === 'mobile') valid = /^[0-9+\s-]{10,15}$/.test(input.value.trim());
    if (valid && input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    if (!valid) { ok = false; if (field) field.classList.add('is-invalid'); if (ok === false && !form.__first) form.__first = input; }
  });
  if (!ok && form.__first) { form.__first.focus(); form.__first = null; }
  return ok;
}
function formData(form) {
  const d = {};
  new FormData(form).forEach((v, k) => { d[k] = typeof v === 'string' ? v.trim() : v; });
  return d;
}
function setBusy(form, busy) {
  const btn = $('button[type="submit"]', form);
  if (!btn) return;
  btn.disabled = busy;
  if (busy) { btn.dataset.label = btn.innerHTML; btn.textContent = 'Sending…'; }
  else if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
}
function showError(form, msg) {
  const box = $('.form__status', form);
  if (!box) return;
  box.className = 'form__status is-error';
  box.textContent = msg;
}

/* ---------- Enquiry modal ---------- */
const modal = $('#enquiry-modal');
let lastFocus = null;
export function openEnquiry(product = '', intent = 'quote') {
  if (!modal) return;
  lastFocus = document.activeElement;
  modal.classList.remove('is-done');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const form = $('form', modal);
  form.reset();
  $$('.field', form).forEach((f) => f.classList.remove('is-invalid'));
  $('.form__status', form).className = 'form__status';
  const pf = $('#eq-product', form);
  pf.value = product || 'General enquiry';
  $('#eq-intent', form).value = intent;
  const title = $('#enquiry-title', modal);
  title.textContent = intent === 'availability' ? 'Ask about availability' : intent === 'info' ? 'Get product information' : 'Request a quote';
  setTimeout(() => $('#eq-name', form).focus(), 30);
  track('quote_open', { product: product || null, intent });
}
function closeEnquiry() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
if (modal) {
  $$('[data-close]', modal).forEach((b) => b.addEventListener('click', closeEnquiry));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeEnquiry(); });
  const form = $('form', modal);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const data = formData(form);
    setBusy(form, true);
    try {
      const res = await submitEnquiry(data);
      $('#enquiry-ref').textContent = res && res.leadId ? `Reference: ${res.leadId}` : '';
      modal.classList.add('is-done');
    } catch (err) {
      showError(form, 'The enquiry could not be sent right now. Please call or WhatsApp EIC, or try again in a moment.');
    } finally { setBusy(form, false); }
  });
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-quote]');
  if (!b) return;
  e.preventDefault();
  openEnquiry(b.dataset.quote, b.dataset.intent || 'quote');
});

/* ---------- Contact page form ---------- */
(() => {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setBusy(form, true);
    try {
      const res = await submitEnquiry({ ...formData(form), type: 'contact' });
      form.innerHTML = `<div class="modal__success" style="display:block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg><h3>Enquiry received</h3><p>EIC will get back to you on the details you shared. ${res && res.leadId ? `Reference: ${res.leadId}` : ''}</p></div>`;
    } catch (err) {
      showError(form, 'The enquiry could not be sent right now. Please call or WhatsApp EIC, or try again in a moment.');
      setBusy(form, false);
    }
  });
})();

/* ---------- Downloads (gated + ungated) ---------- */
const dl = $('#download-modal');
document.addEventListener('click', async (e) => {
  const a = e.target.closest('a[data-download]');
  if (!a) return;
  const { downloadType: type, downloadTitle: title, gated } = a.dataset;
  const file = a.getAttribute('href');
  if (gated !== 'true' || !dl) { trackDownload(type, title, file); return; } // browser follows the link
  e.preventDefault();
  lastFocus = document.activeElement;
  dl.classList.remove('is-done');
  dl.classList.add('is-open');
  dl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const form = $('form', dl);
  form.reset();
  $('#dl-resource', form).value = title;
  $('#dl-file', form).value = file;
  $('#dl-type', form).value = type;
  $('#download-name').textContent = title;
  const ready = $('#download-ready');
  ready.href = file;
  ready.dataset.downloadTitle = title;
  setTimeout(() => $('#dl-name', form).focus(), 30);
});
if (dl) {
  const close = () => { dl.classList.remove('is-open'); dl.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
  $$('[data-close]', dl).forEach((b) => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dl.classList.contains('is-open')) close(); });
  const form = $('form', dl);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const data = formData(form);
    setBusy(form, true);
    try { await submitDownloadLead(data); } catch (err) { /* never block the download if the API is down */ }
    setBusy(form, false);
    trackDownload(data.resourceType, data.resource, data.file);
    dl.classList.add('is-done');
    $('#download-ready').focus();
  });
}

/* ---------- Catalogue: search + filters ---------- */
(() => {
  const list = $('#catalogue-list');
  if (!list) return;
  const cards = $$('[data-card]', list);
  const input = $('#catalogue-search');
  const count = $('#results-count');
  const empty = $('#results-empty');
  const filters = $('#filters');
  const boxes = $$('input[type="checkbox"]', filters);
  const params = new URLSearchParams(location.search);
  if (params.get('q')) input.value = params.get('q');
  ['category', 'form', 'application'].forEach((k) => {
    (params.get(k) || '').split(',').filter(Boolean).forEach((v) => { const b = boxes.find((x) => x.name === k && x.value === v); if (b) b.checked = true; });
  });
  let searchTimer;
  function selected(name) { return boxes.filter((b) => b.name === name && b.checked).map((b) => b.value); }
  function apply() {
    const q = input.value.trim().toLowerCase();
    const cat = selected('category'), form = selected('form'), app = selected('application');
    let n = 0;
    cards.forEach((c) => {
      const d = c.dataset;
      const ok =
        (!q || d.search.includes(q)) &&
        (!cat.length || cat.includes(d.category)) &&
        (!form.length || form.includes(d.form)) &&
        (!app.length || d.applications.split(' ').some((a) => app.includes(a)));
      c.hidden = !ok;
      if (ok) n++;
    });
    // hide category headers with no visible cards
    $$('[data-cat-block]', list).forEach((blk) => { blk.hidden = !$$('[data-card]:not([hidden])', blk).length; });
    count.textContent = n;
    empty.hidden = n !== 0;
    const p = new URLSearchParams();
    if (q) p.set('q', input.value.trim());
    if (cat.length) p.set('category', cat.join(','));
    if (form.length) p.set('form', form.join(','));
    if (app.length) p.set('application', app.join(','));
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
    if (q) { clearTimeout(searchTimer); searchTimer = setTimeout(() => track('product_search', { query: q, results: n }), 700); }
  }
  input.addEventListener('input', apply);
  $('#catalogue-search-form').addEventListener('submit', (e) => { e.preventDefault(); apply(); });
  boxes.forEach((b) => b.addEventListener('change', apply));
  $('#filters-reset').addEventListener('click', () => { boxes.forEach((b) => (b.checked = false)); input.value = ''; apply(); });
  $('#filters-toggle').addEventListener('click', () => { const open = filters.classList.toggle('is-open'); $('#filters-toggle').setAttribute('aria-expanded', open); });
  $$('[data-quick-search]').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.quickSearch; apply(); input.focus(); }));
  apply();
})();

/* ---------- Homepage application selector ---------- */
(() => {
  const root = $('#app-selector');
  if (!root) return;
  const data = JSON.parse($('#app-data').textContent);
  const tabs = $$('.app-tab', root);
  const panel = $('#app-panel');
  function render(id) {
    const app = data.applications.find((a) => a.id === id);
    tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.app === id));
    const items = app.recommended.map((s) => data.products[s]).filter(Boolean);
    panel.innerHTML = `
      <h3>${app.heading}</h3>
      <p>${app.description}</p>
      <ul class="app-panel__list">
        ${items.map((p) => `<li><a class="app-panel__item" href="${p.url}"><img src="${p.thumb}" alt="" width="64" height="44" loading="lazy"><span><strong>${p.name}</strong><small>${p.applicationSummary}</small></span></a></li>`).join('')}
      </ul>
      <div class="btn-row">
        <button class="btn btn--gold" type="button" data-quote="${app.name} – product recommendation" data-intent="info">Get product recommendation →</button>
        <a class="btn btn--outline" href="/applications/#${app.id}">See ${app.name.toLowerCase()} guide</a>
      </div>`;
  }
  tabs.forEach((t) => t.addEventListener('click', () => render(t.dataset.app)));
  render(tabs[0].dataset.app);
})();

/* ---------- Product gallery thumbnails ---------- */
(() => {
  const main = $('#pd-main-img');
  if (!main) return;
  $$('.pd__thumbs button').forEach((b) => b.addEventListener('click', () => {
    main.src = b.dataset.src;
    $$('.pd__thumbs button').forEach((x) => x.setAttribute('aria-current', x === b));
  }));
})();

/* ---------- Section reveal (one subtle entrance) ---------- */
(() => {
  const els = $$('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
})();

/* Clear a field's error state as soon as the visitor corrects it */
document.addEventListener('input', (e) => { const f = e.target.closest('.field.is-invalid, .consent.is-invalid'); if (f) f.classList.remove('is-invalid'); });
document.addEventListener('change', (e) => { const f = e.target.closest('.consent.is-invalid'); if (f) f.classList.remove('is-invalid'); });

/* ---------- WhatsApp chat widget ---------- */
(() => {
  const t = $('#wa-toggle'), box = $('#wa-box'); if (!t || !box) return;
  const set = (open) => { box.hidden = !open; t.setAttribute('aria-expanded', open); t.classList.toggle('is-open', open); if (open) track('whatsapp_widget_open'); };
  t.addEventListener('click', () => set(box.hidden));
  $('#wa-close').addEventListener('click', () => set(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) set(false); });
})();

/* ---------- Hero product carousel ---------- */
(() => {
  const root = $('#hero-carousel'); if (!root) return;
  const slides = $$('.hcar__slide', root), dots = $$('.hcar__dots button', root);
  let i = 0, timer;
  const show = (n) => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => { s.hidden = k !== i; k === i ? s.setAttribute('data-active', '') : s.removeAttribute('data-active'); }); dots.forEach((d, k) => d.setAttribute('aria-selected', k === i)); };
  const auto = () => { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show(i + 1), 5000); };
  $$('.hcar__btn', root).forEach((b) => b.addEventListener('click', () => { show(i + Number(b.dataset.dir)); auto(); }));
  dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.index)); auto(); }));
  root.addEventListener('mouseenter', () => clearInterval(timer)); root.addEventListener('mouseleave', auto);
  root.addEventListener('focusin', () => clearInterval(timer)); root.addEventListener('focusout', auto);
  auto();
})();
