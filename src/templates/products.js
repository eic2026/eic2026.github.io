const { site } = require('../data');
const { products } = require('../data');
const { categories, forms, applicationTags } = require('../data/taxonomy');
const { faqGeneral, faqForProduct } = require('../data/content');
const C = require('./components');

const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

function listing() {
  const body = `
${C.pageHero({ title: 'Products', intro: 'Industrial insulation materials and accessories.', crumbs: [{ name: 'Products', href: '/products/' }] }).replace('</div></section>', `
  <form class="search-bar" id="catalogue-search-form" role="search">
    <label class="visually-hidden" for="catalogue-search">What material are you looking for?</label>
    <input id="catalogue-search" type="search" placeholder="What material are you looking for? e.g. rockwool, chilled water, cladding" autocomplete="off">
    <button class="btn btn--gold" type="submit">Search</button>
  </form>
  <div class="btn-row" style="margin-top:14px;gap:8px">${['PUF', 'PIR', 'Rockwool', 'Glass wool', 'Rubber', 'Cladding', 'Chilled water', 'HVAC'].map((q) => `<button class="btn btn--outline-light btn--sm" type="button" data-quick-search="${q.toLowerCase()}" style="text-transform:none;letter-spacing:0;font-weight:600">${q}</button>`).join('')}</div>
</div></section>`)}

<section class="section"><div class="container">
  <div class="catalogue">
    <aside class="filters" id="filters" aria-label="Filters">
      <div class="filters__head"><h2>Filters</h2><button class="btn btn--ghost btn--sm filters__toggle" id="filters-toggle" type="button" aria-expanded="false" aria-controls="filters-body">Show filters</button><button class="filters__reset" id="filters-reset" type="button">Reset</button></div>
      <div class="filters__body" id="filters-body">
        <fieldset><legend>Category</legend>${categories.map((c) => `<label><input type="checkbox" name="category" value="${c.id}"> ${c.name}</label>`).join('')}</fieldset>
        <fieldset><legend>Product form</legend>${forms.map((f) => `<label><input type="checkbox" name="form" value="${f.id}"> ${f.name}</label>`).join('')}</fieldset>
        <fieldset><legend>Application</legend>${applicationTags.map((a) => `<label><input type="checkbox" name="application" value="${a.id}"> ${a.name}</label>`).join('')}</fieldset>
      </div>
    </aside>
    <div>
      <div class="results__bar"><span>Showing <strong id="results-count">${products.length}</strong> of ${products.length} products</span><button class="btn btn--outline btn--sm" type="button" data-quote="" data-intent="info">Not sure? Ask EIC</button></div>
      <div id="catalogue-list">
        ${categories.map((c) => `<div class="cat-block" data-cat-block>
          <div class="cat-block__head"><h3 id="${c.id}">${c.name}</h3><span>${c.description}</span></div>
          <div class="grid grid--3">${products.filter((p) => p.category === c.id).map((p) => C.productCard(p)).join('')}</div>
        </div>`).join('')}
        <div class="empty" id="results-empty" hidden><h3>No products match that search</h3><p>Try a material name, an application, or reset the filters. If you can't find what you need, ask EIC directly.</p><div class="btn-row" style="justify-content:center"><button class="btn btn--gold" type="button" data-quote="" data-intent="info">Ask EIC about availability</button><a class="btn btn--outline" href="${C.waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="catalogue-empty">WhatsApp EIC</a></div></div>
      </div>
    </div>
  </div>
</div></section>

<section class="section section--ivory"><div class="container">
  <div class="sec-head"><h2>Frequently asked questions</h2></div>
  ${C.faq(faqGeneral)}
</div></section>
${C.finalCta()}`;

  const ld = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'EIC Products',
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: site.baseUrl + p.url })),
  };
  return C.layout({
    current: '/products/', body,
    seo: { title: 'Industrial Insulation Products – PUF, PIR, Rockwool, Glass Wool, Cladding | EIC', description: 'Browse 20 industrial insulation products: pipe sections, slabs, rolls, rubber and XLPE insulation, aerogel, aluminium and GI cladding, foil and installation accessories. Search by material or application.', path: '/products/' },
    extraLd: [ld, C.breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'Products', href: '/products/' }])],
  });
}

function detail(p) {
  const cat = categories.find((c) => c.id === p.category);
  const related = p.relatedProducts.map((s) => bySlug[s]).filter(Boolean);
  const faqs = faqForProduct(p);
  const spec = p.specifications.length
    ? `<table class="spec-table">${p.specifications.map((s) => `<tr><th>${C.esc(s.label)}</th><td>${C.esc(s.value)}</td></tr>`).join('')}</table>`
    : `<div class="notice">${C.icons.info}<p><strong>${C.esc(p.specNotice)}</strong>Share your size, thickness and quantity in a quote request and EIC will confirm the options available for ${C.esc(p.name)}.</p></div>`;

  const body = `
<section class="page-hero" style="padding:20px 0 0;background:var(--white);color:var(--text)"><div class="container">
  <nav aria-label="Breadcrumb"><ol class="breadcrumb" style="color:var(--text-2);margin:0"><li><a href="/">Home</a></li><li><a href="/products/">Products</a></li><li><a href="/products/?category=${cat.id}">${cat.name}</a></li><li><span aria-current="page" style="color:var(--gold-dark)">${C.esc(p.name)}</span></li></ol></nav>
</div></section>

<section class="section section--tight" data-product-slug="${p.slug}" data-product-name="${C.esc(p.name)}"><div class="container">
  <div class="pd">
    <div class="pd__gallery">
      <div class="pd__main"><img id="pd-main-img" src="${p.image}" alt="${C.esc(p.alt)}" width="1600" height="1100" fetchpriority="high" decoding="async"></div>
      ${p.gallery.length > 1 ? `<div class="pd__thumbs">${p.gallery.map((g, i) => `<button type="button" data-src="${g}" aria-current="${i === 0}" aria-label="View image ${i + 1}"><img src="${g}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
    </div>
    <div class="pd__info">
      <span class="pd__code">${p.code} · ${cat.name}</span>
      <h1>${C.esc(p.name)}</h1>
      <p class="lead">${C.esc(p.shortDescription)}</p>
      <dl class="pd__facts"><div><dt>Material</dt><dd>${C.esc(p.material)}</dd></div><div><dt>Primary use</dt><dd>${C.esc(p.applicationSummary)}</dd></div></dl>
      <div class="pd__lists">
        <div><h2>Applications</h2><ul class="check-list">${p.applications.map((a) => `<li>${C.esc(a)}</li>`).join('')}</ul></div>
        <div><h2>Features</h2><ul class="check-list">${p.features.map((f) => `<li>${C.esc(f)}</li>`).join('')}</ul></div>
      </div>
      <div class="pd__cta">
        <button class="btn btn--gold" type="button" data-quote="${C.esc(p.name)}">Request a quote ${C.icons.arrow}</button>
        <a class="btn btn--black" href="${C.telHref}" data-track="call_click" data-label="product">${C.icons.phone} Call now</a>
        <a class="btn btn--whatsapp" href="${C.waHref(p.name)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="product">${C.icons.whatsapp} WhatsApp</a>
        <a class="btn btn--outline pd__download" href="${p.downloadableResources[0].file}" download data-download data-download-type="product_document" data-download-title="${C.esc(p.downloadableResources[0].title)}" data-gated="false">${C.icons.download} Download product information</a>
      </div>
      <p class="pd__email">Or email your requirement to <a href="${C.mailHref(`Enquiry: ${p.name}`)}" data-track="email_click" data-label="product">${site.email}</a></p>
    </div>
  </div>
</div></section>

<section class="section section--tight" style="padding-top:0"><div class="container">
  <nav class="pd-tabs" aria-label="Product sections">
    <a href="#overview">Overview</a><a href="#applications">Applications</a><a href="#features">Key features</a><a href="#specifications">Specifications</a><a href="#downloads">Downloads</a><a href="#related">Related</a><a href="#faq">FAQ</a>
  </nav>
  <div class="pd-section" id="overview"><h2>Product overview</h2><p>${C.esc(p.description)}</p></div>
  <div class="pd-section" id="applications"><h2>Applications</h2><ul class="check-list">${p.applications.map((a) => `<li>${C.esc(a)}</li>`).join('')}</ul></div>
  <div class="pd-section" id="features"><h2>Key features</h2><ul class="check-list">${p.features.map((f) => `<li>${C.esc(f)}</li>`).join('')}</ul></div>
  <div class="pd-section" id="specifications"><h2>Available options / specifications</h2>${spec}${p.options.length ? `<ul class="check-list" style="margin-top:16px">${p.options.map((o) => `<li>${C.esc(o)}</li>`).join('')}</ul>` : ''}</div>
  <div class="pd-section" id="downloads"><h2>Downloads</h2><div class="doc-list">${p.downloadableResources.map((d) => C.docCard({ ...d, gated: d.type === 'catalogue' })).join('')}</div></div>
  <div class="pd-section" id="related"><h2>Related products</h2><div class="grid grid--4">${related.map((r) => C.productCard(r, { compact: true })).join('')}</div></div>
  <div class="pd-section" id="faq"><h2>Frequently asked questions</h2>${C.faq(faqs, 'faq-list')}</div>
</div></section>
${C.finalCta({ title: `Need ${p.name.toLowerCase()} for your project?`, text: 'Send your size, quantity and delivery location and EIC will respond with availability and pricing.', product: p.name })}`;

  const productLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.code, description: p.shortDescription,
    image: site.baseUrl + p.image, category: cat.name, material: p.material,
    brand: { '@type': 'Organization', name: site.name },
    offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceSpecification: { '@type': 'PriceSpecification', description: 'Price on request' }, seller: { '@type': 'Organization', name: site.name } },
  };
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  return C.layout({
    current: '/products/', body,
    seo: {
      title: `${p.name} – ${p.applicationSummary} | EIC`,
      description: `${p.shortDescription} Applications: ${p.applications.join(', ')}. Request a quote, call or WhatsApp Experts Industrial Corporation.`,
      path: p.url, ogImage: p.image,
    },
    extraLd: [productLd, faqLd, C.breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'Products', href: '/products/' }, { name: cat.name, href: `/products/?category=${cat.id}` }, { name: p.name, href: p.url }])],
  });
}

module.exports = { listing, detail };
