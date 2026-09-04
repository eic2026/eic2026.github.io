# Experts Industrial Corporation — website

Static industrial product catalogue + lead generation site. Plain HTML/CSS/JS, generated from a data layer by a
small Node build script. One serverless function (`api/enquiry.js`) receives enquiries.

```
eic-website/
├─ src/
│  ├─ data/
│  │  ├─ site.js          ← business details, nav, contact numbers (single source of truth)
│  │  ├─ index.js         ← content loader (reads content/content.json, adds derived fields)
│  │  ├─ products.js      ← original seed data (kept for reference)
│  │  ├─ taxonomy.js      ← categories, product forms, application tags, application selector, industries
│  │  └─ content.js       ← FAQ + downloadable resources
│  └─ templates/
│     ├─ components.js    ← header, footer, product card, modals, FAQ, SEO head, JSON-LD, layout
│     ├─ home.js
│     ├─ products.js      ← /products/ listing + /products/<slug>/ detail
│     └─ pages.js         ← about, industries, applications, resources, contact, 404
├─ content/content.json   ← ALL editable content (products, contact, hero) — edited via /admin/
├─ public/                ← copied as-is into dist/
│  ├─ admin/index.html                admin panel UI
│  ├─ assets/css/main.css
│  ├─ assets/js/main.js               UI behaviour (nav, modal, search, filters, selector, downloads)
│  ├─ assets/js/config.js             public runtime config (no secrets)
│  ├─ assets/js/services/leads.js     submitEnquiry(), submitDownloadLead(), trackDownload(), trackProductInterest()
│  ├─ assets/js/services/analytics.js track() + UTM capture
│  ├─ assets/img/products/            20 product images (+ /thumb/)
│  └─ downloads/                      generated PDFs (catalogue, 20 product sheets, guide, company info)
├─ api/
│  ├─ enquiry.js          ← serverless lead intake (Vercel + Netlify handlers), lead schema, statuses
│  ├─ admin.js            ← admin API: login, read/write content.json via GitHub, image upload, leads
│  └─ leads.schema.sql    ← Postgres/Supabase table
├─ scripts/
│  ├─ build.js            ← renders dist/ (28 pages, sitemap, robots, products.json)
│  └─ make_pdfs.py        ← regenerates public/downloads from product data
├─ vercel.json · netlify.toml · .env.example
└─ dist/                  ← build output (deploy this folder)
```

## Run locally
```bash
npm run build      # → dist/
npm run preview    # serves dist/ on http://localhost:3000
```
Requires Node 18+. PDFs need Python 3 with `reportlab` and `Pillow` (`npm run pdfs`).

## Add or edit a product
1. Add an object to `src/data/products.js` (copy an existing one). Keep `slug` unique.
2. Drop the image at `public/assets/img/products/<slug>.webp` and a 800×550 copy in `/thumb/`.
3. `npm run pdfs && npm run build`.

Specifications: leave `specifications: []` until EIC supplies real values. The site then shows
*"Contact EIC for available specifications."* To add real data:
```js
specifications: [{ label: 'Pipe sizes', value: '15 NB – 300 NB' }]
```

## Placeholders to replace before go-live
| Item | Where |
|---|---|
| Official EIC logo | `logo()` in `src/templates/components.js` — swap the text lockup for `<img src="/assets/img/logo.svg">`; also `scripts/make_pdfs.py` header/cover |
| Hero facility photo | `heroArt()` in `src/templates/home.js` (currently an SVG pipe-run background) |
| Production domain | `SITE_URL` env var (canonical, OG, sitemap) |
| Business address | `address` in `src/data/site.js` (hidden until set — no fake map) |
| About page copy | `[PLACEHOLDER …]` blocks in `src/templates/pages.js` |

No specs, certifications, client names, years or figures have been invented anywhere.

## Deploying on GitHub only (no Vercel) — the simple path
`public/assets/js/config.js` has `mode: 'github'`. In this mode nothing runs on a server:
the admin panel commits straight to the repo with a GitHub token, and enquiry forms are emailed to EIC through
Web3Forms (free). GitHub Actions rebuilds the site on every commit.

1. **Push the project** to a GitHub repo, `main` branch (GitHub Desktop is easiest).
2. **Settings → Pages → Source: GitHub Actions.** The first build runs automatically (Actions tab, ~2 min).
3. **Edit `public/assets/js/config.js`** and set `repo: 'yourname/eic-website'`. Get a free key at web3forms.com using
   expertsindustrialcorporation@gmail.com and set `web3formsKey`. Commit.
4. **Domain:** the site uses root-relative paths, so it must be served at a domain root — either a repo named
   `<username>.github.io`, or a custom domain (Settings → Pages → Custom domain, plus repo variable `CUSTOM_DOMAIN`
   and `SITE_URL` under Settings → Secrets and variables → Actions → Variables).
5. **Admin login:** create a GitHub fine-grained token (Settings → Developer settings → Personal access tokens →
   Fine-grained → only the eic-website repo → Repository permissions → Contents: Read and write). Open
   `https://<domain>/admin/` and paste the token as the password. Each "Save & publish" is a commit; the site
   updates 1–2 minutes later.

Enquiries arrive as emails with a Lead ID, all form fields, source page and UTM. To manage them in a table,
switch to `mode: 'server'` and deploy the `/api` functions on Vercel (see below) — the admin Leads tab then works.

## Admin panel — /admin/
Login-protected CMS for the sales/office team. Edits **products** (add, edit, hide, delete, upload image,
specifications, related products, featured flag), **homepage hero text + product carousel slides**, and
**contact & company details** (phone, WhatsApp, email, address, widget message, footer credit). A **Leads** tab
lists enquiries with status, assignee, follow-up date and notes, and exports CSV (needs Supabase).

How it works: `content/content.json` is the single source of truth. "Save & publish" commits it to the Git repo via
the GitHub API; the host rebuilds the static site automatically (~1 min). No CMS database, no extra hosting.

Setup: set `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO` (and `GITHUB_BRANCH`) in
the hosting dashboard. Make sure the host is connected to the same repo/branch so commits trigger a deploy.
Product PDFs are regenerated at build only if `npm run pdfs` is part of the build command (requires Python on the
build image); otherwise run it locally and commit `public/downloads/`.

Content structure (`content/content.json`): `site` (contact/company), `hero` (text + `slides[]` of `{slug, badge, caption}`),
`featuredSlugs[]`, `products[]`. Taxonomy (categories, forms, application tags, industries) stays in `src/data/taxonomy.js`.

## Lead system (serverless)
The frontend is static. Forms POST JSON to `/api/enquiry`, which validates, builds a lead record with
status `NEW`, stores it through whichever adapters are configured, and emails the sales team.

| Env var | Purpose |
|---|---|
| `LEAD_WEBHOOK_URL` | Any JSON webhook: Zapier/Make/n8n → Google Sheet, or CRM inbound endpoint |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | Store in Postgres (`api/leads.schema.sql`) |
| `RESEND_API_KEY`, `NOTIFY_TO`, `NOTIFY_FROM` | Email notification (swap for SMTP/SendGrid in `sendLeadNotification`) |
| `ALLOWED_ORIGIN` | Lock CORS to the production domain |

Lead statuses: `NEW → CONTACTED → FOLLOW_UP_REQUIRED → QUOTATION_SENT → NEGOTIATION → CONVERTED / LOST`.
Each lead carries: leadId, createdAt, type, name, company, mobile, email, city, product, quantity, specification,
application, message, sourcePage, referrer, utm_source/medium/campaign, consent, status, followUpNotes, assignedTo, followUpDate.

Until an adapter is configured the function still returns a lead ID and logs the lead to the function console,
so the site works end-to-end during setup. If the API is unreachable the modal tells the visitor to call/WhatsApp.

## Analytics events
`product_view · product_search · quote_open · quote_submit · catalogue_download · technical_document_download ·
product_document_download · call_click · whatsapp_click · email_click`
Pushed to `window.dataLayer` (GTM) and/or the provider named in `config.js`. No personal data is attached to events;
contact details leave the browser only when a visitor submits a form with the consent box ticked.

## Deploy
- **Vercel**: import the repo — `vercel.json` sets build + output and the function is picked up automatically.
- **Netlify**: `netlify.toml` builds `dist/` and maps `/api/enquiry` to the function.
- **Any static host** (Cloudflare Pages, GitHub Pages, S3): upload `dist/`, host `api/enquiry.js` as a function elsewhere
  and set `enquiryEndpoint` in `public/assets/js/config.js` to its URL.

Set the env vars from `.env.example` in the hosting dashboard. Never put them in frontend code.

## Deploying to GitHub Pages
GitHub Pages serves static files only, so the website goes on Pages and the two functions (`api/enquiry.js`,
`api/admin.js`) go on Vercel's free tier. The workflow in `.github/workflows/pages.yml` builds and deploys
`dist/` on every push to `main` — including the commits the admin panel makes, so content edits go live automatically.

1. Push this project to a GitHub repo (`main` branch).
2. Repo → **Settings → Pages → Source: GitHub Actions**.
3. Repo → **Settings → Secrets and variables → Actions → Variables**: add `SITE_URL` (your final URL) and, if you have a
   custom domain, `CUSTOM_DOMAIN` (also add the DNS CNAME to `<user>.github.io` and enable HTTPS in Pages settings).
   Note: absolute paths (`/assets/…`) mean the site must sit at the domain root — use a custom domain or a
   `<user>.github.io` repository, not `<user>.github.io/<repo>/`.
4. Deploy the API: import the same repo into Vercel, set the env vars from `.env.example`
   (enquiry + admin + `GITHUB_TOKEN`/`GITHUB_REPO`) and `ALLOWED_ORIGIN=https://<your-pages-domain>`.
   Vercel will also build the site, which is harmless; or set its output to `api` only.
5. In `public/assets/js/config.js` set `enquiryEndpoint` and `adminEndpoint` to the Vercel URLs
   (`https://<project>.vercel.app/api/enquiry` and `/api/admin`), commit, push.
6. Open `https://<your-domain>/admin/`, log in with `ADMIN_USER`/`ADMIN_PASSWORD`. Saves commit to `main`, the Pages
   workflow runs (~1–2 min) and the change is live.

Alternative: skip Pages entirely and host everything on Vercel — one import, no config changes.
