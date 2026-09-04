const categories = [
  {
    id: 'thermal-insulation',
    name: 'Thermal Insulation',
    description: 'Pipe sections, slabs, sheets, rolls and flexible insulation for hot, cold and process systems.',
  },
  {
    id: 'cladding-vapour-protection',
    name: 'Cladding & Vapour Protection',
    description: 'Metal cladding and foil facings that protect insulation from weather, moisture and mechanical damage.',
  },
  {
    id: 'installation-accessories',
    name: 'Installation & Accessories',
    description: 'Adhesives, tapes, wires, supports, fasteners and sealants used to install and finish insulation systems.',
  },
];

const forms = [
  { id: 'pipe-section', name: 'Pipe Section' },
  { id: 'sheet', name: 'Sheet' },
  { id: 'slab', name: 'Slab' },
  { id: 'roll', name: 'Roll' },
  { id: 'foil', name: 'Foil' },
  { id: 'accessory', name: 'Accessory' },
];

// Application filter tags used on the product listing.
const applicationTags = [
  { id: 'hvac', name: 'HVAC' },
  { id: 'refrigeration', name: 'Refrigeration' },
  { id: 'chilled-water', name: 'Chilled Water' },
  { id: 'hot-water', name: 'Hot Water' },
  { id: 'process-piping', name: 'Process Piping' },
  { id: 'equipment', name: 'Equipment' },
  { id: 'ducting', name: 'Ducting' },
  { id: 'industrial', name: 'Industrial' },
];

// "What are you insulating?" selector. recommended = product slugs.
const applications = [
  {
    id: 'piping',
    name: 'Piping',
    heading: 'Chilled, hot water and process piping',
    description: 'Pre-formed pipe sections and flexible insulation for line sizes across chilled water, hot water and process services, finished with cladding and sealed joints.',
    recommended: ['puf-pipe-sections', 'pir-pipe-sections', 'rockwool-pipe-sections', 'nbr-epdm-rubber-insulation', 'xlpe-insulation', 'aluminium-cladding-sheets'],
  },
  {
    id: 'equipment',
    name: 'Equipment',
    heading: 'Vessels, exchangers and equipment',
    description: 'Slabs and sheets that can be cut and fitted around equipment, fixed with pins or adhesive and protected with cladding.',
    recommended: ['puf-slabs-sheets', 'pir-pur-sheets', 'rockwool-slabs', 'insulation-fasteners-pins', 'gi-cladding-sheets'],
  },
  {
    id: 'tanks',
    name: 'Tanks',
    heading: 'Storage and process tanks',
    description: 'Slab and sheet insulation for large flat and curved surfaces, with metal cladding for weather protection.',
    recommended: ['puf-slabs-sheets', 'rockwool-slabs', 'aluminium-cladding-sheets', 'gi-cladding-sheets', 'mastic-sealant'],
  },
  {
    id: 'ducts',
    name: 'Ducts',
    heading: 'Supply, return and exhaust ducting',
    description: 'Rolls and sheets for duct insulation with foil facing, tape and pins to complete the vapour barrier.',
    recommended: ['glass-wool-rolls', 'rockwool-slabs', 'aluminium-foil', 'insulation-tape', 'insulation-fasteners-pins'],
  },
  {
    id: 'hvac',
    name: 'HVAC',
    heading: 'HVAC systems',
    description: 'Insulation for chilled water lines, ducts and air handling equipment in commercial and industrial HVAC.',
    recommended: ['glass-wool-rolls', 'glass-wool-pipe-sections', 'nbr-epdm-rubber-insulation', 'xlpe-insulation', 'insulation-tape'],
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration',
    heading: 'Refrigeration and cold lines',
    description: 'Closed-cell insulation for refrigerant and chilled lines where controlling condensation matters.',
    recommended: ['nbr-epdm-rubber-insulation', 'puf-pipe-sections', 'glass-wool-pipe-sections', 'insulation-adhesive', 'insulation-tape'],
  },
  {
    id: 'process-systems',
    name: 'Process Systems',
    heading: 'Process plant and hot services',
    description: 'Insulation for higher temperature process piping and equipment, secured with wire and protected with cladding.',
    recommended: ['rockwool-pipe-sections', 'pir-pipe-sections', 'aerogel-insulation', 'ss-gi-binding-wire', 'gi-cladding-sheets'],
  },
  {
    id: 'industrial',
    name: 'Industrial Applications',
    heading: 'General industrial applications',
    description: 'A complete material set for industrial insulation work, from the insulation itself to supports, fixing and finishing.',
    recommended: ['aerogel-insulation', 'rockwool-slabs', 'pipe-support-inserts', 'ss-gi-binding-wire', 'mastic-sealant'],
  },
];

const industries = [
  { id: 'hvac-refrigeration', name: 'HVAC & Refrigeration', description: 'Chilled water piping, refrigerant lines, ducting and air handling equipment.', products: ['nbr-epdm-rubber-insulation', 'xlpe-insulation', 'glass-wool-rolls', 'glass-wool-pipe-sections'] },
  { id: 'manufacturing', name: 'Manufacturing', description: 'Utility piping, equipment and process lines across manufacturing plants.', products: ['puf-pipe-sections', 'rockwool-pipe-sections', 'aluminium-cladding-sheets', 'pipe-support-inserts'] },
  { id: 'chemical-process', name: 'Chemical & Process Plants', description: 'Hot and cold process piping, vessels and tanks that need controlled heat loss or gain.', products: ['rockwool-pipe-sections', 'pir-pipe-sections', 'aerogel-insulation', 'gi-cladding-sheets'] },
  { id: 'power', name: 'Power', description: 'High-temperature piping, boilers and equipment in generation and utility facilities.', products: ['rockwool-pipe-sections', 'rockwool-slabs', 'ss-gi-binding-wire', 'gi-cladding-sheets'] },
  { id: 'food-processing', name: 'Food Processing', description: 'Chilled and refrigerated lines, cold rooms and process equipment.', products: ['puf-slabs-sheets', 'nbr-epdm-rubber-insulation', 'aluminium-foil', 'mastic-sealant'] },
  { id: 'pharmaceutical', name: 'Pharmaceutical', description: 'Clean HVAC systems, chilled water and process utilities.', products: ['xlpe-insulation', 'nbr-epdm-rubber-insulation', 'aluminium-cladding-sheets', 'insulation-tape'] },
  { id: 'commercial-buildings', name: 'Commercial Buildings', description: 'HVAC ducting, chilled water and plumbing insulation for commercial developments.', products: ['glass-wool-rolls', 'xlpe-insulation', 'nbr-epdm-rubber-insulation', 'insulation-adhesive'] },
  { id: 'industrial-piping', name: 'Industrial Piping', description: 'Pipe sections, supports, wire and cladding for complete piping insulation systems.', products: ['puf-pipe-sections', 'pir-pipe-sections', 'pipe-support-inserts', 'aluminium-cladding-sheets'] },
  { id: 'infrastructure', name: 'Infrastructure', description: 'District cooling, utilities and large-scale mechanical services.', products: ['puf-pipe-sections', 'pir-pur-sheets', 'gi-cladding-sheets', 'mastic-sealant'] },
];

module.exports = { categories, forms, applicationTags, applications, industries };
