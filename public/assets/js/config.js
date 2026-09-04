// Public runtime config. NO secrets here — this file ships to the browser.
window.EIC_CONFIG = {
  // ── HOSTING MODE ─────────────────────────────────────────────────────────────
  // 'github'  = GitHub Pages only (no server). Admin saves straight to the repo with a GitHub token;
  //             enquiries are emailed via Web3Forms.
  // 'server'  = Vercel/Netlify with the /api functions (api/enquiry.js, api/admin.js).
  mode: 'github',
  repo: 'eic2026/eic2026.github.io',
  branch: 'main',
  // Web3Forms public access key — delivers enquiries to expertsindustrialcorporation@gmail.com
  web3formsKey: 'a7c497cf-5707-45f5-b140-dd3454e025bf',
  // Only used in 'server' mode:
  enquiryEndpoint: '/api/enquiry',
  adminEndpoint: '/api/admin',
  // Forward site events (call_click, quote_submit, etc.) to Google Analytics.
  analyticsProvider: 'gtag',
  analyticsEnabled: true,
};
