// Single source of truth for business details.
// Only verified information belongs here. Do not add data that has not been supplied.
module.exports = {
  name: 'Experts Industrial Corporation',
  shortName: 'EIC',
  tagline: 'Industrial insulation materials and engineering products.',
  // Set this to the final production domain before deploying (used for canonical + OG URLs).
  baseUrl: process.env.SITE_URL || 'https://www.example.com',
  phone: '9958252566',
  phoneDisplay: '99582 52566',
  phoneTel: '+919958252566',
  whatsapp: '919958252566',
  email: 'expertsindustrialcorporation@gmail.com',
  // PLACEHOLDER — replace with the real address when available. Leave null to hide the address block entirely.
  address: null,
  nav: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about/' },
    { label: 'Products', href: '/products/' },
    { label: 'Industries', href: '/industries/' },
    { label: 'Applications', href: '/applications/' },
    { label: 'Resources', href: '/resources/' },
    { label: 'Contact', href: '/contact/' },
  ],
  footerProducts: [
    { label: 'PUF', href: '/products/puf-pipe-sections/' },
    { label: 'PIR/PUR', href: '/products/pir-pipe-sections/' },
    { label: 'Rockwool', href: '/products/rockwool-pipe-sections/' },
    { label: 'Glass Wool', href: '/products/glass-wool-rolls/' },
    { label: 'Rubber Insulation', href: '/products/nbr-epdm-rubber-insulation/' },
    { label: 'XLPE', href: '/products/xlpe-insulation/' },
    { label: 'Aerogel', href: '/products/aerogel-insulation/' },
    { label: 'Cladding', href: '/products/?category=cladding-vapour-protection' },
    { label: 'Accessories', href: '/products/?category=installation-accessories' },
  ],
  whatsappMessage: (product) =>
    product
      ? `Hello EIC, I would like an enquiry on ${product}.`
      : 'Hello EIC, I would like to enquire about industrial insulation materials.',
};
