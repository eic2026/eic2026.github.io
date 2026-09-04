// Public runtime config. NO secrets here — this file ships to the browser.
window.EIC_CONFIG = {
  mode: 'github',
  repo: 'eic2026/eic2026.github.io',
  branch: 'main',
  web3formsKey: 'a7c497cf-5707-45f5-b140-dd3454e025bf',
  // Google Apps Script: stores leads in the EIC Leads sheet, sends notification + thank-you emails, powers admin Leads tab
  leadsEndpoint: 'https://script.google.com/macros/s/AKfycbzrRi53Xre7uoFDYo6c_bq6OG-y6n6wbp5Xc_G7QPMsG_BfwIbqKEXfNfwGryiEFcGqlg/exec',
  enquiryEndpoint: '/api/enquiry',
  adminEndpoint: '/api/admin',
  analyticsProvider: 'gtag',
  analyticsEnabled: true,
};
