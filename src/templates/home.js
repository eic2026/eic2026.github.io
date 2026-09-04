const { site } = require('../data');
const { products, featuredSlugs, hero } = require('../data');
const { categories, applications, industries } = require('../data/taxonomy');
const { resources } = require('../data/content');
const C = require('./components');

const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

// Subtle industrial pipe-run background for the hero (no stock image supplied).
// PLACEHOLDER: replace with <img src="/assets/img/hero.jpg"> once a facility photo is available.
function heroArt() {
  const pipes = [140, 260, 380, 500].map((y, i) => `
    <rect x="0" y="${y}" width="1600" height="54" fill="#2a2a2a"/>
    <rect x="0" y="${y}" width="1600" height="10" fill="#3a3a3a"/>
    <rect x="0" y="${y + 44}" width="1600" height="10" fill="#151515"/>
    ${[260, 640, 1020, 1400].map((x) => `<rect x="${x + i * 40}" y="${y - 8}" width="22" height="70" fill="#3d3d3d"/><rect x="${x + i * 40 + 22}" y="${y - 8}" width="3" height="70" fill="#D4AF37" opacity=".55"/>`).join('')}`).join('');
  return `<svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="1600" height="700" fill="#1A1A1A"/>
    <g opacity=".9">${pipes}</g>
    <g stroke="#D4AF37" stroke-width="1" opacity=".18">${[...Array(9)].map((_, i) => `<line x1="${i * 200}" y1="0" x2="${i * 200}" y2="700"/>`).join('')}</g>
  </svg>`;
}

module.exports = function home() {
  const featured = featuredSlugs.map((s) => bySlug[s]);
  const catalogue = resources.catalogue[0];
  const appData = JSON.stringify({
    applications,
    products: Object.fromEntries(products.map((p) => [p.slug, { name: p.name, url: p.url, thumb: p.thumb, applicationSummary: p.applicationSummary }])),
  });

  const body = `
<section class="hero hero--carousel">
  <div class="hero__bg">${heroArt()}</div>
  <div class="container hero__inner hero__split">
    <div>
      <span class="hero__kicker">${C.esc(hero.kicker || 'Industrial insulation & engineering materials')}</span>
      <h1>${C.esc(hero.title || 'Premium industrial insulation.')} <span>${C.esc(hero.titleAccent || 'Maximum efficiency.')}</span></h1>
      <p>${C.esc(hero.text || '')}</p>
      <div class="btn-row">
        <a class="btn btn--gold" href="/products/">Explore products ${C.icons.arrow}</a>
        <button class="btn btn--outline-light" type="button" data-quote="">Request a quote ${C.icons.arrow}</button>
        <a class="btn btn--whatsapp" href="${C.waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="hero">${C.icons.whatsapp} WhatsApp us</a>
      </div>
    </div>
    ${hero.slides.length ? `<div class="hcar" id="hero-carousel" aria-roledescription="carousel" aria-label="Featured products">
      <div class="hcar__track">
        ${hero.slides.map((sl, i) => { const p = bySlug[sl.slug]; return `<article class="hcar__slide" ${i === 0 ? 'data-active' : 'hidden'} aria-roledescription="slide" aria-label="${i + 1} of ${hero.slides.length}">
          <a class="hcar__media" href="${p.url}"><img src="${p.thumb}" alt="${C.esc(p.alt)}" width="800" height="550" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="hcar__badge">${C.esc(sl.badge || 'Available to order')}</span></a>
          <div class="hcar__body">
            <span class="pd__code">${p.code}</span>
            <h2><a href="${p.url}">${C.esc(p.name)}</a></h2>
            <p>${C.esc(sl.caption || p.applicationSummary)}</p>
            <div class="hcar__actions"><button class="btn btn--gold btn--sm" type="button" data-quote="${C.esc(p.name)}">Get quote</button><a class="btn btn--ghost btn--sm" href="${p.url}">View product</a></div>
          </div>
        </article>`; }).join('')}
      </div>
      <div class="hcar__nav">
        <button type="button" class="hcar__btn" data-dir="-1" aria-label="Previous product">${C.icons.chevron}</button>
        <div class="hcar__dots" role="tablist">${hero.slides.map((_, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-label="Show product ${i + 1}" data-index="${i}"></button>`).join('')}</div>
        <button type="button" class="hcar__btn" data-dir="1" aria-label="Next product">${C.icons.chevron}</button>
      </div>
    </div>` : ''}
  </div>
  <div class="hero__strip"><div class="container">
    ${categories.map((c) => `<a href="/products/?category=${c.id}"><span style="display:block"><strong style="color:#fff">${c.name}</strong><span>${products.filter((p) => p.category === c.id).length} products</span></span>${C.icons.chevron}</a>`).join('')}
  </div></div>
</section>

<section class="section section--tight"><div class="container">
  <div class="trust">
    <div class="trust__item">${C.icons.shield}<h3>Premium quality</h3><p>Quality-focused industrial materials</p></div>
    <div class="trust__item">${C.icons.layers}<h3>Wide product range</h3><p>Insulation and supporting materials</p></div>
    <div class="trust__item">${C.icons.support}<h3>Technical support</h3><p>Help selecting the right material</p></div>
    <div class="trust__item">${C.icons.truck}<h3>Reliable supply</h3><p>Supply coordination for industrial requirements</p></div>
  </div>
</div></section>

<section class="section" id="range"><div class="container">
  <div class="sec-head sec-head--row"><div><h2>Our product range</h2><p>Industrial insulation materials and accessories for a wide range of applications.</p></div><a class="btn btn--outline" href="/products/">All 20 products ${C.icons.arrow}</a></div>
  <div class="grid grid--3">
    ${categories.map((c) => {
      const list = products.filter((p) => p.category === c.id);
      return `<a class="ind-card" href="/products/?category=${c.id}" style="gap:14px">
        <div class="range-tiles">${list.slice(0, 4).map((p) => `<span><img src="${p.thumb}" alt="" width="800" height="550" loading="lazy"></span>`).join('')}</div>
        <h3>${c.name}</h3><p>${c.description}</p><span class="link-gold">${list.length} products ${C.icons.arrow.replace('width', 'style="width:14px;height:14px;vertical-align:-2px" width')}</span></a>`;
    }).join('')}
  </div>
</div></section>

<section class="section section--ivory"><div class="container">
  <div class="sec-head"><h2>Featured products</h2><p>Frequently requested materials across piping, HVAC and industrial insulation work.</p></div>
  <div class="grid grid--4">${featured.map((p) => C.productCard(p, { compact: true })).join('')}</div>
</div></section>

<section class="section" id="app-selector"><div class="container">
  <div class="sec-head"><h2>What are you insulating?</h2><p>Choose an application to see the materials commonly used for it, then ask EIC for a recommendation.</p></div>
  <div class="app-selector">
    <div class="app-tabs" role="tablist" aria-label="Applications">
      ${applications.map((a, i) => `<button class="app-tab" role="tab" type="button" data-app="${a.id}" aria-selected="${i === 0}">${a.name} ${C.icons.chevron}</button>`).join('')}
    </div>
    <div class="app-panel" id="app-panel" role="tabpanel" aria-live="polite"></div>
  </div>
  <script type="application/json" id="app-data">${appData.replace(/</g, '\\u003c')}</script>
</div></section>

<section class="section section--ivory"><div class="container">
  <div class="sec-head"><h2>Solutions for every industry</h2><p>Materials for the piping, equipment and HVAC systems found across these sectors.</p></div>
  <div class="ind-grid">
    ${industries.map((ind) => `<div class="ind-card"><h3>${ind.name}</h3><p>${ind.description}</p><ul>${ind.products.slice(0, 3).map((s) => `<li><a href="${bySlug[s].url}">${bySlug[s].name}</a></li>`).join('')}</ul></div>`).join('')}
  </div>
</div></section>

<section class="section section--black"><div class="container">
  <div class="sec-head"><h2>Engineered for industrial performance.</h2><p>What you can expect when you source insulation and supporting materials from EIC.</p></div>
  <div class="why-grid">
    <div class="why-item">${C.icons.layers}<h3>Product range</h3><p>A broad selection of insulation and supporting materials in one place.</p></div>
    <div class="why-item">${C.icons.support}<h3>Application support</h3><p>Help identifying the suitable material category for your application.</p></div>
    <div class="why-item">${C.icons.shield}<h3>Quality focus</h3><p>Quality-focused materials with clear product information.</p></div>
    <div class="why-item">${C.icons.chat}<h3>Reliable communication</h3><p>Direct access through phone, email and WhatsApp.</p></div>
  </div>
</div></section>

<section class="section"><div class="container">
  <div class="cta-band">
    <div><h2>Download the EIC product catalogue</h2><p>Explore our industrial insulation materials and supporting products.</p></div>
    <div class="btn-row">
      <a class="btn btn--gold" href="${catalogue.file}" data-download data-download-type="catalogue" data-download-title="${C.esc(catalogue.title)}" data-gated="true">${C.icons.download} Download catalogue</a>
      <a class="btn btn--outline-light" href="/products/">View products</a>
    </div>
  </div>
</div></section>`;

  return C.layout({
    current: '/',
    body,
    seo: {
      title: 'Industrial Insulation Materials & Cladding Supplier | Experts Industrial Corporation (EIC)',
      description: 'EIC supplies industrial insulation materials — PUF, PIR, rockwool, glass wool, NBR/EPDM, XLPE and aerogel — plus cladding, foil and installation accessories. Request a quote, call or WhatsApp.',
      path: '/',
    },
  });
};
