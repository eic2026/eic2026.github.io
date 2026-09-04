"""Generate downloadable PDFs from the product data.
Run:  node -e "const d=require('./src/data/products');const t=require('./src/data/taxonomy');const s=require('./src/data/site');require('fs').writeFileSync('scripts/_data.json',JSON.stringify({products:d.products,taxonomy:t,site:s}))" && python3 scripts/make_pdfs.py
(or simply `npm run pdfs`). Output → public/downloads/
"""
import json, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, 'scripts', '_data.json')))
P, TAX, SITE = DATA['products'], DATA['taxonomy'], DATA['site']
OUT = os.path.join(ROOT, 'public', 'downloads')
os.makedirs(os.path.join(OUT, 'products'), exist_ok=True)

BLACK, GOLD, IVORY, GREY = colors.HexColor('#1A1A1A'), colors.HexColor('#D4AF37'), colors.HexColor('#FBF6E6'), colors.HexColor('#666666')
W, H = A4
_LOGO_SRC = os.path.join(ROOT, 'public', 'assets', 'img', 'logo-600.png')
LOGO = os.path.join(ROOT, 'scripts', '_pdfimg', 'logo.png')
os.makedirs(os.path.dirname(LOGO), exist_ok=True)
if not os.path.exists(LOGO):
    from PIL import Image as _I
    _I.open(_LOGO_SRC).convert('RGBA').resize((300, 260)).save(LOGO, optimize=True)  # compact copy so every PDF stays small

st = {
    'h1': ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=BLACK, spaceAfter=4),
    'h2': ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=BLACK, spaceBefore=10, spaceAfter=4),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=BLACK),
    'muted': ParagraphStyle('muted', fontName='Helvetica', fontSize=9, leading=12, textColor=GREY),
    'small': ParagraphStyle('small', fontName='Helvetica', fontSize=8, leading=10, textColor=GREY),
    'code': ParagraphStyle('code', fontName='Helvetica-Bold', fontSize=9, textColor=GOLD),
    'cover': ParagraphStyle('cover', fontName='Helvetica-Bold', fontSize=34, leading=38, textColor=colors.white),
    'coverSub': ParagraphStyle('coverSub', fontName='Helvetica', fontSize=13, leading=18, textColor=colors.HexColor('#DDDDDD')),
    'white': ParagraphStyle('white', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#CCCCCC')),
}

from PIL import Image as PILImage
TMP = os.path.join(ROOT, 'scripts', '_pdfimg'); os.makedirs(TMP, exist_ok=True)
def pdf_image(p):
    """Compact JPEG copy of the product image so PDFs stay small."""
    out = os.path.join(TMP, p['slug'] + '.jpg')
    if not os.path.exists(out):
        PILImage.open(os.path.join(ROOT, 'public', p['thumb'].lstrip('/'))).convert('RGB').resize((560, 385)).save(out, 'JPEG', quality=72, optimize=True)
    return out

def cat_name(cid):
    return next(c['name'] for c in TAX['categories'] if c['id'] == cid)

def header_footer(canvas, doc):
    """Logo lockup (PLACEHOLDER — swap drawString block for drawImage of the official logo) + contact footer."""
    canvas.saveState()
    # top bar
    canvas.setFillColor(BLACK); canvas.rect(0, H - 18*mm, W, 18*mm, stroke=0, fill=1)
    canvas.setFillColor(GOLD); canvas.rect(0, H - 18.6*mm, W, 0.6*mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white); canvas.roundRect(13*mm, H - 16.5*mm, 22*mm, 15*mm, 1.5*mm, stroke=0, fill=1)
    canvas.drawImage(LOGO, 14*mm, H - 16*mm, width=20*mm, height=14*mm, preserveAspectRatio=True, mask='auto')
    canvas.setFillColor(colors.HexColor('#BBBBBB')); canvas.setFont('Helvetica', 7.5)
    canvas.drawRightString(W - 15*mm, H - 11*mm, f"Call / WhatsApp {SITE['phoneDisplay']}   |   {SITE['email']}")
    # footer
    canvas.setFillColor(GREY); canvas.setFont('Helvetica', 7.5)
    canvas.drawString(15*mm, 10*mm, f"{SITE['name']} · Industrial insulation materials and engineering products")
    canvas.drawRightString(W - 15*mm, 10*mm, f"Page {doc.page}")
    canvas.setStrokeColor(GOLD); canvas.setLineWidth(0.6); canvas.line(15*mm, 14*mm, W - 15*mm, 14*mm)
    canvas.restoreState()

def cover(canvas, doc, title, sub):
    canvas.saveState()
    canvas.setFillColor(BLACK); canvas.rect(0, 0, W, H, stroke=0, fill=1)
    canvas.setFillColor(GOLD); canvas.rect(15*mm, H - 58*mm, 18*mm, 1.5*mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white); canvas.roundRect(15*mm, H - 52*mm, 62*mm, 40*mm, 2*mm, stroke=0, fill=1)
    canvas.drawImage(LOGO, 17*mm, H - 51*mm, width=58*mm, height=38*mm, preserveAspectRatio=True, mask='auto')
    canvas.setFillColor(colors.white); canvas.setFont('Helvetica-Bold', 34)
    y = H - 85*mm
    for line in title:
        canvas.drawString(15*mm, y, line); y -= 13*mm
    canvas.setFillColor(colors.HexColor('#DDDDDD')); canvas.setFont('Helvetica', 12); canvas.drawString(15*mm, y - 4*mm, sub)
    canvas.setFillColor(GOLD); canvas.rect(0, 28*mm, W, 0.8*mm, stroke=0, fill=1)
    canvas.setFillColor(colors.white); canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(15*mm, 20*mm, f"Call / WhatsApp {SITE['phoneDisplay']}")
    canvas.setFont('Helvetica', 9); canvas.drawString(15*mm, 15*mm, SITE['email'])
    canvas.restoreState()

def spec_notice(p):
    t = Table([[Paragraph(f"<b>{p['specNotice']}</b> Share your size, thickness and quantity and EIC will confirm the options available for {p['name']}.", st['body'])]], colWidths=[W - 30*mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), IVORY), ('LINEBEFORE', (0,0), (0,-1), 3, GOLD), ('LEFTPADDING', (0,0), (-1,-1), 10), ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8)]))
    return t

def bullets(items):
    return [Paragraph(f"<font color='#D4AF37'>■</font>&nbsp;&nbsp;{i}", st['body']) for i in items]

def product_block(p, full=True):
    img_path = pdf_image(p)
    img = Image(img_path, width=70*mm, height=48*mm)
    right = [Paragraph(f"{p['code']} · {cat_name(p['category'])}", st['code']), Paragraph(p['name'], st['h1']), Paragraph(p['shortDescription'], st['muted']), Spacer(1, 4),
             Paragraph(f"<b>Material:</b> {p['material']}", st['body']), Paragraph(f"<b>Primary use:</b> {p['applicationSummary']}", st['body'])]
    t = Table([[img, right]], colWidths=[74*mm, W - 30*mm - 74*mm])
    t.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (1,0), (1,0), 0)]))
    out = [t, Spacer(1, 6)]
    if full:
        out += [Paragraph('Product overview', st['h2']), Paragraph(p['description'], st['body']),
                Paragraph('Applications', st['h2'])] + bullets(p['applications']) + \
               [Paragraph('Key features', st['h2'])] + bullets(p['features']) + \
               [Paragraph('Available options / specifications', st['h2']), spec_notice(p)] + bullets(p['options']) + [Spacer(1, 6),
                Paragraph('Related products', st['h2']), Paragraph(', '.join(next(x['name'] for x in P if x['slug'] == s) for s in p['relatedProducts']), st['body'])]
    return out

def contact_block():
    t = Table([[Paragraph('<b>Request a quote</b><br/>Call or WhatsApp with your size, quantity and delivery location.', st['white']),
                Paragraph(f"<b>Phone / WhatsApp</b><br/>{SITE['phoneDisplay']}", st['white']),
                Paragraph(f"<b>Email</b><br/>{SITE['email']}", st['white'])]], colWidths=[(W-30*mm)/3]*3)
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), BLACK), ('LINEABOVE', (0,0), (-1,0), 2, GOLD), ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 10), ('LEFTPADDING', (0,0), (-1,-1), 10)]))
    return t

def build(path, story, cover_title, cover_sub, title):
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=26*mm, bottomMargin=20*mm, title=title, author=SITE['name'], subject=cover_sub)
    doc.build(story, onFirstPage=lambda c, d: cover(c, d, cover_title, cover_sub), onLaterPages=header_footer)

# 1. Product catalogue
story = [PageBreak(), Paragraph('Product catalogue', st['h1']), Paragraph('Industrial insulation materials, cladding and installation accessories. Technical specifications are supplied on request.', st['muted']), Spacer(1, 8)]
for c in TAX['categories']:
    rows = [[Paragraph(f"<b>{c['name']}</b> — {c['description']}", st['body'])]]
    items = [p for p in P if p['category'] == c['id']]
    for p in items:
        rows.append([Paragraph(f"<font color='#D4AF37'><b>{p['code']}</b></font>&nbsp;&nbsp;<b>{p['name']}</b> — {p['applicationSummary']}", st['body'])])
    t = Table(rows, colWidths=[W - 30*mm])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (0,0), IVORY), ('LINEBELOW', (0,0), (-1,-1), 0.4, colors.HexColor('#E5E5E5')), ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5)]))
    story += [t, Spacer(1, 10)]
for p in P:
    story += [PageBreak()] + product_block(p) + [Spacer(1, 10), contact_block()]
build(os.path.join(OUT, 'eic-product-catalogue.pdf'), story, ['Product', 'Catalogue'], 'Industrial insulation materials & engineering products', 'EIC Product Catalogue')

# 2. Product information sheets
for p in P:
    story = [PageBreak()] + product_block(p) + [Spacer(1, 12), contact_block()]
    build(os.path.join(OUT, 'products', f"{p['slug']}.pdf"), story, [p['name']] if len(p['name']) < 22 else p['name'].split('/'), 'Product information sheet', f"{p['name']} – Product Information")

# 3. Material selection guide
story = [PageBreak(), Paragraph('Material selection guide', st['h1']), Paragraph('The material types commonly used for each application. This is a starting point — contact EIC for product-specific recommendations and available specifications.', st['muted']), Spacer(1, 8)]
for a in TAX['applications']:
    names = [next(x['name'] for x in P if x['slug'] == s) for s in a['recommended']]
    story.append(KeepTogether([Paragraph(a['name'], st['h2']), Paragraph(f"<b>{a['heading']}.</b> {a['description']}", st['body'])] + bullets(names)))
story += [Spacer(1, 12), contact_block()]
build(os.path.join(OUT, 'eic-material-selection-guide.pdf'), story, ['Material', 'Selection Guide'], 'Which insulation material for which application', 'EIC Material Selection Guide')

# 4. Company information
story = [PageBreak(), Paragraph('Company information', st['h1']), Paragraph(SITE['tagline'], st['muted']), Spacer(1, 8),
         Paragraph('About', st['h2']), Paragraph('Experts Industrial Corporation supplies industrial insulation materials, cladding and installation accessories for piping, HVAC, refrigeration, equipment and industrial applications, and helps buyers identify the suitable material category before they order.', st['body']),
         Paragraph('[PLACEHOLDER – add confirmed company details here: registered name, address, GST number, service areas.]', st['small']),
         Paragraph('Product range', st['h2'])]
for c in TAX['categories']:
    story += [Paragraph(f"<b>{c['name']}</b>: " + ', '.join(p['name'] for p in P if p['category'] == c['id']), st['body']), Spacer(1, 3)]
story += [Paragraph('Contact', st['h2']), Paragraph(f"Phone / WhatsApp: {SITE['phoneDisplay']}<br/>Email: {SITE['email']}", st['body']), Spacer(1, 12), contact_block()]
build(os.path.join(OUT, 'eic-company-information.pdf'), story, ['Company', 'Information'], 'Experts Industrial Corporation', 'EIC Company Information')
print('✔ PDFs written to public/downloads/')
