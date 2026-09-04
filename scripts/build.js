#!/usr/bin/env node
/* Static build: src/data + src/templates → dist/
   Usage: node scripts/build.js   (or `npm run build`)
   Output is plain HTML/CSS/JS — deploy dist/ to Vercel, Netlify, Cloudflare Pages, GitHub Pages or any static host. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const { site, products } = require('../src/data');

const home = require('../src/templates/home');
const { listing, detail } = require('../src/templates/products');
const pages = require('../src/templates/pages');

function write(rel, html) {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
copyDir(path.join(root, 'public'), dist);

// Sanity: every product must have an image.
for (const p of products) {
  const img = path.join(root, 'public', p.image);
  if (!fs.existsSync(img)) console.warn(`⚠ missing image for ${p.name}: ${p.image}`);
}

const routes = [
  ['index.html', home()],
  ['products/index.html', listing()],
  ['about/index.html', pages.about()],
  ['industries/index.html', pages.industriesPage()],
  ['applications/index.html', pages.applicationsPage()],
  ['resources/index.html', pages.resourcesPage()],
  ['contact/index.html', pages.contact()],
  ['404.html', pages.notFound()],
  ...products.map((p) => [`products/${p.slug}/index.html`, detail(p)]),
];
routes.forEach(([rel, html]) => write(rel, html));

// Search index / headless consumers (e.g. a future app or CRM product picker)
write('products.json', JSON.stringify(products.map(({ id, code, name, slug, url, category, form, material, shortDescription, applicationSummary, applicationTags, image, thumb }) => ({ id, code, name, slug, url, category, form, material, shortDescription, applicationSummary, applicationTags, image, thumb })), null, 2));

// taxonomy for the admin panel
write('admin/taxonomy.json', JSON.stringify(require('../src/data/taxonomy')));

// GitHub Pages: disable Jekyll processing; publish CNAME if a custom domain is configured
write('.nojekyll', '');
if (process.env.CUSTOM_DOMAIN) write('CNAME', process.env.CUSTOM_DOMAIN + '\n');

// sitemap + robots
const base = site.baseUrl.replace(/\/$/, '');
const urls = ['/', '/products/', '/about/', '/industries/', '/applications/', '/resources/', '/contact/', ...products.map((p) => p.url)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc><changefreq>monthly</changefreq></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${base}/sitemap.xml\n`);

console.log(`✔ built ${routes.length} pages → dist/`);
