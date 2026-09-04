const { site } = require('./index');

const CONTACT_LINE = 'Contact EIC for product-specific recommendations and available specifications.';

// General FAQ (used on products listing, contact and applications pages).
const faqGeneral = [
  {
    q: 'Which insulation material is suitable for chilled water piping?',
    a: `Chilled water piping is commonly insulated with closed-cell materials such as PUF pipe sections, NBR/EPDM rubber insulation or XLPE insulation, finished with a vapour barrier and cladding. The right choice depends on line size, location and finish requirements. ${CONTACT_LINE}`,
  },
  {
    q: 'What insulation products are available for HVAC applications?',
    a: `For HVAC work EIC supplies glass wool rolls and pipe sections, NBR/EPDM rubber insulation, XLPE insulation, aluminium foil, insulation tape, adhesive and fixing pins. ${CONTACT_LINE}`,
  },
  {
    q: 'Do you supply pipe sections in different sizes?',
    a: `Pipe sections are supplied to suit standard pipe sizes. Share your pipe size, insulation thickness and quantity in a quote request and EIC will confirm what is available.`,
  },
  {
    q: 'Can I request a quotation for bulk requirements?',
    a: `Yes. Use Request a Quote on any product page or the contact form, or call or WhatsApp ${site.phoneDisplay} with your requirement, quantity and delivery location.`,
  },
  {
    q: 'Can I download product information?',
    a: `Yes. The EIC product catalogue and individual product information sheets are available on the Resources page and on every product page.`,
  },
  {
    q: 'How can I contact EIC?',
    a: `Call or WhatsApp ${site.phoneDisplay}, email ${site.email}, or submit an enquiry through the website.`,
  },
];

// Product-page FAQ generator — deliberately avoids specific technical answers.
function faqForProduct(p) {
  return [
    {
      q: `What is ${p.name} used for?`,
      a: `${p.name} is typically used for ${p.applicationSummary.charAt(0).toLowerCase() + p.applicationSummary.slice(1)}. ${CONTACT_LINE}`,
    },
    {
      q: `What sizes and specifications are available for ${p.name}?`,
      a: `${p.specNotice} Share your requirement through Request a Quote and EIC will confirm available sizes and options.`,
    },
    {
      q: `Can I get a quotation for ${p.name}?`,
      a: `Yes. Use Request a Quote on this page, or call or WhatsApp ${site.phoneDisplay} with your quantity, size and delivery location.`,
    },
    {
      q: `Can I download information on ${p.name}?`,
      a: `Yes. A product information sheet for ${p.name} and the full EIC product catalogue can be downloaded from this page.`,
    },
  ];
}

const resources = {
  catalogue: [
    {
      id: 'eic-product-catalogue',
      title: 'EIC Product Catalogue',
      description: 'All 20 products across thermal insulation, cladding & vapour protection and installation accessories, with applications and contact details.',
      file: '/downloads/eic-product-catalogue.pdf',
      type: 'catalogue',
      gated: true, // asks for name/company/mobile/email before download
    },
  ],
  technical: [
    {
      id: 'material-selection-guide',
      title: 'Material Selection Guide',
      description: 'Which material category is commonly used for piping, equipment, tanks, ducts, HVAC, refrigeration and process systems.',
      file: '/downloads/eic-material-selection-guide.pdf',
      type: 'technical_document',
      gated: false,
    },
  ],
  company: [
    {
      id: 'company-information',
      title: 'Company Information',
      description: 'An overview of Experts Industrial Corporation, product range and contact details.',
      file: '/downloads/eic-company-information.pdf',
      type: 'company_document',
      gated: false,
    },
  ],
};

module.exports = { faqGeneral, faqForProduct, resources, CONTACT_LINE };
