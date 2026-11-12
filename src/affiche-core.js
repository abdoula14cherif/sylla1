import { txt, wrapLines, rect, circle, rpath, poly, icon, wax, glow, inkOn, lift, lum, mix, hexRgb, caps, FONT, SERIF, INK, fmtTel, siteLabel, intl, waLinkOf } from './card-core.js';

/* =====================================================
   Affiches et flyers
   Un seul contenu, trois formats. La mise en page est
   calculée automatiquement : les textes se réduisent
   pour tenir, la photo prend la place qui reste.
   ===================================================== */

// w x h : espace de dessin ; px : largeur de l'image exportée
export const FORMATS = [
  { id: 'a4', nom: 'Affiche A4', court: 'A4', w: 1000, h: 1414, px: 1240, print: true },
  { id: 'story', nom: 'Statut WhatsApp', court: 'Statut', w: 1000, h: 1778, px: 1080 },
  { id: 'carre', nom: 'Carré Facebook', court: 'Carré', w: 1000, h: 1000, px: 1080 },
];
export const formatOf = (id) => FORMATS.find((f) => f.id === id) || FORMATS[0];

export const AFFICHE_DESIGNS = [
  { id: 'aff-audace', nom: 'Audace' },
  { id: 'aff-net', nom: 'Net' },
  { id: 'aff-nuit', nom: 'Nuit' },
  { id: 'aff-vague', nom: 'Vague' },
  { id: 'aff-pagne', nom: 'Pagne' },
  { id: 'aff-promo', nom: 'Soldes' },
  { id: 'aff-photo', nom: 'Photo' },
  { id: 'aff-elegant', nom: 'Élégant' },
];

export const AFFICHE_COLORS = [
  { c: '#B42318', nom: 'Rouge' },
  { c: '#14213D', nom: 'Bleu nuit' },
  { c: '#0B7A4B', nom: 'Vert' },
  { c: '#6B3FA0', nom: 'Violet' },
  { c: '#0E7490', nom: 'Turquoise' },
  { c: '#C2410C', nom: 'Orange' },
  { c: '#BE185D', nom: 'Rose' },
  { c: '#1F2933', nom: 'Anthracite' },
];

export const blankAffiche = () => ({
  design: 'aff-audace',
  accent: '#B42318',
  format: 'a4',
  theme: '',
  accroche: '',
  titre: '',
  sousTitre: '',
  points: '',
  prixLabel: '',
  prix: '',
  quand: '',
  lieu: '',
  entreprise: '',
  tel: '',
  whatsapp: '',
  email: '',
  site: '',
  reseau: '',
  photo: '',
  logo: '',
});

/* ---------- Thèmes : un texte de départ pour chaque usage ---------- */
export const THEMES = [
  {
    id: 'promo',
    nom: 'Promotion',
    design: 'aff-promo',
    accent: '#B42318',
    data: { accroche: 'Promotion', titre: 'Jusqu’à -50% sur toute la boutique', sousTitre: 'Une semaine pour faire de bonnes affaires', points: 'Livraison gratuite à domicile\nPaiement MoMo et Orange Money\nSatisfait ou remboursé', prixLabel: '', prix: '', quand: 'Du 15 au 22 novembre', lieu: 'Marché Mokolo, Yaoundé' },
  },
  {
    id: 'ouverture',
    nom: 'Ouverture',
    design: 'aff-audace',
    accent: '#0B7A4B',
    data: { accroche: 'Grande ouverture', titre: 'Venez découvrir notre nouvelle boutique', sousTitre: 'Cadeaux et réductions pour les 50 premiers clients', points: 'Réductions de lancement\nCadeaux surprise\nDégustation offerte', prixLabel: '', prix: '', quand: 'Samedi 21 novembre à 10h', lieu: 'Akwa, Douala' },
  },
  {
    id: 'evenement',
    nom: 'Soirée',
    design: 'aff-nuit',
    accent: '#6B3FA0',
    data: { accroche: 'Événement', titre: 'Grande soirée Afro Vibes', sousTitre: 'DJ, danse et cocktails toute la nuit', points: 'Tables VIP disponibles\nDress code : tenue wax\nParking sécurisé', prixLabel: 'Entrée', prix: '3 000 FCFA', quand: 'Samedi 28 novembre à 21h', lieu: 'Hôtel Sawa, Douala' },
  },
  {
    id: 'service',
    nom: 'Service',
    design: 'aff-net',
    accent: '#0E7490',
    data: { accroche: 'Nos services', titre: 'Plomberie et électricité à domicile', sousTitre: 'Intervention rapide, travail garanti', points: 'Devis gratuit\nDisponible 7j/7\nTechniciens qualifiés', prixLabel: 'À partir de', prix: '5 000 FCFA', quand: '', lieu: 'Douala et environs' },
  },
  {
    id: 'formation',
    nom: 'Formation',
    design: 'aff-vague',
    accent: '#14213D',
    data: { accroche: 'Formation', titre: 'Apprenez le marketing digital en 4 semaines', sousTitre: 'Cours pratiques, certificat à la fin', points: 'Cours en ligne et en présentiel\nGroupes de 15 personnes\nCertificat remis', prixLabel: 'Tarif', prix: '45 000 FCFA', quand: 'Début le 1er décembre', lieu: 'Bastos, Yaoundé' },
  },
  {
    id: 'restaurant',
    nom: 'Restaurant',
    design: 'aff-pagne',
    accent: '#C2410C',
    data: { accroche: 'Menu du jour', titre: 'Poulet DG et plantains mûrs', sousTitre: 'Cuisiné chaque jour avec des produits frais', points: 'Boisson incluse\nLivraison en 30 minutes\nPlats à emporter', prixLabel: '', prix: '2 500 FCFA', quand: 'Du lundi au samedi', lieu: 'Bonapriso, Douala' },
  },
  {
    id: 'immo',
    nom: 'Location',
    design: 'aff-elegant',
    accent: '#14213D',
    data: { accroche: 'À louer', titre: 'Appartement 2 chambres à Bonamoussadi', sousTitre: 'Quartier calme, proche de toutes les commodités', points: 'Salon spacieux et cuisine équipée\nEau et électricité 24h/24\nParking privé', prixLabel: 'Loyer', prix: '120 000 FCFA / mois', quand: 'Disponible dès le 1er décembre', lieu: 'Bonamoussadi, Douala' },
  },
  {
    id: 'emploi',
    nom: 'Recrutement',
    design: 'aff-photo',
    accent: '#1F2933',
    data: { accroche: 'Nous recrutons', titre: 'Commerciaux terrain', sousTitre: 'Rejoignez une équipe qui grandit', points: 'Salaire fixe et commissions\nFormation assurée\nDébutants acceptés', prixLabel: '', prix: '', quand: 'Candidatures avant le 30 novembre', lieu: 'Douala' },
  },
];

export const DEMO_CONTACT = { entreprise: 'Atlantique Services', tel: '+237 6 00 00 00 00', whatsapp: '', email: 'contact@atlantique.cm', site: 'www.atlantique.cm', reseau: '@atlantique.services' };

// « Vide » = aucun contenu rédigé (les coordonnées reprises de la carte ne comptent pas)
export const isEmptyAff = (d) => !['titre', 'accroche', 'sousTitre', 'points', 'prix', 'quand', 'lieu'].some((k) => d[k].trim());
export const withDemoAff = (d) => {
  if (!isEmptyAff(d)) return d;
  const hasContact = d.tel.trim() || d.email.trim() || d.entreprise.trim();
  return { ...d, ...THEMES[0].data, ...(hasContact ? {} : DEMO_CONTACT) };
};

export const pointsOf = (d) =>
  d.points
    .split('\n')
    .map((l) => l.replace(/^\s*[-•*✓]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 6);

export function contactItems(d) {
  const L = [];
  if (d.tel.trim()) L.push({ icon: 'phone', text: fmtTel(d.tel) });
  if (d.whatsapp.trim() && intl(d.whatsapp) !== intl(d.tel)) L.push({ icon: 'chat', text: fmtTel(d.whatsapp) });
  if (d.email.trim()) L.push({ icon: 'mail', text: d.email.trim() });
  if (d.site.trim()) L.push({ icon: 'globe', text: siteLabel(d.site) });
  if (d.reseau.trim()) L.push({ icon: 'at', text: d.reseau.trim() });
  return L;
}

export function afficheText(d) {
  const L = [];
  if (d.accroche.trim()) L.push(caps(d.accroche.trim()));
  if (d.titre.trim()) L.push(d.titre.trim());
  if (d.sousTitre.trim()) L.push(d.sousTitre.trim());
  const pts = pointsOf(d);
  if (pts.length) L.push('', ...pts.map((p) => `✅ ${p}`));
  if (d.prix.trim()) L.push('', `💰 ${[d.prixLabel.trim(), d.prix.trim()].filter(Boolean).join(' ')}`);
  if (d.quand.trim()) L.push(`📅 ${d.quand.trim()}`);
  if (d.lieu.trim()) L.push(`📍 ${d.lieu.trim()}`);
  const ci = contactItems(d);
  if (ci.length || d.entreprise.trim()) L.push('');
  if (d.entreprise.trim()) L.push(d.entreprise.trim());
  if (d.tel.trim()) L.push(`📞 ${fmtTel(d.tel)}`);
  if (d.whatsapp.trim() && intl(d.whatsapp) !== intl(d.tel)) L.push(`💬 ${fmtTel(d.whatsapp)}`);
  if (d.email.trim()) L.push(`✉️ ${d.email.trim()}`);
  if (d.site.trim()) L.push(`🌐 ${siteLabel(d.site)}`);
  const wa = waLinkOf({ whatsapp: d.whatsapp, tel: d.tel });
  if (wa) L.push('', `Écrivez-nous : ${wa}`);
  return L.join('\n');
}

/* =====================================================
   Les 8 modèles : palette + décor de fond
   ===================================================== */
const GOLD = '#f2a900';
// Choisit entre encre foncée et blanc selon le meilleur contraste (norme WCAG)
const readable = (bg) => {
  const L = lum(bg);
  const contrast = (l2) => (Math.max(L, l2) + 0.05) / (Math.min(L, l2) + 0.05);
  return contrast(lum(INK)) > contrast(1) ? INK : '#ffffff';
};
const accent2Of = (a) => (lum(a) > 0.42 ? INK : GOLD);
const fixA = (a) => (/^#[0-9a-f]{6}$/i.test(a) ? a : '#B42318');

function gradient(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

function cover(c, img, x, y, w, h) {
  const k = Math.max(w / img.width, h / img.height);
  const iw = img.width * k;
  const ih = img.height * k;
  c.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

const DESIGNS = {
  /* Aplat de couleur, formes géantes, étiquette dorée */
  'aff-audace': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', logoPlate: true,
    pal: (a) => {
      const fg = readable(a);
      const a2 = accent2Of(a);
      return { headFg: fg, bodyFg: fg, accent: a2, check: readable(a2), pillBg: a2, pillFg: readable(a2), priceBg: a2, priceFg: readable(a2), footerBg: mix(a, '#000000', 0.42), footerFg: '#fff', heroRing: '#fff' };
    },
    paint(c, F, P, a) {
      rect(c, 0, 0, F.w, F.h, a);
      c.save();
      c.globalAlpha = 0.1;
      circle(c, F.w + 50, -30, 430, '#fff');
      circle(c, -80, F.h * 0.6, 320, '#fff');
      c.globalAlpha = 0.07;
      poly(c, [[F.w * 0.55, F.h], [F.w, F.h * 0.55], [F.w, F.h]], '#fff');
      c.restore();
    },
  },

  /* Blanc, barre de couleur, très lisible */
  'aff-net': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag',
    pal: (a) => ({ headFg: INK, titleFg: inkOn(a), bodyFg: '#26314a', accent: a, check: readable(a), pillBg: a, pillFg: readable(a), priceBg: a, priceFg: readable(a), footerBg: a, footerFg: readable(a) }),
    paint(c, F, P, a) {
      rect(c, 0, 0, F.w, F.h, '#fff');
      rect(c, 0, 0, F.w, 30, a);
      c.save();
      c.globalAlpha = 0.07;
      circle(c, F.w - 40, 280, 300, a);
      circle(c, 20, F.h - 380, 240, a);
      c.restore();
    },
  },

  /* Fond nuit, halos de couleur */
  'aff-nuit': {
    align: 'center', upper: true, fam: FONT, wt: '800', price: 'tag', logoPlate: true,
    pal: (a) => {
      const t = lift(a);
      return { headFg: '#fff', titleFg: '#fff', bodyFg: '#e5ecff', accent: t, check: readable(t), pillBg: t, pillFg: readable(t), priceBg: t, priceFg: readable(t), footerBg: 'rgba(255,255,255,0.08)', footerFg: '#fff', heroRing: t, footerLine: t };
    },
    paint(c, F, P, a) {
      const t = lift(a);
      c.fillStyle = gradient(c, 0, 0, 0, F.h, [[0, '#0b1020'], [1, '#141b3a']]);
      c.fillRect(0, 0, F.w, F.h);
      const g = (x, y, r, col, al) => {
        const [R, G, B] = hexRgb(col);
        const rg = c.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, `rgba(${R},${G},${B},${al})`);
        rg.addColorStop(1, `rgba(${R},${G},${B},0)`);
        c.fillStyle = rg;
        c.fillRect(0, 0, F.w, F.h);
      };
      g(F.w * 0.9, F.h * 0.08, F.w * 0.9, t, 0.5);
      g(F.w * 0.05, F.h * 0.75, F.w * 0.8, '#22d3ee', 0.2);
      c.save();
      c.strokeStyle = t;
      c.globalAlpha = 0.5;
      c.lineWidth = 3;
      rpath(c, 28, 28, F.w - 56, F.h - 56, 34);
      c.stroke();
      c.restore();
    },
  },

  /* Bandeau courbe en haut, contenu clair */
  'aff-vague': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag', logoPlate: false, headPad: 78,
    pal: (a) => {
      const a2 = accent2Of(a);
      return { headFg: readable(a), titleFg: readable(a), bodyFg: '#26314a', accent: a, check: readable(a), pillBg: a2, pillFg: readable(a2), priceBg: a, priceFg: readable(a), footerBg: a, footerFg: readable(a) };
    },
    paint(c, F, P, a, info) {
      rect(c, 0, 0, F.w, F.h, '#fff');
      const hb = info.headBottom + 40;
      const wave = (y0, fill) => {
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(F.w, 0);
        c.lineTo(F.w, y0 - 30);
        c.bezierCurveTo(F.w * 0.75, y0 + 50, F.w * 0.4, y0 - 60, 0, y0 + 20);
        c.closePath();
        c.fillStyle = fill;
        c.fill();
      };
      wave(hb + 34, mix(a, '#ffffff', 0.55));
      wave(hb, a);
    },
  },

  /* Bandes de motif wax en haut et en bas */
  'aff-pagne': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', top: 160, bottom: 76,
    pal: (a) => ({ headFg: INK, titleFg: inkOn(a), bodyFg: '#26314a', accent: a, check: readable(a), pillBg: a, pillFg: readable(a), priceBg: GOLD, priceFg: INK, footerBg: a, footerFg: readable(a), footerLine: GOLD }),
    paint(c, F, P, a) {
      rect(c, 0, 0, F.w, F.h, '#fff');
      wax(c, 0, 0, F.w, 110, a);
      rect(c, 0, 110, F.w, 8, GOLD);
      wax(c, 0, F.h - 76, F.w, 76, a);
    },
  },

  /* Rayons de soleil et pastille de prix explosive */
  'aff-promo': {
    align: 'center', upper: true, fam: FONT, wt: '800', price: 'burst', logoPlate: true,
    pal: (a) => {
      const fg = readable(a);
      const a2 = accent2Of(a);
      return { headFg: fg, bodyFg: fg, accent: a2, check: readable(a2), pillBg: a2, pillFg: readable(a2), priceBg: a2, priceFg: readable(a2), footerBg: mix(a, '#000000', 0.45), footerFg: '#fff', heroRing: '#fff' };
    },
    paint(c, F, P, a) {
      rect(c, 0, 0, F.w, F.h, a);
      const cx = F.w / 2;
      const cy = F.h * 0.42;
      const n = 28;
      const R = F.h * 1.4;
      for (let i = 0; i < n; i += 2) {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;
        poly(c, [[cx, cy], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R]], mix(a, '#ffffff', 0.13));
      }
      const [r, g, b] = hexRgb(mix(a, '#000000', 0.55));
      const rg = c.createRadialGradient(cx, cy, F.w * 0.25, cx, cy, F.h * 0.8);
      rg.addColorStop(0, `rgba(${r},${g},${b},0)`);
      rg.addColorStop(1, `rgba(${r},${g},${b},0.55)`);
      c.fillStyle = rg;
      c.fillRect(0, 0, F.w, F.h);
    },
  },

  /* Photo plein cadre sous un voile sombre */
  'aff-photo': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', photoBg: true, logoPlate: true,
    pal: (a) => {
      const t = lum(a) < 0.22 ? lift(a) : a;
      const a2 = lum(t) > 0.45 ? INK : t;
      return { headFg: '#fff', titleFg: '#fff', bodyFg: '#fff', accent: t, check: readable(t), pillBg: t, pillFg: readable(t), priceBg: t, priceFg: readable(t), footerBg: 'rgba(0,0,0,0.55)', footerFg: '#fff', _a2: a2 };
    },
    paint(c, F, P, a, info, imgs) {
      if (imgs.photo) {
        rect(c, 0, 0, F.w, F.h, '#000');
        cover(c, imgs.photo, 0, 0, F.w, F.h);
      } else {
        c.fillStyle = gradient(c, 0, 0, F.w, F.h, [[0, mix(a, '#ffffff', 0.08)], [1, mix(a, '#000000', 0.6)]]);
        c.fillRect(0, 0, F.w, F.h);
      }
      c.fillStyle = gradient(c, 0, 0, 0, F.h, [[0, 'rgba(0,0,0,0.55)'], [0.45, 'rgba(0,0,0,0.5)'], [1, 'rgba(0,0,0,0.85)']]);
      c.fillRect(0, 0, F.w, F.h);
    },
  },

  /* Crème, double filet, serif centré */
  'aff-elegant': {
    align: 'center', upper: false, fam: SERIF, wt: '700', price: 'plain', margin: 120, top: 130, bottom: 40, pillOutline: true,
    pal: (a) => ({ headFg: INK, titleFg: INK, bodyFg: '#33405a', accent: inkOn(a), check: '#fff', pillBg: inkOn(a), pillFg: inkOn(a), priceBg: inkOn(a), priceFg: inkOn(a), footerBg: null, footerFg: '#33405a', footerLine: inkOn(a) }),
    paint(c, F, P, a) {
      const ac = inkOn(a);
      rect(c, 0, 0, F.w, F.h, '#fbf6ea');
      c.save();
      c.strokeStyle = ac;
      c.lineWidth = 4;
      c.strokeRect(40, 40, F.w - 80, F.h - 80);
      c.globalAlpha = 0.6;
      c.lineWidth = 1.5;
      c.strokeRect(58, 58, F.w - 116, F.h - 116);
      c.restore();
    },
  },
};

/* =====================================================
   Mise en page automatique
   ===================================================== */
function planBlocks(c, d, F, D, P, imgs, s, heroH, titleCap = 160) {
  const M = D.margin || 70;
  const CW = F.w - 2 * M;
  const center = D.align === 'center';
  const ax = center ? F.w / 2 : M;
  const al = center ? 'center' : 'left';
  const blocks = [];
  const add = (zone, h, draw) => blocks.push({ zone, h, draw });
  const fam = D.fam;

  /* En-tête : logo + nom de l'entreprise */
  const hasLogo = !!imgs.logo;
  const name = d.entreprise.trim();
  if (hasLogo || name) {
    const ls = 92 * s;
    const plate = D.logoPlate && hasLogo;
    const boxW = hasLogo ? ls + (plate ? 24 * s : 0) : 0;
    const nameSize = 30 * s;
    c.save();
    c.font = `800 ${nameSize}px ${FONT}`;
    c.letterSpacing = `${3 * s}px`;
    const nameW = name ? Math.min(c.measureText(caps(name)).width, CW - boxW - 24 * s) : 0;
    c.restore();
    const rowW = boxW + (hasLogo && name ? 24 * s : 0) + nameW;
    add('head', Math.max(boxW, nameSize), (y) => {
      let x = center ? (F.w - rowW) / 2 : M;
      const cy = y + Math.max(boxW, nameSize) / 2;
      if (hasLogo) {
        if (plate) {
          rpath(c, x, cy - boxW / 2, boxW, boxW, 18 * s);
          c.fillStyle = '#fff';
          c.fill();
        }
        const pad = plate ? 12 * s : 0;
        const k = Math.min(ls / imgs.logo.width, ls / imgs.logo.height);
        const w = imgs.logo.width * k;
        const h = imgs.logo.height * k;
        c.drawImage(imgs.logo, x + pad + (ls - w) / 2, cy - h / 2, w, h);
        x += boxW + 24 * s;
      }
      if (name) txt(c, caps(name), x, cy + nameSize * 0.35, { size: nameSize, weight: '800', color: P.headFg, spacing: 3 * s, maxW: nameW + 2 });
    });
  }

  /* Accroche en pastille */
  if (d.accroche.trim()) {
    const size = 30 * s;
    const text = caps(d.accroche.trim());
    c.save();
    c.font = `800 ${size}px ${FONT}`;
    c.letterSpacing = `${4 * s}px`;
    const tw = Math.min(c.measureText(text).width, CW - 70 * s);
    c.restore();
    const pw = tw + 64 * s;
    const ph = 62 * s;
    add('head', ph, (y) => {
      const x = center ? (F.w - pw) / 2 : M;
      rpath(c, x, y, pw, ph, ph / 2);
      if (D.pillOutline) {
        c.strokeStyle = P.pillBg;
        c.lineWidth = 3;
        c.stroke();
      } else {
        c.fillStyle = P.pillBg;
        c.fill();
      }
      txt(c, text, x + pw / 2, y + ph / 2 + size * 0.35, { size, weight: '800', color: P.pillFg, align: 'center', spacing: 4 * s, maxW: tw + 2 });
    });
  }

  /* Titre : la plus grande taille qui tient en 3 lignes */
  if (d.titre.trim()) {
    const raw = d.titre.trim();
    const text = D.upper ? raw.toUpperCase() : raw;
    let size = titleCap * s;
    let lines = [];
    for (; size >= 40 * s; size -= 4) {
      lines = wrapLines(c, text, CW, { size, weight: D.wt, fam }, 99);
      c.save();
      c.font = `${D.wt} ${size}px ${fam}`;
      const wide = lines.some((l) => c.measureText(l).width > CW);
      c.restore();
      if (lines.length <= 3 && !wide) break;
    }
    const lh = size * 1.06;
    add('head', lines.length * lh, (y) => {
      lines.forEach((l, i) => txt(c, l, ax, y + size * 0.86 + i * lh, { size, weight: D.wt, fam, color: P.titleFg || P.headFg, align: al, maxW: CW }));
    });
  }

  /* Sous-titre */
  if (d.sousTitre.trim()) {
    const size = 38 * s;
    const o = { size, weight: '500', fam: D.fam === SERIF ? SERIF : FONT, italic: D.fam === SERIF };
    const lines = wrapLines(c, d.sousTitre.trim(), CW, o, 3);
    const lh = size * 1.32;
    add('head', lines.length * lh, (y) => {
      lines.forEach((l, i) => txt(c, l, ax, y + size * 0.9 + i * lh, { ...o, color: P.headFg, alpha: 0.92, align: al, maxW: CW }));
    });
  }

  /* Espace sous un bandeau de couleur (la courbe du modèle Vague) */
  if (D.headPad) add('pad', D.headPad * s, () => {});

  /* Photo principale */
  if (heroH > 0 && imgs.photo && !D.photoBg) {
    add('body', heroH, (y) => {
      c.save();
      if (P.heroRing) {
        rpath(c, M - 8, y - 8, CW + 16, heroH + 16, 34);
        c.fillStyle = P.heroRing;
        c.fill();
      } else {
        c.shadowColor = 'rgba(0,0,0,0.25)';
        c.shadowBlur = 28;
        c.shadowOffsetY = 10;
        rpath(c, M, y, CW, heroH, 26);
        c.fillStyle = '#fff';
        c.fill();
        c.shadowColor = 'transparent';
      }
      rpath(c, M, y, CW, heroH, 26);
      c.clip();
      cover(c, imgs.photo, M, y, CW, heroH);
      c.restore();
    });
  }

  /* Points forts */
  const pts = pointsOf(d);
  if (pts.length) {
    const size = 35 * s;
    const lh = 58 * s;
    const r = 18 * s;
    c.save();
    c.font = `600 ${size}px ${FONT}`;
    const widest = Math.min(CW - 2 * r - 22 * s, Math.max(...pts.map((p) => c.measureText(p).width)));
    c.restore();
    const listW = widest + 2 * r + 22 * s;
    add('body', pts.length * lh - (lh - 2 * r) * 0, (y) => {
      const x0 = center ? (F.w - listW) / 2 : M;
      pts.forEach((p, i) => {
        const cy = y + i * lh + r;
        circle(c, x0 + r, cy, r, P.accent);
        icon(c, 'check', x0 + r - r * 0.55, cy - r * 0.55, r * 1.1, P.check);
        txt(c, p, x0 + 2 * r + 22 * s, cy + size * 0.34, { size, weight: '600', color: P.bodyFg, maxW: widest + 2 });
      });
    });
  }

  /* Prix */
  if (d.prix.trim()) {
    const label = d.prixLabel.trim();
    const price = d.prix.trim();
    if (D.price === 'burst') {
      const R = 150 * s;
      add('body', 2 * R, (y) => {
        const cx = center ? F.w / 2 : M + R;
        const cy = y + R;
        const n = 22;
        const pts2 = [];
        for (let i = 0; i < n * 2; i += 1) {
          const ang = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2 - 0.14;
          const rr = i % 2 ? R * 0.86 : R;
          pts2.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
        }
        c.save();
        c.shadowColor = 'rgba(0,0,0,0.3)';
        c.shadowBlur = 24;
        c.shadowOffsetY = 8;
        poly(c, pts2, P.priceBg);
        c.restore();
        const inner = R * 1.5;
        if (label) txt(c, caps(label), cx, cy - R * 0.32, { size: 26 * s, weight: '800', color: P.priceFg, align: 'center', spacing: 2 * s, maxW: inner, alpha: 0.85 });
        txt(c, price, cx, cy + (label ? R * 0.22 : R * 0.12), { size: 62 * s, weight: '800', color: P.priceFg, align: 'center', maxW: inner });
      });
    } else if (D.price === 'plain') {
      const size = 84 * s;
      add('body', (label ? 40 * s : 0) + size * 1.1 + 36 * s, (y) => {
        const lw = 260 * s;
        let yy = y;
        c.save();
        c.strokeStyle = P.accent;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(ax - lw / 2, yy + 4);
        c.lineTo(ax + lw / 2, yy + 4);
        c.stroke();
        c.restore();
        yy += 28 * s;
        if (label) {
          txt(c, caps(label), ax, yy + 14 * s, { size: 26 * s, weight: '700', color: P.bodyFg, align: 'center', spacing: 4 * s, maxW: CW });
          yy += 40 * s;
        }
        txt(c, price, ax, yy + size * 0.8, { size, fam: SERIF, weight: '700', color: P.accent, align: 'center', maxW: CW });
      });
    } else {
      const size = 78 * s;
      const th = (label ? 34 * s : 0) + size * 1.05 + 40 * s;
      c.save();
      c.font = `800 ${size}px ${FONT}`;
      const tw = Math.min(c.measureText(price).width, CW - 80 * s);
      c.restore();
      const pw = Math.max(tw + 80 * s, 380 * s);
      add('body', th, (y) => {
        const x = center ? (F.w - pw) / 2 : M;
        c.save();
        c.shadowColor = 'rgba(0,0,0,0.22)';
        c.shadowBlur = 18;
        c.shadowOffsetY = 6;
        rpath(c, x, y, pw, th, 26 * s);
        c.fillStyle = P.priceBg;
        c.fill();
        c.restore();
        let yy = y + 22 * s;
        if (label) {
          txt(c, caps(label), x + pw / 2, yy + 20 * s, { size: 26 * s, weight: '800', color: P.priceFg, align: 'center', spacing: 3 * s, maxW: pw - 40, alpha: 0.85 });
          yy += 34 * s;
        }
        txt(c, price, x + pw / 2, yy + size * 0.82, { size, weight: '800', color: P.priceFg, align: 'center', maxW: pw - 40 * s });
      });
    }
  }

  /* Date et lieu */
  const infos = [];
  if (d.quand.trim()) infos.push({ icon: 'calendar', text: d.quand.trim() });
  if (d.lieu.trim()) infos.push({ icon: 'pin', text: d.lieu.trim() });
  if (infos.length) {
    const size = 36 * s;
    const lh = 58 * s;
    add('body', infos.length * lh, (y) => {
      infos.forEach((it, i) => {
        const yy = y + i * lh + lh / 2;
        const isz = size * 1.05;
        c.save();
        c.font = `700 ${size}px ${FONT}`;
        const tw = Math.min(c.measureText(it.text).width, CW - isz - 18 * s);
        c.restore();
        const x0 = center ? (F.w - (isz + 18 * s + tw)) / 2 : M;
        icon(c, it.icon, x0, yy - isz / 2, isz, P.accent);
        txt(c, it.text, x0 + isz + 18 * s, yy + size * 0.34, { size, weight: '700', color: P.bodyFg, maxW: tw + 2 });
      });
    });
  }
  return blocks;
}

function footerPlan(c, d, F, D, P) {
  const items = contactItems(d);
  if (!items.length) return { h: 0, items };
  const rows = Math.ceil(items.length / 2);
  return { h: rows * 54 + 60, items };
}

function drawFooter(c, F, D, P, fp, y) {
  if (!fp.h) return;
  const M = D.margin || 70;
  const bandBottom = F.h - (D.bottom || 0);
  if (P.footerBg) {
    c.fillStyle = P.footerBg;
    c.fillRect(0, y, F.w, bandBottom - y);
  }
  if (P.footerLine) {
    c.save();
    c.strokeStyle = P.footerLine;
    c.globalAlpha = P.footerBg ? 1 : 0.7;
    c.lineWidth = P.footerBg ? 5 : 2;
    c.beginPath();
    c.moveTo(P.footerBg ? 0 : M, y);
    c.lineTo(P.footerBg ? F.w : F.w - M, y);
    c.stroke();
    c.restore();
  }
  const items = fp.items;
  const colW = (F.w - 2 * M) / 2;
  const single = items.length === 1;
  items.forEach((it, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const size = 31;
    const cy = y + 30 + row * 54 + 27;
    let x = M + col * colW;
    let maxW = colW - 20;
    if (single) {
      maxW = F.w - 2 * M - 50;
    }
    if (D.align === 'center' && (single || (items.length % 2 === 1 && i === items.length - 1))) {
      c.save();
      c.font = `600 ${size}px ${FONT}`;
      const tw = Math.min(c.measureText(it.text).width, maxW - 50);
      c.restore();
      x = (F.w - (size + 16 + tw)) / 2;
    }
    icon(c, it.icon, x, cy - size / 2 - 1, size, P.footerFg);
    txt(c, it.text, x + size + 16, cy + size * 0.34, { size, weight: '600', color: P.footerFg, maxW: maxW - size - 16 });
  });
}

export function renderAffiche(canvas, data, imgs, fmtId = 'a4') {
  const F = formatOf(fmtId);
  const c = canvas.getContext('2d');
  const k = canvas.width / F.w;
  c.setTransform(k, 0, 0, k, 0, 0);
  c.clearRect(0, 0, F.w, F.h);
  c.save();
  c.beginPath();
  c.rect(0, 0, F.w, F.h);
  c.clip();

  const a = fixA(data.accent);
  const D = DESIGNS[data.design] || DESIGNS['aff-audace'];
  const P = D.pal(a);
  const fp = footerPlan(c, data, F, D, P);
  const top = D.top || 84;
  const footerTop = F.h - (D.bottom || 0) - fp.h;
  const avail = footerTop - top - 34;
  const gapBase = 32;
  const wantsHero = !!imgs.photo && !D.photoBg;

  // On cherche la plus grande échelle qui laisse la place à la photo, sinon on se passe de photo
  const sum = (bl, g) => bl.reduce((t, b) => t + b.h, 0) + g * Math.max(0, bl.length - 1);
  let s = 0.5;
  let heroH = 0;
  let found = false;
  if (wantsHero) {
    for (let t = 1; t >= 0.62 && !found; t -= 0.04) {
      const bl = planBlocks(c, data, F, D, P, imgs, t, 0, 112);
      const free = avail - sum(bl, gapBase * t) - gapBase * t;
      const minHero = (F.h > F.w * 1.2 ? 240 : 170) * t;
      if (free >= minHero) {
        s = t;
        heroH = Math.min(free, F.h * 0.42);
        found = true;
      }
    }
  }
  if (!found) {
    for (let t = 1; t >= 0.45 && !found; t -= 0.05) {
      const bl = planBlocks(c, data, F, D, P, imgs, t, 0);
      if (sum(bl, gapBase * t) <= avail) {
        s = t;
        found = true;
      }
    }
    if (!found) s = 0.45;
  }

  const blocks = planBlocks(c, data, F, D, P, imgs, s, heroH, heroH > 0 ? 112 : 160);
  let g = gapBase * s;
  const total0 = sum(blocks, g);
  if (blocks.length > 1 && total0 < avail) g += Math.min((avail - total0) / (blocks.length - 1), 46 * s);
  const total = sum(blocks, g);
  let y = top + Math.max(0, (avail - total) / 2);
  const placed = blocks.map((b) => {
    const p = { ...b, y };
    y += b.h + g;
    return p;
  });
  const heads = placed.filter((b) => b.zone === 'head');
  const headBottom = heads.length ? heads[heads.length - 1].y + heads[heads.length - 1].h : top;

  D.paint(c, F, P, a, { headBottom, footerTop }, imgs);
  placed.forEach((b) => b.draw(b.y));
  drawFooter(c, F, D, P, fp, footerTop);
  c.restore();
}
