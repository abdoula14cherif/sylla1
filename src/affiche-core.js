import qrcode from 'qrcode-generator';
import { CONFIG } from './config.js';

// La bibliothèque QR coupe les accents par défaut : on force l'UTF-8
qrcode.stringToBytes = (s) => Array.from(new TextEncoder().encode(s));

/* =====================================================
   Carte de visite : données, vCard, QR et dessin (canvas)
   Format 3,5 x 2 pouces (89 x 51 mm) à 300 dpi
   ===================================================== */
export const W = 1050;
export const H = 600;

const FONT = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const INK = '#14213d';

export const CARD_DESIGNS = [
  { id: 'carte-moderne', nom: 'Moderne' },
  { id: 'carte-classique', nom: 'Classique' },
  { id: 'carte-sombre', nom: 'Nuit' },
  { id: 'carte-degrade', nom: 'Dégradé' },
  { id: 'carte-minimal', nom: 'Minimal' },
  { id: 'carte-bandeau', nom: 'Bandeau' },
  { id: 'carte-geometrique', nom: 'Géométrie' },
  { id: 'carte-elegant', nom: 'Élégant' },
  { id: 'carte-luxe', nom: 'Luxe' },
  { id: 'carte-vague', nom: 'Vague' },
  { id: 'carte-pagne', nom: 'Pagne' },
  { id: 'carte-neon', nom: 'Néon' },
  { id: 'carte-portrait', nom: 'Portrait' },
  { id: 'carte-pastilles', nom: 'Pastilles' },
];

export const CARD_COLORS = [
  { c: '#14213D', nom: 'Bleu nuit' },
  { c: '#0B7A4B', nom: 'Vert' },
  { c: '#B42318', nom: 'Rouge' },
  { c: '#6B3FA0', nom: 'Violet' },
  { c: '#0E7490', nom: 'Turquoise' },
  { c: '#B7791F', nom: 'Or' },
  { c: '#BE185D', nom: 'Rose' },
  { c: '#1F2933', nom: 'Anthracite' },
];

export const blankCard = () => ({
  design: 'carte-moderne',
  accent: '#14213D',
  forme: 'rond', // rond | carre | logo
  image: '',
  qr: 'contact', // contact | whatsapp | site
  nom: '',
  titre: '',
  entreprise: '',
  slogan: '',
  tel: '',
  whatsapp: '',
  email: '',
  site: '',
  adresse: '',
  reseau: '',
  versoTexte: '',
});

// Exemple affiché tant que la carte est vide
export const DEMO = {
  nom: 'Nadège Mballa',
  titre: 'Directrice commerciale',
  entreprise: 'Atlantique Services',
  slogan: 'Votre réussite, notre métier',
  tel: '+237 6 00 00 00 00',
  whatsapp: '',
  email: 'nadege@atlantique.cm',
  site: 'www.atlantique.cm',
  adresse: 'Akwa, Douala',
  reseau: '@atlantique.services',
  versoTexte: '',
};

export const isEmpty = (d) => !(d.nom.trim() || d.entreprise.trim() || d.tel.trim() || d.email.trim());
export const withDemo = (d) => (isEmpty(d) ? { ...d, ...DEMO } : d);

/* ---------- Téléphone, site, vCard, texte ---------- */
export function intl(raw) {
  const s = String(raw || '').trim();
  const dg = s.replace(/\D/g, '');
  if (!dg) return '';
  if (s.startsWith('+')) return dg;
  if (dg.startsWith('00')) return dg.slice(2);
  const cc = CONFIG.countryCode;
  if (dg.startsWith(cc) && dg.length >= 11) return dg;
  if (dg.length === 9) return cc + dg;
  if (dg.startsWith('0') && dg.length >= 9) return cc + dg.slice(1);
  return dg;
}
// Affichage : 677123456 devient « +237 6 77 12 34 56 ». Un numéro déjà mis en forme n'est pas touché.
export function fmtTel(raw) {
  const s = String(raw || '').trim();
  if (!/^\+?[\d]+$/.test(s)) return s;
  const cc = CONFIG.countryCode;
  const dg = s.replace(/\D/g, '');
  let local = '';
  if (dg.length === 9 && !s.startsWith('+')) local = dg;
  else if (dg.length === cc.length + 9 && dg.startsWith(cc) && (s.startsWith('+') || !s.startsWith('0'))) local = dg.slice(cc.length);
  if (!local) return s;
  return `+${cc} ${local[0]} ${local.slice(1).replace(/(\d{2})(?=\d)/g, '$1 ')}`;
}
export const urlOf = (s) => {
  const t = String(s || '').trim();
  if (!t) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
};
export const siteLabel = (s) => String(s || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
export const waLinkOf = (d) => {
  const n = intl(d.whatsapp.trim() || d.tel);
  return n ? `https://wa.me/${n}` : '';
};

const vEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

export function vcard(d, full = true) {
  const name = d.nom.trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const last = parts.length > 1 ? parts.pop() : '';
  const first = parts.join(' ');
  const L = ['BEGIN:VCARD', 'VERSION:3.0', `N:${vEsc(last)};${vEsc(first)};;;`, `FN:${vEsc(name || d.entreprise.trim())}`];
  if (d.entreprise.trim()) L.push(`ORG:${vEsc(d.entreprise.trim())}`);
  if (d.titre.trim()) L.push(`TITLE:${vEsc(d.titre.trim())}`);
  const tel = intl(d.tel);
  const wa = intl(d.whatsapp);
  if (tel) L.push(`TEL;TYPE=CELL:+${tel}`);
  if (wa && wa !== tel) L.push(`TEL;TYPE=CELL:+${wa}`);
  if (d.email.trim()) L.push(`EMAIL:${d.email.trim()}`);
  if (d.site.trim()) L.push(`URL:${urlOf(d.site)}`);
  if (full) {
    if (d.adresse.trim()) L.push(`ADR;TYPE=WORK:;;${vEsc(d.adresse.trim())};;;;`);
    if (d.slogan.trim()) L.push(`NOTE:${vEsc(d.slogan.trim())}`);
  }
  L.push('END:VCARD');
  return L.join('\r\n');
}

export function qrPayload(d) {
  if (d.qr === 'whatsapp' && waLinkOf(d)) return waLinkOf(d);
  if (d.qr === 'site' && d.site.trim()) return urlOf(d.site);
  return vcard(d, false);
}

export function cardText(d) {
  const L = [];
  if (d.nom.trim()) L.push(d.nom.trim());
  const job = [d.titre.trim(), d.entreprise.trim()].filter(Boolean).join(' – ');
  if (job) L.push(job);
  if (L.length) L.push('');
  if (d.tel.trim()) L.push(`📞 ${fmtTel(d.tel)}`);
  if (d.whatsapp.trim() && intl(d.whatsapp) !== intl(d.tel)) L.push(`💬 WhatsApp : ${fmtTel(d.whatsapp)}`);
  if (d.email.trim()) L.push(`✉️ ${d.email.trim()}`);
  if (d.site.trim()) L.push(`🌐 ${siteLabel(d.site)}`);
  if (d.adresse.trim()) L.push(`📍 ${d.adresse.trim()}`);
  if (d.reseau.trim()) L.push(`@ ${d.reseau.trim().replace(/^@/, '')}`);
  if (d.slogan.trim()) L.push('', d.slogan.trim());
  const wa = waLinkOf(d);
  if (wa) L.push('', `Écrivez-moi : ${wa}`);
  return L.join('\n');
}

export function contactLines(d) {
  const L = [];
  if (d.tel.trim()) L.push({ icon: 'phone', text: fmtTel(d.tel) });
  if (d.whatsapp.trim() && intl(d.whatsapp) !== intl(d.tel)) L.push({ icon: 'chat', text: fmtTel(d.whatsapp) });
  if (d.email.trim()) L.push({ icon: 'mail', text: d.email.trim() });
  if (d.site.trim()) L.push({ icon: 'globe', text: siteLabel(d.site) });
  if (d.adresse.trim()) L.push({ icon: 'pin', text: d.adresse.trim() });
  if (d.reseau.trim()) L.push({ icon: 'at', text: d.reseau.trim().replace(/^@/, '@') });
  return L;
}

/* ---------- Images ---------- */
const imgCache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (!imgCache.has(src)) {
    imgCache.set(
      src,
      new Promise((res) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => res(null);
        im.src = src;
      })
    );
  }
  return imgCache.get(src);
}

/* ---------- Couleurs ---------- */
function hexRgb(h) {
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mix(a, b, t) {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}
function lum(h) {
  const [r, g, b] = hexRgb(h).map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const onColor = (bg) => (lum(bg) > 0.45 ? INK : '#ffffff');
const inkOn = (a) => (lum(a) > 0.5 ? mix(a, '#000000', 0.45) : a); // accent lisible sur fond blanc
const lift = (a) => (lum(a) < 0.35 ? mix(a, '#ffffff', 0.55) : a); // accent lisible sur fond sombre

/* ---------- Primitives de dessin ---------- */
const rect = (c, x, y, w, h, fill) => {
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
};
const circle = (c, x, y, r, fill) => {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
};
function rpath(c, x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}
function poly(c, pts, fill) {
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

function txt(c, text, x, y, o) {
  const { size, weight = '700', fam = FONT, color = INK, align = 'left', maxW, alpha = 1, spacing = 0, italic = false } = o;
  const font = (n) => `${italic ? 'italic ' : ''}${weight} ${n}px ${fam}`;
  let s = size;
  let t = String(text);
  c.save();
  c.font = font(s);
  if (spacing) c.letterSpacing = `${spacing}px`;
  if (maxW) {
    while (c.measureText(t).width > maxW && s > size * 0.6) {
      s -= 1;
      c.font = font(s);
    }
    if (c.measureText(t).width > maxW) {
      while (t.length > 1 && c.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
      t = `${t.trimEnd()}…`;
    }
  }
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.fillText(t, x, y);
  c.restore();
  return s;
}

function wrapLines(c, text, maxW, o, maxLines) {
  c.save();
  c.font = `${o.italic ? 'italic ' : ''}${o.weight || '700'} ${o.size}px ${o.fam || FONT}`;
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    const t = cur ? `${cur} ${w}` : w;
    if (c.measureText(t).width <= maxW || !cur) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
  });
  if (cur) lines.push(cur);
  c.restore();
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] += '…';
  }
  return lines;
}
function para(c, text, x, y, o, maxW, lh, maxLines = 3) {
  const lines = wrapLines(c, text, maxW, o, maxLines);
  lines.forEach((l, i) => txt(c, l, x, y + i * lh, { ...o, maxW }));
  return y + lines.length * lh;
}

/* ---------- Icônes (viewBox 24, trait) ---------- */
const ICON = {
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  chat: 'M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20z',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 7.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5z',
  at: 'M16 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0z M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1',
  check: 'M5 12.5l4.5 4.5L19 7',
  calendar: 'M4 6h16v14H4z M4 10.5h16 M9 3v5 M15 3v5',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  heart: 'M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.4-7 10-7 10z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
  share: 'M3 11l18-8-8 18-2-8z',
};
function icon(c, name, x, y, size, color) {
  c.save();
  c.translate(x, y);
  c.scale(size / 24, size / 24);
  c.strokeStyle = color;
  c.lineWidth = 1.9;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.stroke(new Path2D(ICON[name]));
  c.restore();
}

/* Liste de coordonnées avec icônes */
function lines(c, items, x, y, o = {}) {
  const { size = 27, gap = 50, color = '#2b3550', iconColor = INK, maxW = 560, maxH, weight = '500' } = o;
  const n = items.length;
  if (!n) return y;
  const g = maxH ? Math.min(gap, maxH / n) : gap;
  const s = Math.min(size, g * 0.58);
  items.forEach((it, i) => {
    const yy = y + i * g;
    icon(c, it.icon, x, yy - s * 0.86, s * 1.05, iconColor);
    txt(c, it.text, x + s * 1.75, yy, { size: s, weight, color, maxW: maxW - s * 1.75 });
  });
  return y + n * g;
}

/* Coordonnées centrées, sans icônes, plusieurs par ligne */
function centerLines(c, items, cx, y, o = {}) {
  const { size = 25, gap = 44, color = '#3a4458', maxW = 900, weight = '500', sep = '   ·   ' } = o;
  const texts = items.map((i) => i.text);
  c.save();
  c.font = `${weight} ${size}px ${FONT}`;
  const rows = [];
  let cur = '';
  texts.forEach((t) => {
    const nx = cur ? cur + sep + t : t;
    if (c.measureText(nx).width <= maxW || !cur) cur = nx;
    else {
      rows.push(cur);
      cur = t;
    }
  });
  if (cur) rows.push(cur);
  c.restore();
  rows.forEach((r, i) => txt(c, r, cx, y + i * gap, { size, weight, color, align: 'center', maxW }));
  return y + rows.length * gap;
}

const initials = (d) =>
  (d.nom.trim() || d.entreprise.trim() || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/* Photo, logo ou initiales */
function pic(c, img, d, cx, cy, r, { ring = null, needs = false, accent = INK } = {}) {
  if (!img) {
    if (!needs) return false;
    circle(c, cx, cy, r, ring || accent);
    txt(c, initials(d), cx, cy + r * 0.3, { size: r * 0.85, weight: '800', color: onColor(ring || accent), align: 'center' });
    return true;
  }
  c.save();
  if (d.forme === 'logo') {
    const pad = ring ? 14 : 0;
    if (ring) {
      rpath(c, cx - r - pad, cy - r - pad, 2 * r + 2 * pad, 2 * r + 2 * pad, r * 0.22);
      c.fillStyle = '#fff';
      c.fill();
    }
    const k = Math.min((2 * r) / img.width, (2 * r) / img.height);
    c.drawImage(img, cx - (img.width * k) / 2, cy - (img.height * k) / 2, img.width * k, img.height * k);
    c.restore();
    return true;
  }
  const round = d.forme !== 'carre';
  if (ring) {
    if (round) circle(c, cx, cy, r + 8, ring);
    else {
      rpath(c, cx - r - 8, cy - r - 8, 2 * r + 16, 2 * r + 16, r * 0.22 + 8);
      c.fillStyle = ring;
      c.fill();
    }
  }
  if (round) {
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
  } else rpath(c, cx - r, cy - r, 2 * r, 2 * r, r * 0.22);
  c.clip();
  const m = Math.min(img.width, img.height);
  c.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, cx - r, cy - r, 2 * r, 2 * r);
  c.restore();
  return true;
}

const caps = (s) => String(s).toUpperCase();

/* ---------- Motifs partagés par les nouveaux modèles ---------- */
function glow(c, x, y, r, color, alpha) {
  const [R, G, B] = hexRgb(color);
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${R},${G},${B},${alpha})`);
  g.addColorStop(1, `rgba(${R},${G},${B},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

// Coins en équerre
function corners(c, inset, len, color, w) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = 'square';
  [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]].forEach(([x, y, sx, sy]) => {
    c.beginPath();
    c.moveTo(x + sx * len, y);
    c.lineTo(x, y);
    c.lineTo(x, y + sy * len);
    c.stroke();
  });
  c.restore();
}

// Motif inspiré des tissus wax : cercles concentriques en quinconce
function wax(c, x, y, w, h, a) {
  const s = 60;
  const dark = mix(a, '#000000', 0.35);
  const light = mix(a, '#ffffff', 0.82);
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  rect(c, x, y, w, h, a);
  for (let row = 0; row * s < h + s; row += 1) {
    for (let col = -1; col * s < w + s; col += 1) {
      const cx = x + col * s + (row % 2 ? s / 2 : 0) + s / 2;
      const cy = y + row * s + s / 2;
      circle(c, cx, cy, 26, '#f2a900');
      circle(c, cx, cy, 19, dark);
      circle(c, cx, cy, 12, light);
      circle(c, cx, cy, 5, '#f2a900');
    }
  }
  c.restore();
}

// Vague pleine en bas de la carte
function wave(c, y0, k, fill) {
  c.beginPath();
  c.moveTo(0, y0 + 45);
  c.bezierCurveTo(250, y0 - 20 + k, 450, y0 + 140 - k, 700, y0 + 60);
  c.bezierCurveTo(850, y0 + 5, 950, y0 + 30, W, y0 - 30);
  c.lineTo(W, H);
  c.lineTo(0, H);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

const goldOf = (a) => (lum(a) > 0.3 ? a : '#d4af37');

/* =====================================================
   Les 8 modèles (recto)
   ===================================================== */
const DESIGNS = {
  'carte-moderne'(c, d, img, a) {
    const fg = onColor(a);
    rect(c, 0, 0, W, H, '#fff');
    rect(c, 0, 0, 370, H, a);
    c.save();
    c.beginPath();
    c.rect(0, 0, 370, H);
    c.clip();
    c.globalAlpha = 0.12;
    circle(c, 30, 580, 190, '#fff');
    circle(c, 360, 20, 110, '#fff');
    c.restore();
    pic(c, img, d, 185, 215, 105, { ring: '#fff', needs: true, accent: a });
    let y = 410;
    if (d.entreprise.trim()) txt(c, d.entreprise.trim(), 185, y, { size: 30, weight: '800', color: fg, align: 'center', maxW: 310 });
    if (d.slogan.trim()) para(c, d.slogan.trim(), 185, y + 42, { size: 22, weight: '500', italic: true, color: fg, alpha: 0.85, align: 'center' }, 300, 30, 3);
    txt(c, d.nom.trim() || 'Votre nom', 420, 155, { size: 58, weight: '800', color: INK, maxW: 580 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 420, 207, { size: 30, weight: '600', color: inkOn(a), maxW: 580 });
    rect(c, 420, 240, 70, 5, a);
    lines(c, contactLines(d), 420, 310, { size: 27, gap: 52, maxH: 270, maxW: 590, iconColor: inkOn(a) });
  },

  'carte-classique'(c, d, img, a) {
    const ac = inkOn(a);
    rect(c, 0, 0, W, H, '#fff');
    rect(c, 0, 0, 26, H, a);
    rect(c, 26, 0, 6, H, mix(a, '#ffffff', 0.55));
    const has = pic(c, img, d, 900, 135, 75);
    txt(c, d.nom.trim() || 'Votre nom', 90, 175, { size: 62, fam: SERIF, color: ac, maxW: has ? 680 : 880 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 90, 226, { size: 30, fam: SERIF, weight: '400', italic: true, color: '#2b3550', maxW: has ? 680 : 880 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 90, 276, { size: 22, weight: '700', color: '#5b6475', spacing: 3, maxW: 620 });
    rect(c, 90, 302, 110, 4, a);
    lines(c, contactLines(d), 90, 368, { size: 26, gap: 46, maxH: 215, maxW: 540, iconColor: ac });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 960, 548, { size: 24, fam: SERIF, weight: '400', italic: true, color: '#5b6475', align: 'right', maxW: 330 });
  },

  'carte-sombre'(c, d, img, a) {
    const t = lift(a);
    rect(c, 0, 0, W, H, '#0f1a30');
    c.save();
    c.globalAlpha = 0.16;
    circle(c, 980, 30, 240, t);
    c.globalAlpha = 0.08;
    circle(c, 60, 640, 200, t);
    c.restore();
    rect(c, 60, 66, 70, 6, t);
    pic(c, img, d, 890, 165, 95, { ring: t, needs: true, accent: t });
    txt(c, d.nom.trim() || 'Votre nom', 60, 170, { size: 60, weight: '800', color: '#fff', maxW: 660 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 60, 222, { size: 30, weight: '600', color: t, maxW: 660 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 60, 268, { size: 22, weight: '700', color: '#fff', alpha: 0.65, spacing: 3, maxW: 660 });
    lines(c, contactLines(d), 60, 346, { size: 26, gap: 46, maxH: 230, maxW: 600, color: '#dfe7f5', iconColor: t });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 990, 548, { size: 24, weight: '500', italic: true, color: '#fff', alpha: 0.7, align: 'right', maxW: 340 });
  },

  'carte-degrade'(c, d, img, a0) {
    const a = lum(a0) > 0.6 ? mix(a0, '#000000', 0.35) : a0;
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, mix(a, '#ffffff', 0.1));
    g.addColorStop(1, mix(a, '#000000', 0.5));
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.save();
    c.globalAlpha = 0.09;
    circle(c, 930, 60, 270, '#fff');
    circle(c, 90, 600, 210, '#fff');
    c.restore();
    pic(c, img, d, 160, 165, 92, { ring: '#fff', needs: true, accent: a });
    txt(c, d.nom.trim() || 'Votre nom', 295, 150, { size: 58, weight: '800', color: '#fff', maxW: 690 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 295, 200, { size: 30, weight: '600', color: '#fff', alpha: 0.92, maxW: 690 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 295, 246, { size: 22, weight: '700', color: '#fff', alpha: 0.7, spacing: 3, maxW: 690 });
    rect(c, 70, 292, 90, 4, 'rgba(255,255,255,0.6)');
    lines(c, contactLines(d), 70, 360, { size: 27, gap: 48, maxH: 215, maxW: 620, color: '#fff', iconColor: '#fff' });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 990, 548, { size: 24, weight: '500', italic: true, color: '#fff', alpha: 0.8, align: 'right', maxW: 330 });
  },

  'carte-minimal'(c, d, img, a) {
    const ac = inkOn(a);
    rect(c, 0, 0, W, H, '#fff');
    const has = pic(c, img, d, W / 2, 112, 62);
    const ny = has ? 262 : 215;
    txt(c, d.nom.trim() || 'Votre nom', W / 2, ny, { size: 60, weight: '300', color: INK, align: 'center', spacing: 1, maxW: 900 });
    if (d.titre.trim()) txt(c, caps(d.titre.trim()), W / 2, ny + 50, { size: 22, weight: '700', color: ac, align: 'center', spacing: 4, maxW: 900 });
    rect(c, W / 2 - 30, ny + 80, 60, 4, a);
    centerLines(c, contactLines(d), W / 2, ny + 138, { size: 25, gap: 44, color: '#44506a', maxW: 900 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), W / 2, 560, { size: 20, weight: '700', color: ac, align: 'center', spacing: 4, maxW: 800 });
  },

  'carte-bandeau'(c, d, img, a) {
    const fg = onColor(a);
    const ac = inkOn(a);
    rect(c, 0, 0, W, H, '#fff');
    rect(c, 0, 0, W, 215, a);
    c.save();
    c.beginPath();
    c.rect(0, 0, W, 215);
    c.clip();
    c.globalAlpha = 0.1;
    circle(c, 700, 0, 160, '#fff');
    circle(c, 1000, 190, 110, '#fff');
    c.restore();
    txt(c, d.nom.trim() || 'Votre nom', 70, 112, { size: 58, weight: '800', color: fg, maxW: 650 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 70, 162, { size: 28, weight: '600', color: fg, alpha: 0.92, maxW: 650 });
    pic(c, img, d, 895, 215, 90, { ring: '#fff', needs: true, accent: a });
    const items = contactLines(d);
    const left = items.length > 3 ? items.slice(0, 3) : items;
    const right = items.length > 3 ? items.slice(3) : [];
    lines(c, left, 70, 305, { size: 26, gap: 56, maxW: right.length ? 420 : 600, iconColor: ac });
    if (right.length) lines(c, right, 500, 305, { size: 26, gap: 56, maxW: 290, iconColor: ac });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 70, 553, { size: 24, weight: '800', color: ac, spacing: 2, maxW: 400 });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 980, 553, { size: 24, weight: '500', italic: true, color: '#5b6475', align: 'right', maxW: 470 });
  },

  'carte-geometrique'(c, d, img, a) {
    const ac = inkOn(a);
    const fg = onColor(a);
    rect(c, 0, 0, W, H, '#fff');
    poly(c, [[655, 0], [690, 0], [500, H], [465, H]], mix(a, '#ffffff', 0.45));
    poly(c, [[690, 0], [W, 0], [W, H], [500, H]], a);
    pic(c, img, d, 855, 175, 95, { ring: '#fff', needs: true, accent: a });
    if (d.entreprise.trim()) txt(c, d.entreprise.trim(), 855, 342, { size: 30, weight: '800', color: fg, align: 'center', maxW: 290 });
    if (d.slogan.trim()) para(c, d.slogan.trim(), 855, 388, { size: 22, weight: '500', italic: true, color: fg, alpha: 0.9, align: 'center' }, 270, 30, 3);
    txt(c, d.nom.trim() || 'Votre nom', 60, 150, { size: 58, weight: '800', color: INK, maxW: 520 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 60, 202, { size: 30, weight: '600', color: ac, maxW: 500 });
    rect(c, 60, 238, 90, 5, a);
    lines(c, contactLines(d), 60, 308, { size: 26, gap: 46, maxH: 250, maxW: 410, iconColor: ac });
  },

  'carte-elegant'(c, d, img, a) {
    const ac = inkOn(a);
    rect(c, 0, 0, W, H, '#fbf6ea');
    c.save();
    c.strokeStyle = ac;
    c.lineWidth = 3;
    c.strokeRect(26, 26, W - 52, H - 52);
    c.globalAlpha = 0.6;
    c.lineWidth = 1.2;
    c.strokeRect(40, 40, W - 80, H - 80);
    c.restore();
    const has = pic(c, img, d, W / 2, 125, 56);
    const ny = has ? 258 : 215;
    txt(c, d.nom.trim() || 'Votre nom', W / 2, ny, { size: 58, fam: SERIF, weight: '700', color: INK, align: 'center', maxW: 820 });
    if (d.titre.trim()) txt(c, d.titre.trim(), W / 2, ny + 46, { size: 29, fam: SERIF, weight: '400', italic: true, color: ac, align: 'center', maxW: 820 });
    const dy = ny + 82;
    c.save();
    c.strokeStyle = ac;
    c.globalAlpha = 0.6;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(W / 2 - 150, dy);
    c.lineTo(W / 2 - 18, dy);
    c.moveTo(W / 2 + 18, dy);
    c.lineTo(W / 2 + 150, dy);
    c.stroke();
    c.restore();
    poly(c, [[W / 2, dy - 8], [W / 2 + 8, dy], [W / 2, dy + 8], [W / 2 - 8, dy]], ac);
    centerLines(c, contactLines(d), W / 2, ny + 138, { size: 24, gap: 44, color: '#3a4458', maxW: 820 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), W / 2, 530, { size: 20, weight: '700', color: ac, align: 'center', spacing: 4, maxW: 760 });
  },

  /* ----- Nouveaux modèles ----- */

  // Noir et or, cadre à coins
  'carte-luxe'(c, d, img, a) {
    const gold = goldOf(a);
    rect(c, 0, 0, W, H, '#0b0b0f');
    const sh = c.createLinearGradient(0, 0, W, H);
    sh.addColorStop(0, 'rgba(255,255,255,0.07)');
    sh.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sh;
    c.fillRect(0, 0, W, H);
    c.save();
    c.strokeStyle = gold;
    c.globalAlpha = 0.55;
    c.lineWidth = 1.6;
    c.strokeRect(30, 30, W - 60, H - 60);
    c.restore();
    corners(c, 30, 48, gold, 5);
    pic(c, img, d, 885, 205, 86, { ring: gold, needs: true, accent: gold });
    txt(c, d.nom.trim() || 'Votre nom', 100, 200, { size: 58, fam: SERIF, weight: '700', color: '#fff', maxW: 660 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 100, 250, { size: 29, fam: SERIF, weight: '400', italic: true, color: gold, maxW: 660 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 100, 300, { size: 21, weight: '700', color: '#fff', alpha: 0.6, spacing: 4, maxW: 660 });
    rect(c, 100, 326, 160, 2, gold);
    const items = contactLines(d);
    const o = { size: 26, gap: 56, color: '#ece7d8', iconColor: gold };
    if (items.length > 3) {
      lines(c, items.slice(0, 3), 100, 392, { ...o, maxW: 400 });
      lines(c, items.slice(3), 540, 392, { ...o, maxW: 400 });
    } else lines(c, items, 100, 392, { ...o, maxW: 640 });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 955, 556, { size: 22, fam: SERIF, weight: '400', italic: true, color: gold, alpha: 0.85, align: 'right', maxW: 380 });
  },

  // Vagues en bas, coordonnées sur la couleur
  'carte-vague'(c, d, img, a) {
    const fg = onColor(a);
    const ac = inkOn(a);
    rect(c, 0, 0, W, H, '#fff');
    const has = pic(c, img, d, 905, 130, 72);
    txt(c, d.nom.trim() || 'Votre nom', 70, 140, { size: 58, weight: '800', color: INK, maxW: has ? 730 : 900 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 70, 192, { size: 30, weight: '600', color: ac, maxW: has ? 730 : 900 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 70, 238, { size: 22, weight: '700', color: '#5b6475', spacing: 3, maxW: 700 });
    wave(c, 285, 0, mix(a, '#ffffff', 0.55));
    wave(c, 330, 0, a);
    const items = contactLines(d);
    const o = { size: 26, gap: 50, color: fg, iconColor: fg };
    if (items.length > 3) {
      lines(c, items.slice(0, 3), 70, 472, { ...o, maxW: 430 });
      lines(c, items.slice(3), 540, 472, { ...o, maxW: 440 });
    } else lines(c, items, 70, 472, { ...o, maxW: 700 });
  },

  // Bande de motif wax à gauche
  'carte-pagne'(c, d, img, a) {
    const ac = inkOn(a);
    rect(c, 0, 0, W, H, '#fff');
    wax(c, 0, 0, 300, H, a);
    circle(c, 150, 300, 122, '#fff');
    circle(c, 150, 300, 114, '#fff');
    c.save();
    c.strokeStyle = '#f2a900';
    c.lineWidth = 5;
    c.beginPath();
    c.arc(150, 300, 122, 0, Math.PI * 2);
    c.stroke();
    c.restore();
    pic(c, img, d, 150, 300, 100, { needs: true, accent: a });
    txt(c, d.nom.trim() || 'Votre nom', 360, 160, { size: 54, weight: '800', color: INK, maxW: 640 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 360, 210, { size: 29, weight: '600', color: ac, maxW: 640 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 360, 254, { size: 21, weight: '700', color: '#5b6475', spacing: 3, maxW: 640 });
    rect(c, 360, 280, 90, 5, '#f2a900');
    lines(c, contactLines(d), 360, 335, { size: 26, gap: 48, maxH: 246, maxW: 640, iconColor: ac });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 1000, 566, { size: 22, weight: '500', italic: true, color: '#5b6475', align: 'right', maxW: 620 });
  },

  // Fond nuit, halos et contour dégradé
  'carte-neon'(c, d, img, a) {
    const t = lift(a);
    const t2 = '#22d3ee';
    rect(c, 0, 0, W, H, '#070a1a');
    glow(c, 960, 40, 460, t, 0.5);
    glow(c, 40, 620, 420, t2, 0.26);
    const gb = c.createLinearGradient(0, 0, W, H);
    gb.addColorStop(0, t);
    gb.addColorStop(1, t2);
    c.save();
    c.strokeStyle = gb;
    c.lineWidth = 3;
    rpath(c, 24, 24, W - 48, H - 48, 30);
    c.stroke();
    c.restore();
    pic(c, img, d, 885, 180, 90, { ring: t, needs: true, accent: t });
    const tg = c.createLinearGradient(70, 0, 520, 0);
    tg.addColorStop(0, t);
    tg.addColorStop(1, t2);
    txt(c, d.nom.trim() || 'Votre nom', 70, 190, { size: 58, weight: '800', color: '#fff', maxW: 660 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 70, 242, { size: 30, weight: '700', color: tg, maxW: 660 });
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 70, 286, { size: 21, weight: '700', color: '#fff', alpha: 0.6, spacing: 4, maxW: 660 });
    rect(c, 70, 312, 110, 5, tg);
    const items = contactLines(d);
    const o = { size: 26, gap: 54, color: '#e5ecff', iconColor: t2 };
    if (items.length > 3) {
      lines(c, items.slice(0, 3), 70, 378, { ...o, maxW: 420 });
      lines(c, items.slice(3), 520, 378, { ...o, maxW: 420 });
    } else lines(c, items, 70, 378, { ...o, maxW: 640 });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 980, 556, { size: 22, weight: '500', italic: true, color: '#fff', alpha: 0.7, align: 'right', maxW: 340 });
  },

  // Grande photo pleine hauteur à gauche
  'carte-portrait'(c, d, img, a) {
    const ac = inkOn(a);
    const fg = onColor(a);
    const full = img && d.forme !== 'logo';
    rect(c, 0, 0, W, H, '#fff');
    c.save();
    c.beginPath();
    c.rect(0, 0, 400, H);
    c.clip();
    if (full) {
      const k = Math.max(400 / img.width, H / img.height);
      c.drawImage(img, (400 - img.width * k) / 2, (H - img.height * k) / 2, img.width * k, img.height * k);
      const g = c.createLinearGradient(0, 330, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.7)');
      c.fillStyle = g;
      c.fillRect(0, 0, 400, H);
    } else {
      rect(c, 0, 0, 400, H, a);
      c.globalAlpha = 0.12;
      circle(c, 40, 80, 190, '#fff');
      circle(c, 380, 600, 220, '#fff');
      c.globalAlpha = 1;
      if (img) pic(c, img, d, 200, 250, 110, { ring: '#fff', accent: a });
      else txt(c, initials(d), 200, 340, { size: 190, weight: '800', color: fg, alpha: 0.9, align: 'center' });
    }
    c.restore();
    if (d.entreprise.trim()) txt(c, d.entreprise.trim(), 200, 560, { size: 28, weight: '800', color: full || lum(a) < 0.45 ? '#fff' : INK, align: 'center', maxW: 340 });
    rect(c, 400, 0, 10, H, a);
    txt(c, d.nom.trim() || 'Votre nom', 465, 165, { size: 52, weight: '800', color: INK, maxW: 540 });
    if (d.titre.trim()) txt(c, d.titre.trim(), 465, 214, { size: 28, weight: '600', color: ac, maxW: 540 });
    rect(c, 465, 244, 80, 5, a);
    lines(c, contactLines(d), 465, 312, { size: 26, gap: 50, maxH: 230, maxW: 540, iconColor: ac });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 1000, 566, { size: 22, weight: '500', italic: true, color: '#5b6475', align: 'right', maxW: 530 });
  },

  // Icônes dans des pastilles, titre en étiquette
  'carte-pastilles'(c, d, img, a) {
    const ac = inkOn(a);
    rect(c, 0, 0, W, H, '#fff');
    rect(c, 0, 0, 18, H, a);
    c.save();
    c.globalAlpha = 0.2;
    for (let r = 0; r < 7; r += 1) for (let k = 0; k < 12; k += 1) circle(c, 690 + k * 29, 38 + r * 29, 3.4, a);
    c.restore();
    const has = pic(c, img, d, 905, 140, 72, { ring: '#fff' });
    txt(c, d.nom.trim() || 'Votre nom', 70, 135, { size: 58, weight: '800', color: INK, maxW: has ? 640 : 880 });
    let ty = 170;
    if (d.titre.trim()) {
      c.save();
      c.font = `700 24px ${FONT}`;
      const w = Math.min(c.measureText(d.titre.trim()).width + 44, has ? 600 : 800);
      c.restore();
      rpath(c, 70, ty, w, 46, 23);
      c.fillStyle = a;
      c.fill();
      txt(c, d.titre.trim(), 92, ty + 32, { size: 24, weight: '700', color: onColor(a), maxW: w - 44 });
      ty += 46;
    }
    if (d.entreprise.trim()) txt(c, caps(d.entreprise.trim()), 70, ty + 50, { size: 22, weight: '700', color: '#5b6475', spacing: 3, maxW: 640 });
    const items = contactLines(d);
    items.forEach((it, i) => {
      const col = items.length > 3 ? Math.floor(i / 3) : 0;
      const row = items.length > 3 ? i % 3 : i;
      const x = 70 + col * 480;
      const cy = 352 + row * 78;
      rpath(c, x, cy - 25, 50, 50, 15);
      c.fillStyle = mix(a, '#ffffff', 0.88);
      c.fill();
      icon(c, it.icon, x + 12, cy - 13, 26, ac);
      txt(c, it.text, x + 66, cy + 9, { size: 25, weight: '600', color: '#2b3550', maxW: col ? 405 : items.length > 3 ? 390 : 800 });
    });
    if (d.slogan.trim()) txt(c, d.slogan.trim(), 980, 572, { size: 22, weight: '500', italic: true, color: '#5b6475', align: 'right', maxW: 600 });
  },
};

/* =====================================================
   Verso : QR code + message
   ===================================================== */
const BACK = {
  'carte-moderne': 'accent',
  'carte-classique': 'light',
  'carte-sombre': 'dark',
  'carte-degrade': 'gradient',
  'carte-minimal': 'light',
  'carte-bandeau': 'accent',
  'carte-geometrique': 'stripe',
  'carte-elegant': 'cream',
  'carte-luxe': 'luxe',
  'carte-vague': 'wave',
  'carte-pagne': 'pagne',
  'carte-neon': 'neon',
  'carte-portrait': 'accent',
  'carte-pastilles': 'light',
};

let qrCache = { text: null, m: null };
export function qrMatrix(text) {
  if (qrCache.text === text) return qrCache.m;
  let m = null;
  for (const ecc of ['M', 'L']) {
    try {
      const q = qrcode(0, ecc);
      q.addData(text);
      q.make();
      m = { n: q.getModuleCount(), dark: (r, k) => q.isDark(r, k) };
      break;
    } catch {
      /* trop de données : on essaie un niveau de correction plus faible */
    }
  }
  qrCache = { text, m };
  return m;
}

function drawQR(c, m, x, y, size, color) {
  const cell = size / m.n;
  c.fillStyle = color;
  for (let r = 0; r < m.n; r += 1) {
    for (let k = 0; k < m.n; k += 1) {
      if (!m.dark(r, k)) continue;
      const x0 = Math.round(x + k * cell);
      const y0 = Math.round(y + r * cell);
      c.fillRect(x0, y0, Math.round(x + (k + 1) * cell) - x0, Math.round(y + (r + 1) * cell) - y0);
    }
  }
}

const QR_LABEL = {
  contact: 'Scannez pour enregistrer mon contact',
  whatsapp: 'Scannez pour m’écrire sur WhatsApp',
  site: 'Scannez pour visiter mon site',
};

function drawBack(c, d, a0, theme) {
  const a = theme === 'gradient' && lum(a0) > 0.6 ? mix(a0, '#000000', 0.35) : a0;
  let fg = INK;
  let tint = inkOn(a);
  let plate = '#fff';
  let plateLine = null;
  switch (theme) {
    case 'accent':
      rect(c, 0, 0, W, H, a);
      c.save();
      c.globalAlpha = 0.1;
      circle(c, 1000, 20, 220, '#fff');
      circle(c, 40, 600, 180, '#fff');
      c.restore();
      fg = onColor(a);
      tint = fg;
      break;
    case 'dark':
      rect(c, 0, 0, W, H, '#0f1a30');
      c.save();
      c.globalAlpha = 0.14;
      circle(c, 1000, 600, 260, lift(a));
      c.restore();
      fg = '#fff';
      tint = lift(a);
      break;
    case 'gradient': {
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, mix(a, '#ffffff', 0.1));
      g.addColorStop(1, mix(a, '#000000', 0.5));
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
      c.save();
      c.globalAlpha = 0.09;
      circle(c, 960, 40, 260, '#fff');
      c.restore();
      fg = '#fff';
      tint = '#fff';
      break;
    }
    case 'stripe':
      rect(c, 0, 0, W, H, '#fff');
      poly(c, [[W - 170, 0], [W, 0], [W, 170]], a);
      poly(c, [[0, H - 150], [150, H], [0, H]], mix(a, '#ffffff', 0.45));
      plateLine = a;
      break;
    case 'luxe': {
      const gold = goldOf(a);
      rect(c, 0, 0, W, H, '#0b0b0f');
      c.save();
      c.strokeStyle = gold;
      c.globalAlpha = 0.55;
      c.lineWidth = 1.6;
      c.strokeRect(30, 30, W - 60, H - 60);
      c.restore();
      corners(c, 30, 48, gold, 5);
      fg = '#fff';
      tint = gold;
      break;
    }
    case 'wave':
      rect(c, 0, 0, W, H, a);
      wave(c, 420, 0, 'rgba(255,255,255,0.09)');
      wave(c, 470, 0, 'rgba(255,255,255,0.09)');
      fg = onColor(a);
      tint = fg;
      break;
    case 'pagne':
      rect(c, 0, 0, W, H, '#fff');
      wax(c, W - 120, 0, 120, H, a);
      plateLine = a;
      break;
    case 'neon': {
      const t = lift(a);
      rect(c, 0, 0, W, H, '#070a1a');
      glow(c, 980, 600, 460, t, 0.45);
      glow(c, 40, 20, 380, '#22d3ee', 0.22);
      const gb = c.createLinearGradient(0, 0, W, H);
      gb.addColorStop(0, t);
      gb.addColorStop(1, '#22d3ee');
      c.save();
      c.strokeStyle = gb;
      c.lineWidth = 3;
      rpath(c, 24, 24, W - 48, H - 48, 30);
      c.stroke();
      c.restore();
      fg = '#fff';
      tint = '#22d3ee';
      break;
    }
    case 'cream':
      rect(c, 0, 0, W, H, '#fbf6ea');
      c.save();
      c.strokeStyle = tint;
      c.lineWidth = 3;
      c.strokeRect(26, 26, W - 52, H - 52);
      c.globalAlpha = 0.6;
      c.lineWidth = 1.2;
      c.strokeRect(40, 40, W - 80, H - 80);
      c.restore();
      plateLine = tint;
      break;
    default: // light
      rect(c, 0, 0, W, H, '#fff');
      rect(c, 0, 0, W, 16, a);
      rect(c, 0, H - 16, W, 16, a);
      plateLine = a;
  }

  // Plaque blanche + QR
  const bx = 85;
  const by = 110;
  const bs = 380;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.25)';
  c.shadowBlur = 24;
  c.shadowOffsetY = 8;
  rpath(c, bx, by, bs, bs, 26);
  c.fillStyle = plate;
  c.fill();
  c.restore();
  if (plateLine) {
    rpath(c, bx, by, bs, bs, 26);
    c.strokeStyle = plateLine;
    c.lineWidth = 4;
    c.stroke();
  }
  const m = qrMatrix(qrPayload(d));
  if (m) drawQR(c, m, bx + 26, by + 26, bs - 52, lum(a) < 0.2 ? a : '#111827');

  // Texte à droite
  const x = 535;
  const mw = theme === 'stripe' || theme === 'pagne' ? 370 : 430;
  const title = d.entreprise.trim() || d.nom.trim() || 'Votre nom';
  let y = para(c, title, x, 192, { size: 50, weight: '800', color: fg }, mw, 58, 2);
  const msg = d.versoTexte.trim() || d.slogan.trim();
  if (msg) para(c, msg, x, y + 4, { size: 28, weight: '500', italic: true, color: fg, alpha: 0.85 }, mw, 38, 3);
  rect(c, x, 405, 70, 5, tint);
  const qrLabel = d.qr === 'whatsapp' && waLinkOf(d) ? QR_LABEL.whatsapp : d.qr === 'site' && d.site.trim() ? QR_LABEL.site : QR_LABEL.contact;
  para(c, qrLabel, x, 450, { size: 26, weight: '700', color: tint }, mw, 34, 2);
}

/* =====================================================
   Rendu : s'adapte à la taille du canvas (aperçu, vignette, export)
   ===================================================== */
export function renderCard(canvas, data, img, face = 'recto') {
  const c = canvas.getContext('2d');
  const k = canvas.width / W;
  c.setTransform(k, 0, 0, k, 0, 0);
  c.clearRect(0, 0, W, H);
  c.save();
  c.beginPath();
  c.rect(0, 0, W, H);
  c.clip();
  const a = /^#[0-9a-f]{6}$/i.test(data.accent) ? data.accent : '#14213D';
  if (face === 'verso') drawBack(c, data, a, BACK[data.design] || 'light');
  else (DESIGNS[data.design] || DESIGNS['carte-moderne'])(c, data, img, a);
  c.restore();
}

// Primitives réutilisées par les affiches
export { txt, wrapLines, para, rect, circle, rpath, poly, icon, wax, glow, onColor, inkOn, lift, lum, hexRgb, initials, caps, FONT, SERIF, INK };
