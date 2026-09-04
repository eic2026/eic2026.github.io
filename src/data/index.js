/* Content loader — single entry point used by all templates.
   content/content.json is the source of truth (edited via /admin/). JS files hold nav + taxonomy (code-level config). */
const fs = require('fs');
const path = require('path');
const siteBase = require('./site');
const taxonomy = require('./taxonomy');

const SPEC_NOTICE = 'Contact EIC for available specifications.';
const file = path.join(__dirname, '../../content/content.json');
const content = JSON.parse(fs.readFileSync(file, 'utf8'));

const site = { ...siteBase, ...content.site };
site.phoneTel = site.phoneTel || '+91' + site.phone;
site.whatsapp = site.whatsapp || '91' + site.phone;
site.phoneDisplay = site.phoneDisplay || site.phone;
site.whatsappMessage = (product) => product ? `Hello EIC, I would like an enquiry on ${product}.` : 'Hello EIC, I would like to enquire about industrial insulation materials.';

const products = content.products.filter((p) => p.active !== false).map((p) => {
  const o = { ...p };
  o.image = o.image || `/assets/img/products/${o.slug}.webp`;
  o.thumb = o.thumb || (o.image.includes('/products/') ? o.image.replace('/products/', '/products/thumb/') : o.image);
  o.gallery = o.gallery && o.gallery.length ? o.gallery : [o.image];
  o.alt = o.alt || `${o.name} – ${o.shortDescription}`;
  o.url = `/products/${o.slug}/`;
  o.specifications = o.specifications || [];
  o.options = o.options || [];
  o.applicationTags = o.applicationTags || [];
  o.relatedProducts = o.relatedProducts || [];
  o.searchKeywords = o.searchKeywords || [];
  o.downloadableResources = [
    { title: `${o.name} – Product Information`, file: `/downloads/products/${o.slug}.pdf`, type: 'product_document' },
    { title: 'EIC Product Catalogue', file: '/downloads/eic-product-catalogue.pdf', type: 'catalogue' },
  ];
  o.specNotice = SPEC_NOTICE;
  return o;
});

const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
const featuredSlugs = (content.featuredSlugs || []).filter((s) => bySlug[s]);
const hero = content.hero || {};
hero.slides = (hero.slides || []).filter((s) => bySlug[s.slug]);

module.exports = { site, products, bySlug, featuredSlugs, hero, taxonomy, SPEC_NOTICE, raw: content };
