// Public runtime config. NO secrets here — this file ships to the browser.
// Backend credentials live in environment variables on the serverless layer (see /api/enquiry.js).
window.EIC_CONFIG = {
  // Endpoint of the serverless enquiry function. Same-origin by default (Vercel/Netlify style).
  // On GitHub Pages the functions live on another host — set the full URLs here, e.g. 'https://eic-api.vercel.app/api/enquiry'.
  // ── HOSTING MODE ─────────────────────────────────────────────────────────────
  // 'github'  = GitHub Pages only (no server). Admin saves straight to the repo with a GitHub token;
  //             enquiries are emailed via Web3Forms. Set repo + web3formsKey below.
  // 'server'  = Vercel/Netlify with the /api functions (api/enquiry.js, api/admin.js).
  mode: 'github',
  repo: 'YOUR-GITHUB-USERNAME/eic-website',   // owner/repo — used by the admin panel in github mode
  branch: 'main',
  // Free key from https://web3forms.com (enter expertsindustrialcorporation@gmail.com, key arrives by email).
  // This key is public by design — it only lets people send email TO the address it was created for.
  web3formsKey: 'YOUR-WEB3FORMS-ACCESS-KEY',
  // Only used in 'server' mode:
  enquiryEndpoint: '/api/enquiry',
  adminEndpoint: '/api/admin',
  // Set to a global function name (e.g. 'gtag' or 'plausible') to forward events to an analytics provider.
  analyticsProvider: 'gtag',
  // Analytics only runs when this is true. Flip to false to disable all event tracking.
  analyticsEnabled: true,
};
