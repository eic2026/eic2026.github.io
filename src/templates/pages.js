const { site } = require('../data');
const { products } = require('../data');
const { categories, applications, industries } = require('../data/taxonomy');
const { faqGeneral, resources } = require('../data/content');
const C = require('./components');

const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
const mini = (p) => `<a class="mini" href="${p.url}"><img src="${p.thumb}" alt="" width="80" height="55" loading="lazy"><span><strong>${C.esc(p.name)}</strong><small>${C.esc(p.applicationSummary)}</small></span></a>`;

/* ---------------- ABOUT ---------------- */
function about() {
  const body = `
${C.pageHero({ title: 'About Experts Industrial Corporation', intro: 'Industrial insulation and engineering material solutions for industrial applications.', crumbs: [{ name: 'About Us', href: '/about/' }] })}
<section class="section"><div class="container">
  <div class="about-grid">
    <div class="about-block"><h2>Our approach</h2>
      <p>EIC supplies insulation and supporting materials for piping, HVAC, refrigeration, equipment and industrial applications, and helps buyers identify the material category that suits their requirement before they order.</p>
      <p><em>[PLACEHOLDER – replace with EIC's own description of how the business works: sourcing, order handling and delivery coordination.]</em></p>
    </div>
    <div class="about-block"><h2>Product range</h2>
      <p>${categories.map((c) => `<strong>${c.name}:</strong> ${c.description}`).join('<br><br>')}</p>
      <p><a class="link-gold" href="/products/">See all ${products.length} products →</a></p>
    </div>
    <div class="about-block"><h2>Application support</h2>
      <p>Not every requirement arrives with a specification. EIC can help narrow down the suitable material type for chilled water, hot service, ducting, equipment and cladding work, and confirm what sizes and options are available.</p>
      <p><em>[PLACEHOLDER – add details of the technical support EIC offers, if any, such as site visits or material take-off support.]</em></p>
    </div>
    <div class="about-block"><h2>Customer service</h2>
      <p>Enquiries are handled directly by phone, WhatsApp and email. Quote requests submitted through the website are followed up by the EIC sales team.</p>
      <p><em>[PLACEHOLDER – add working hours, service areas and delivery regions when confirmed.]</em></p>
    </div>
  </div>
  <div class="placeholder-note" style="margin-top:24px"><strong>Editor's note:</strong> company history, founding year, team size, certifications and project references have intentionally been left out. Add them here only when the information is confirmed.</div>
</div></section>
<section class="section section--ivory"><div class="container">
  <div class="sec-head"><h2>Contact EIC</h2><p>Reach the sales team directly for materials, sizes, quantities and availability.</p></div>
  <div class="contact-cards contact-cards--3">
    <a class="contact-card" href="${C.telHref}" data-track="call_click" data-label="about">${C.icons.phone}<span><small>Phone</small><strong>${site.phoneDisplay}</strong></span></a>
    <a class="contact-card" href="${C.waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="about">${C.icons.whatsapp}<span><small>WhatsApp</small><strong>${site.phoneDisplay}</strong></span></a>
    <a class="contact-card" href="${C.mailHref()}" data-track="email_click" data-label="about">${C.icons.mail}<span><small>Email</small><strong>${site.email}</strong></span></a>
  </div>
</div></section>
${C.finalCta()}`;
  return C.layout({ current: '/about/', body, seo: { title: 'About EIC – Industrial Insulation & Engineering Materials Supplier', description: 'Experts Industrial Corporation supplies industrial insulation, cladding and installation accessories with application support and direct sales contact.', path: '/about/' }, extraLd: [C.breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'About Us', href: '/about/' }])] });
}

/* ---------------- INDUSTRIES ---------------- */
function industriesPage() {
  const body = `
${C.pageHero({ title: 'Solutions for every industry', intro: 'Insulation, cladding and accessories for the piping, equipment and HVAC systems found across industrial and commercial sectors.', crumbs: [{ name: 'Industries', href: '/industries/' }] })}
<section class="section"><div class="container">
  <div class="ind-grid">
    ${industries.map((ind) => `<div class="ind-card" id="${ind.id}"><h3>${ind.name}</h3><p>${ind.description}</p><ul>${ind.products.map((s) => `<li><a href="${bySlug[s].url}">${bySlug[s].name}</a></li>`).join('')}</ul><div class="btn-row" style="margin-top:12px"><button class="btn btn--gold btn--sm" type="button" data-quote="${C.esc(ind.name)} requirement">Request a quote</button></div></div>`).join('')}
  </div>
  <p class="muted" style="margin-top:24px;font-size:14px">Products listed are the material types commonly used in each sector. Contact EIC for product-specific recommendations and available specifications.</p>
</div></section>
${C.finalCta()}`;
  return C.layout({ current: '/industries/', body, seo: { title: 'Industries Served – HVAC, Manufacturing, Process, Power, Pharma | EIC', description: 'Industrial insulation materials for HVAC & refrigeration, manufacturing, chemical & process plants, power, food, pharmaceutical, commercial buildings, piping and infrastructure.', path: '/industries/' }, extraLd: [C.breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'Industries', href: '/industries/' }])] });
}

/* ---------------- APPLICATIONS ---------------- */
function applicationsPage() {
  const body = `
${C.pageHero({ title: 'What are you insulating?', intro: 'A guide to the material types commonly used for each application, with the accessories needed to install and finish them.', crumbs: [{ name: 'Applications', href: '/applications/' }] })}
<section class="section section--ivory" style="padding-bottom:0"><div class="container">
  <nav class="pd-tabs" aria-label="Applications" style="border-color:var(--gold)">${applications.map((a) => `<a href="#${a.id}">${a.name}</a>`).join('')}</nav>
</div></section>
<section class="section section--ivory" style="padding-top:0"><div class="container">
  ${applications.map((a) => `<div class="app-block" id="${a.id}">
    <div><h2>${a.name}</h2><p><strong style="color:var(--text)">${a.heading}.</strong> ${a.description}</p><div class="btn-row"><button class="btn btn--gold btn--sm" type="button" data-quote="${C.esc(a.name)} – product recommendation" data-intent="info">Get product recommendation →</button></div></div>
    <div class="grid grid--2">${a.recommended.map((s) => mini(bySlug[s])).join('')}</div>
  </div>`).join('')}
</div></section>
<section class="section"><div class="container">
  <div class="sec-head"><h2>Frequently asked questions</h2></div>
  ${C.faq(faqGeneral)}
</div></section>
${C.finalCta()}`;
  return C.layout({ current: '/applications/', body, seo: { title: 'Insulation by Application – Piping, Equipment, Tanks, Ducts, HVAC, Refrigeration | EIC', description: 'Find the insulation materials commonly used for piping, equipment, tanks, ducts, HVAC, refrigeration, process systems and industrial applications.', path: '/applications/' }, extraLd: [C.breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'Applications', href: '/applications/' }])] });
}

/* ---------------- RESOURCES ---------------- */
function resourcesPage() {
  const productDocs = products.map((p) => ({ title: `${p.name} – Product Information`, description: p.shortDescription, file: p.downloadableResources[0].file, type: 'product_document', gated: false }));
  const group = (title, id, items) => `<div class="res-group" id="${id}"><h2>${title}</h2><div class="res-grid">${items.map((d) => C.docCard(d, { card: true })).join('')}</div></div>`;
  const body = `
${C.pageHero({ title: 'Resources', intro: 'Download the EIC product catalogue, product information sheets and company information.', crumbs: [{ name: 'Resources', href: '/resources/' }] })}
<section class="section"><div class="container">
  ${group('Product catalogue', 'catalogue', resources.catalogue)}
  ${group('Technical information', 'technical', resources.technical)}
  ${group('Product documents', 'documents', productDocs)}
  ${group('Company information', 'company', resources.company)}
  <p class="muted" style="margin-top:32px;font-size:14px">Product documents contain application and feature information. Technical specifications are supplied on request — contact EIC for available specifications.</p>
</div></section>
${C.finalCta({ title: 'Need a document that isn\'t listed?', text: 'Ask EIC for product-specific information, available sizes and options.' })}`;
  return C.layout({ current: '/resources/', body, seo: { title: 'Downloads – EIC Product Catalogue & Product Information Sheets', description: 'Download the Experts Industrial Corporation product catalogue, material selection guide, product information sheets and company information as PDF.', path: '/resources/' }, extraLd: [C.breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'Resources', href: '/resources/' }])] });
}

/* ---------------- CONTACT ---------------- */
function contact() {
  const body = `
${C.pageHero({ title: "Let's discuss your requirement", intro: 'Call, WhatsApp, email or send an enquiry — the EIC sales team will respond with availability and pricing.', crumbs: [{ name: 'Contact', href: '/contact/' }] })}
<section class="section"><div class="container">
  <div class="contact-grid">
    <div>
      <div class="contact-cards">
        <a class="contact-card" href="${C.telHref}" data-track="call_click" data-label="contact">${C.icons.phone}<span><small>Phone</small><strong>${site.phoneDisplay}</strong><p>Call EIC for immediate assistance.</p></span></a>
        <a class="contact-card" href="${C.waHref()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-label="contact">${C.icons.whatsapp}<span><small>WhatsApp</small><strong>${site.phoneDisplay}</strong><p>Send photos, drawings or a material list.</p></span></a>
        <a class="contact-card" href="${C.mailHref('Enquiry')}" data-track="email_click" data-label="contact">${C.icons.mail}<span><small>Email</small><strong>${site.email}</strong><p>For formal enquiries and documents.</p></span></a>
      </div>
      ${site.address ? `<div class="contact-card" style="margin-top:12px"><span><small>Address</small><strong style="font-size:15px">${C.esc(site.address)}</strong></span></div>` : `<div class="placeholder-note" style="margin-top:12px"><strong>Address:</strong> add the business address in <code>src/data/site.js</code> when confirmed. No map or address is shown until then.</div>`}
    </div>
    <div class="form-card">
      <h2>Send an enquiry</h2>
      <p>Share the product, size and quantity you need. Fields marked * are required.</p>
      <form class="form" id="contact-form" novalidate>
        ${C.enquiryFields({ productReadonly: false }).replace('<input id="eq-product" name="product"  value="">', '<input id="eq-product" name="product" placeholder="e.g. Rockwool Pipe Sections" list="product-list"><datalist id="product-list">' + products.map((p) => `<option value="${C.esc(p.name)}">`).join('') + '</datalist>')}
        <button class="btn btn--gold btn--block" type="submit">Submit enquiry ${C.icons.arrow}</button>
      </form>
    </div>
  </div>
</div></section>
<section class="section section--ivory"><div class="container">
  <div class="sec-head"><h2>Frequently asked questions</h2></div>
  ${C.faq(faqGeneral)}
</div></section>`;
  return C.layout({ current: '/contact/', body, seo: { title: 'Contact EIC – Call, WhatsApp or Send an Enquiry', description: `Contact Experts Industrial Corporation on ${site.phoneDisplay} (call or WhatsApp) or ${site.email} for industrial insulation materials, quotes and availability.`, path: '/contact/' }, extraLd: [C.breadcrumbLd([{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact/' }])] });
}

function notFound() {
  const body = `<section class="section"><div class="container" style="text-align:center;padding-top:40px;padding-bottom:40px"><span class="pd__code">404</span><h1 style="text-transform:uppercase">Page not found</h1><p class="lead" style="margin:16px auto 28px">The page you're looking for isn't here. Try the product catalogue or contact EIC directly.</p><div class="btn-row" style="justify-content:center"><a class="btn btn--gold" href="/products/">View products</a><a class="btn btn--outline" href="/contact/">Contact EIC</a></div></div></section>`;
  return C.layout({ current: '', body, seo: { title: 'Page not found | EIC', description: 'Page not found.', path: '/404.html', noindex: true } });
}

module.exports = { about, industriesPage, applicationsPage, resourcesPage, contact, notFound };
