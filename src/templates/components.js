const { site } = require('../data');
const { categories } = require('../data/taxonomy');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const catName = (id) => (categories.find((c) => c.id === id) || {}).name || '';

const icons = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6.2 6.2l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/></svg>',
  support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
};

/* Official EIC logo (public/assets/img/logo-600.png). On dark surfaces it sits on a white plate. */
function logo(light = false) {
  return `<a class="logo${light ? ' logo--light' : ''}" href="/" aria-label="${esc(site.name)} – home">
    <img src="/assets/img/logo-horizontal.png" alt="EIC – Experts Industrial Corporation" width="1100" height="300" decoding="async">
  </a>`;
}

const waHref = (product) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage(product))}`;
const telHref = `tel:${site.phoneTel}`;
const mailHref = (subject) => `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

function header(current) {
  const navLinks = site.nav.map((n) => `<a href="${n.href}"${n.href === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('');
  return `<header class="header">
  <div class="container header__inner">
    ${logo()}
    <nav class="nav" aria-label="Primary">${navLinks}</nav>
    <div class="header__cta">
      <a class="header__call" href="${telHref}" data-track="call_click" data-label="header"><small>Call now</small><strong>${site.phoneDisplay}</strong></a>
      <button class="btn btn--gold" type="button" data-quote="">Get a quote ${icons.arrow}</button>
    </div>
    <div class="header__mobile">
      <a class="icon-btn" href="${telHref}" aria-label="Call EIC" data-track="call_click" data-label="header-mobile">${icons.phone}</a>
      <a class="icon-btn" href="${waHref()}" target="_blank" rel="noopener" aria-label="WhatsApp EIC" data-track="whatsapp_click" data-label="header-mobile">${icons.whatsapp}</a>
      <button class="icon-btn" id="menu-btn" type="button" aria-label="Open menu" aria-controls="drawer" aria-expanded="false">${icons.menu}</button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer__backdrop"></div>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="drawer__top">${logo(true)}<button class="icon-btn" id="drawer-close" type="button" aria-label="Close menu">${icons.close}</button></div>
    <nav class="drawer__nav" aria-label="Mobile">${navLinks}</nav>
    <div class="drawer__contact">
      <button class="btn btn--gold" type="button" data-quote="">Get a quote ${icons.arrow}</button>
      <a class="btn btn--outline-light" href="${telHref}" data-track="call_click" data-label="drawer">${icons.phone} Call ${site.phoneDisplay}</a>
      <a class="btn btn--whatsapp" href="${waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="drawer">${icons.whatsapp} Chat on WhatsApp</a>
      <a class="drawer__email" href="${mailHref()}" data-track="email_click" data-label="drawer">${site.email}</a>
    </div>
  </div>
</div>`;
}

/* Floating WhatsApp chat widget (bottom-left). Opens wa.me with a prefilled message. */
function whatsappWidget() {
  const msg = site.whatsappWidgetMessage || 'I WANT TO KNOW MORE ABOUT YOUR PRODUCT';
  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
  return `<div class="wa-widget" id="wa-widget">
    <div class="wa-widget__box" id="wa-box" role="dialog" aria-label="Chat with Experts Industrial Corporation on WhatsApp" hidden>
      <div class="wa-widget__head">
        <span class="wa-widget__avatar"><img src="/assets/img/logo-600.png" alt="" width="40" height="35"></span>
        <span class="wa-widget__title"><strong>Experts Industrial Corp</strong><small>Typically replies within a few hours</small></span>
        <button class="wa-widget__close" type="button" id="wa-close" aria-label="Close chat">${icons.close}</button>
      </div>
      <div class="wa-widget__body">
        <div class="wa-widget__bubble"><small>Experts Industrial Corp</small>Hello! Welcome to Experts Industrial Corporation. Tell us the material, size and quantity you need and we will get back to you.</div>
      </div>
      <div class="wa-widget__foot">
        <span class="wa-widget__msg">${msg}</span>
        <a class="btn btn--whatsapp btn--block" href="${href}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="chat-widget">${icons.whatsapp} Start chat</a>
      </div>
    </div>
    <button class="wa-widget__btn" type="button" id="wa-toggle" aria-expanded="false" aria-controls="wa-box" aria-label="Chat on WhatsApp">${icons.whatsapp}</button>
  </div>`;
}

function stickyCta() {
  return `<nav class="sticky-cta" aria-label="Quick contact">
    <a href="${waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="sticky">${icons.whatsapp} WhatsApp</a>
    <a href="${telHref}" data-track="call_click" data-label="sticky">${icons.phone} Call</a>
    <a href="#" data-quote="">${icons.arrow} Get quote</a>
  </nav>`;
}

function footer() {
  return `<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        ${logo(true)}
        <p style="margin-top:18px"><strong style="color:#fff;display:block;letter-spacing:.06em">EXPERTS INDUSTRIAL CORPORATION</strong>${esc(site.tagline)}</p>
        <div class="btn-row" style="margin-top:8px"><button class="btn btn--gold btn--sm" type="button" data-quote="">Get a quote</button><a class="btn btn--outline-light btn--sm" href="/resources/">Download catalogue</a></div>
      </div>
      <div><h3>Quick links</h3><ul>${site.nav.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}</ul></div>
      <div><h3>Products</h3><ul>${site.footerProducts.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}</ul></div>
      <div><h3>Contact</h3>
        <ul class="footer__contact">
          <li>${icons.phone}<a href="${telHref}" data-track="call_click" data-label="footer">${site.phoneDisplay}</a></li>
          <li>${icons.whatsapp}<a href="${waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="footer">WhatsApp: ${site.phoneDisplay}</a></li>
          <li>${icons.mail}<a href="${mailHref()}" data-track="email_click" data-label="footer">${site.email}</a></li>
        </ul>
        ${site.address ? `<p style="margin-top:12px">${esc(site.address)}</p>` : ''}
      </div>
    </div>
    <div class="footer__bottom"><span>© ${new Date().getFullYear()} ${esc(site.name)}. All rights reserved.</span>${site.developedBy && site.developedBy.name ? `<span>Developed by ${site.developedBy.url ? `<a href="${esc(site.developedBy.url)}" target="_blank" rel="noopener" style="color:var(--gold)">${esc(site.developedBy.name)}</a>` : esc(site.developedBy.name)}</span>` : ''}</div>
  </div>
</footer>`;
}

function productCard(p, { compact = false } = {}) {
  return `<article class="pcard" data-card data-category="${p.category}" data-form="${p.form}" data-applications="${p.applicationTags.join(' ')}" data-search="${esc([p.name, p.material, p.shortDescription, p.applicationSummary, catName(p.category), ...p.applications, ...p.searchKeywords].join(' ').toLowerCase())}">
  <div class="pcard__media"><img src="${p.thumb}" alt="${esc(p.alt)}" width="800" height="550" loading="lazy" decoding="async"><span class="pcard__code">${p.code}</span></div>
  <div class="pcard__body">
    <span class="pcard__cat">${catName(p.category)}</span>
    <h3><a href="${p.url}">${esc(p.name)}</a></h3>
    <p>${esc(p.shortDescription)}</p>
    ${compact ? '' : `<div class="pcard__tags">${p.applications.slice(0, 3).map((a) => `<span class="tag">${esc(a)}</span>`).join('')}</div>`}
    <div class="pcard__actions">
      <a class="btn btn--outline" href="${p.url}">View product ${icons.arrow}</a>
      <button class="btn btn--gold" type="button" data-quote="${esc(p.name)}">Get quote</button>
    </div>
  </div>
</article>`;
}

function docCard(d, { card = false } = {}) {
  const attrs = `href="${d.file}" data-download data-download-type="${d.type}" data-download-title="${esc(d.title)}" data-gated="${d.gated ? 'true' : 'false'}"${d.gated ? '' : ' download'}`;
  if (card) {
    return `<article class="res-card"><span class="doc__icon">${icons.doc}</span><h3>${esc(d.title)}</h3><p>${esc(d.description || '')}</p><a class="btn btn--black btn--sm" ${attrs}>${icons.download} Download PDF</a></article>`;
  }
  return `<div class="doc"><span class="doc__icon">${icons.doc}</span><div class="doc__body"><strong>${esc(d.title)}</strong><span>PDF document</span></div><a class="btn btn--black btn--sm" ${attrs}>${icons.download} Download PDF</a></div>`;
}

function faq(items, id = 'faq') {
  return `<div class="faq" id="${id}">${items.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`;
}

function enquiryFields({ productReadonly = true, includeProduct = true } = {}) {
  return `
    ${includeProduct ? `<div class="field"><label for="eq-product">Product</label><input id="eq-product" name="product" ${productReadonly ? 'readonly' : ''} value=""></div>` : ''}
    <div class="form__row">
      <div class="field"><label for="eq-name">Name <span class="req" aria-hidden="true">*</span></label><input id="eq-name" name="name" required autocomplete="name"><span class="field__error">Please enter your name.</span></div>
      <div class="field"><label for="eq-company">Company name</label><input id="eq-company" name="company" autocomplete="organization"></div>
    </div>
    <div class="form__row">
      <div class="field"><label for="eq-mobile">Mobile number <span class="req" aria-hidden="true">*</span></label><input id="eq-mobile" name="mobile" type="tel" required inputmode="tel" autocomplete="tel"><span class="field__error">Please enter a valid mobile number.</span></div>
      <div class="field"><label for="eq-email">Email</label><input id="eq-email" name="email" type="email" autocomplete="email"><span class="field__error">Please enter a valid email.</span></div>
    </div>
    <div class="form__row">
      <div class="field"><label for="eq-city">City</label><input id="eq-city" name="city" autocomplete="address-level2"></div>
      <div class="field"><label for="eq-qty">Quantity</label><input id="eq-qty" name="quantity" placeholder="e.g. 500 m, 200 sheets"></div>
    </div>
    <div class="form__row">
      <div class="field"><label for="eq-spec">Required size / specification</label><input id="eq-spec" name="specification" placeholder="e.g. 50 mm NB, 25 mm thick"></div>
      <div class="field"><label for="eq-app">Application</label><input id="eq-app" name="application" placeholder="e.g. chilled water piping"></div>
    </div>
    <div class="field"><label for="eq-msg">Message</label><textarea id="eq-msg" name="message"></textarea></div>
    <label class="consent"><input type="checkbox" name="consent" value="yes" required><span>I agree to be contacted by Experts Industrial Corporation regarding this enquiry.</span></label>
    <div class="form__status" role="alert"></div>`;
}

function enquiryModal() {
  return `<div class="modal" id="enquiry-modal" aria-hidden="true">
  <div class="modal__backdrop" data-close></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
    <div class="modal__head"><div><h2 id="enquiry-title">Request a quote</h2><p>Share your requirement and EIC will get back to you with availability and pricing.</p></div><button class="icon-btn" type="button" data-close aria-label="Close">${icons.close}</button></div>
    <form class="form modal__form" novalidate>
      <input type="hidden" name="intent" id="eq-intent" value="quote">
      ${enquiryFields()}
      <button class="btn btn--gold btn--block" type="submit">Submit enquiry ${icons.arrow}</button>
      <p class="muted" style="font-size:13px;margin:0;text-align:center">Prefer to talk? <a href="${telHref}" data-track="call_click" data-label="modal" style="font-weight:700">Call ${site.phoneDisplay}</a> or <a href="${waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="modal" style="font-weight:700">WhatsApp</a>.</p>
    </form>
    <div class="modal__success">${icons.check}<h3>Enquiry received</h3><p>Thank you. EIC will contact you on the details you provided.</p><p id="enquiry-ref" class="muted" style="font-size:13px"></p><div class="btn-row" style="justify-content:center"><a class="btn btn--whatsapp" href="${waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="modal-success">${icons.whatsapp} Continue on WhatsApp</a><button class="btn btn--outline" type="button" data-close>Close</button></div></div>
  </div>
</div>`;
}

function downloadModal() {
  return `<div class="modal" id="download-modal" aria-hidden="true">
  <div class="modal__backdrop" data-close></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="download-title">
    <div class="modal__head"><div><h2 id="download-title">Download document</h2><p><span id="download-name"></span> — enter your details and the PDF will be ready to download.</p></div><button class="icon-btn" type="button" data-close aria-label="Close">${icons.close}</button></div>
    <form class="form modal__form" novalidate>
      <input type="hidden" name="resource" id="dl-resource"><input type="hidden" name="file" id="dl-file"><input type="hidden" name="resourceType" id="dl-type">
      <div class="form__row">
        <div class="field"><label for="dl-name">Name <span class="req" aria-hidden="true">*</span></label><input id="dl-name" name="name" required autocomplete="name"><span class="field__error">Please enter your name.</span></div>
        <div class="field"><label for="dl-company">Company</label><input id="dl-company" name="company" autocomplete="organization"></div>
      </div>
      <div class="form__row">
        <div class="field"><label for="dl-mobile">Mobile <span class="req" aria-hidden="true">*</span></label><input id="dl-mobile" name="mobile" type="tel" required inputmode="tel" autocomplete="tel"><span class="field__error">Please enter a valid mobile number.</span></div>
        <div class="field"><label for="dl-email">Email</label><input id="dl-email" name="email" type="email" autocomplete="email"><span class="field__error">Please enter a valid email.</span></div>
      </div>
      <label class="consent"><input type="checkbox" name="consent" value="yes" required><span>I agree to be contacted by Experts Industrial Corporation regarding this enquiry.</span></label>
      <div class="form__status" role="alert"></div>
      <button class="btn btn--gold btn--block" type="submit">Get download link ${icons.arrow}</button>
    </form>
    <div class="modal__success">${icons.check}<h3>Your document is ready.</h3><p>Click below to download the PDF.</p><a class="btn btn--gold" id="download-ready" href="#" download>${icons.download} Download now</a></div>
  </div>
</div>`;
}

/** SEO head + JSON-LD */
function head({ title, description, path, ogImage, jsonLd = [], noindex = false }) {
  const url = site.baseUrl.replace(/\/$/, '') + path;
  const img = site.baseUrl.replace(/\/$/, '') + (ogImage || '/assets/img/og-default.png');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1A1A1A">
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WVQL88LM');</script>
<!-- End Google Tag Manager -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9YLVDEZBHX"></script>
<script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-9YLVDEZBHX');</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/main.css">
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>`;
}

function organizationLd() {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', name: site.name, alternateName: site.shortName, url: site.baseUrl, email: site.email, telephone: site.phoneTel,
    logo: site.baseUrl + '/assets/img/logo.svg',
    contactPoint: [{ '@type': 'ContactPoint', telephone: site.phoneTel, contactType: 'sales', email: site.email, availableLanguage: ['en', 'hi'] }],
  };
}
function breadcrumbLd(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: site.baseUrl + it.href })) };
}

function layout({ current, body, seo, extraLd = [] }) {
  return `${head({ ...seo, jsonLd: [organizationLd(), ...extraLd] })}
<body class="has-sticky">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WVQL88LM" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<a class="skip-link" href="#main">Skip to content</a>
${header(current)}
<main id="main">
${body}
</main>
${footer()}
${stickyCta()}
${enquiryModal()}
${downloadModal()}
${whatsappWidget()}
<script src="/assets/js/config.js"></script>
<script type="module" src="/assets/js/main.js"></script>
</body>
</html>`;
}

function pageHero({ title, intro, crumbs = [] }) {
  return `<section class="page-hero"><div class="container">
    ${crumbs.length ? `<nav aria-label="Breadcrumb"><ol class="breadcrumb"><li><a href="/">Home</a></li>${crumbs.map((c, i) => `<li>${i === crumbs.length - 1 ? `<span aria-current="page">${esc(c.name)}</span>` : `<a href="${c.href}">${esc(c.name)}</a>`}</li>`).join('')}</ol></nav>` : ''}
    <h1>${title}</h1>${intro ? `<p>${esc(intro)}</p>` : ''}
  </div></section>`;
}

function finalCta({ title = 'Need help choosing the right material?', text = 'Send your requirement, call, or WhatsApp EIC and speak directly about sizes, quantities and availability.', product = '' } = {}) {
  return `<section class="section section--black"><div class="container">
    <div class="cta-band" style="border:0;padding:0">
      <div><h2>${esc(title)}</h2><p>${esc(text)}</p></div>
      <div class="btn-row">
        <button class="btn btn--gold" type="button" data-quote="${esc(product)}">Request a quote ${icons.arrow}</button>
        <a class="btn btn--outline-light" href="${telHref}" data-track="call_click" data-label="final-cta">${icons.phone} Call EIC</a>
        <a class="btn btn--whatsapp" href="${waHref(product)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="final-cta">${icons.whatsapp} WhatsApp EIC</a>
      </div>
    </div>
  </div></section>`;
}

module.exports = { esc, icons, logo, whatsappWidget, waHref, telHref, mailHref, header, footer, stickyCta, productCard, docCard, faq, enquiryFields, enquiryModal, downloadModal, head, layout, pageHero, finalCta, organizationLd, breadcrumbLd, catName };
