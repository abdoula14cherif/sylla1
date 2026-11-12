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

// suggest : couleur d'origine du style (le client peut la changer)
export const AFFICHE_DESIGNS = [
  { id: 'aff-bulles', nom: 'Dialogue', suggest: '#0B7A4B', neuf: true },
  { id: 'aff-argent', nom: 'Argent', suggest: '#0B7A4B', neuf: true },
  { id: 'aff-verre', nom: 'Verre', suggest: '#6B3FA0', neuf: true },
  { id: 'aff-cyber', nom: 'Cyber', suggest: '#BE185D', neuf: true },
  { id: 'aff-sunset', nom: 'Soleil', suggest: '#C2410C', neuf: true },
  { id: 'aff-memphis', nom: 'Pop', suggest: '#BE185D', neuf: true },
  { id: 'aff-corporate', nom: 'Pro', suggest: '#14213D', neuf: true },
  { id: 'aff-or', nom: 'Or noir', suggest: '#C99700', neuf: true },
  { id: 'aff-nature', nom: 'Nature', suggest: '#0B7A4B', neuf: true },
  { id: 'aff-diagonal', nom: 'Sport', suggest: '#0E7490', neuf: true },
  { id: 'aff-audace', nom: 'Audace', suggest: '#B42318' },
  { id: 'aff-net', nom: 'Net', suggest: '#0E7490' },
  { id: 'aff-nuit', nom: 'Nuit', suggest: '#6B3FA0' },
  { id: 'aff-vague', nom: 'Vague', suggest: '#14213D' },
  { id: 'aff-pagne', nom: 'Pagne', suggest: '#C2410C' },
  { id: 'aff-promo', nom: 'Soldes', suggest: '#B42318' },
  { id: 'aff-photo', nom: 'Photo', suggest: '#1F2933' },
  { id: 'aff-elegant', nom: 'Élégant', suggest: '#14213D' },
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
  { c: '#C99700', nom: 'Or' },
  { c: '#2563EB', nom: 'Bleu' },
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
  bouton: '',
  lien: '',
  sticker: '',
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
    data: { accroche: 'Promotion', titre: 'Jusqu’à *-50%* sur toute la boutique', bouton: 'Commander maintenant', sticker: '-50%', sousTitre: 'Une semaine pour faire de bonnes affaires', points: 'Livraison gratuite à domicile\nPaiement MoMo et Orange Money\nSatisfait ou remboursé', prixLabel: '', prix: '', quand: 'Du 15 au 22 novembre', lieu: 'Marché Mokolo, Yaoundé' },
  },
  {
    id: 'ouverture',
    nom: 'Ouverture',
    design: 'aff-audace',
    accent: '#0B7A4B',
    data: { accroche: 'Grande ouverture', titre: 'Venez découvrir notre *nouvelle boutique*', bouton: 'Venez nous voir', sticker: 'Cadeaux offerts', sousTitre: 'Cadeaux et réductions pour les 50 premiers clients', points: 'Réductions de lancement\nCadeaux surprise\nDégustation offerte', prixLabel: '', prix: '', quand: 'Samedi 21 novembre à 10h', lieu: 'Akwa, Douala' },
  },
  {
    id: 'evenement',
    nom: 'Soirée',
    design: 'aff-nuit',
    accent: '#6B3FA0',
    data: { accroche: 'Événement', titre: 'Grande soirée *Afro Vibes*', bouton: 'Réserver ma table', sousTitre: 'DJ, danse et cocktails toute la nuit', points: 'Tables VIP disponibles\nDress code : tenue wax\nParking sécurisé', prixLabel: 'Entrée', prix: '3 000 FCFA', quand: 'Samedi 28 novembre à 21h', lieu: 'Hôtel Sawa, Douala' },
  },
  {
    id: 'service',
    nom: 'Service',
    design: 'aff-net',
    accent: '#0E7490',
    data: { accroche: 'Nos services', titre: '*Plomberie* et électricité à domicile', bouton: 'Demander un devis', sticker: 'Devis gratuit', sousTitre: 'Intervention rapide, travail garanti', points: 'Devis gratuit\nDisponible 7j/7\nTechniciens qualifiés', prixLabel: 'À partir de', prix: '5 000 FCFA', quand: '', lieu: 'Douala et environs' },
  },
  {
    id: 'formation',
    nom: 'Formation',
    design: 'aff-vague',
    accent: '#14213D',
    data: { accroche: 'Formation', titre: 'Apprenez le *marketing digital* en 4 semaines', bouton: 'Je m’inscris', sticker: 'Certificat', sousTitre: 'Cours pratiques, certificat à la fin', points: 'Cours en ligne et en présentiel\nGroupes de 15 personnes\nCertificat remis', prixLabel: 'Tarif', prix: '45 000 FCFA', quand: 'Début le 1er décembre', lieu: 'Bastos, Yaoundé' },
  },
  {
    id: 'restaurant',
    nom: 'Restaurant',
    design: 'aff-pagne',
    accent: '#C2410C',
    data: { accroche: 'Menu du jour', titre: '*Poulet DG* et plantains mûrs', bouton: 'Commander', sticker: 'Livraison 30 min', sousTitre: 'Cuisiné chaque jour avec des produits frais', points: 'Boisson incluse\nLivraison en 30 minutes\nPlats à emporter', prixLabel: '', prix: '2 500 FCFA', quand: 'Du lundi au samedi', lieu: 'Bonapriso, Douala' },
  },
  {
    id: 'immo',
    nom: 'Location',
    design: 'aff-elegant',
    accent: '#14213D',
    data: { accroche: 'À louer', titre: 'Appartement *2 chambres* à Bonamoussadi', bouton: 'Visiter maintenant', sousTitre: 'Quartier calme, proche de toutes les commodités', points: 'Salon spacieux et cuisine équipée\nEau et électricité 24h/24\nParking privé', prixLabel: 'Loyer', prix: '120 000 FCFA / mois', quand: 'Disponible dès le 1er décembre', lieu: 'Bonamoussadi, Douala' },
  },
  {
    id: 'emploi',
    nom: 'Recrutement',
    design: 'aff-photo',
    accent: '#1F2933',
    data: { accroche: 'Nous recrutons', titre: '*Commerciaux* terrain', bouton: 'Postuler maintenant', sticker: 'Débutants acceptés', sousTitre: 'Rejoignez une équipe qui grandit', points: 'Salaire fixe et commissions\nFormation assurée\nDébutants acceptés', prixLabel: '', prix: '', quand: 'Candidatures avant le 30 novembre', lieu: 'Douala' },
  },
  {
    id: 'gagner',
    nom: 'Gagner de l’argent',
    design: 'aff-bulles',
    accent: '#0B7A4B',
    data: { accroche: 'Opportunité', titre: 'Gagnez *10 000 FCFA* par jour depuis votre téléphone', sousTitre: 'Simple, rapide et accessible à tous', points: 'Inscription gratuite\nPaiement MoMo et Orange Money\nFormation offerte', prixLabel: '', prix: '', quand: '', lieu: '', bouton: 'Rejoindre maintenant', lien: 'www.monsite.com', sticker: 'Gratuit' },
  },
  {
    id: 'digital',
    nom: 'Digital',
    design: 'aff-cyber',
    accent: '#BE185D',
    data: { accroche: 'Agence digitale', titre: 'Votre *site web* et vos pubs en 7 jours', sousTitre: 'Création de sites, logos et réseaux sociaux', points: 'Site professionnel\nLogo et identité\nGestion des réseaux sociaux', prixLabel: 'À partir de', prix: '50 000 FCFA', quand: '', lieu: 'Douala et Yaoundé', bouton: 'Demander un devis', lien: '', sticker: '' },
  },
  {
    id: 'agri',
    nom: 'Agriculture',
    design: 'aff-nature',
    accent: '#0B7A4B',
    data: { accroche: 'Produits locaux', titre: 'Légumes *frais* livrés chez vous', sousTitre: 'Directement de nos champs à votre table', points: 'Cultivés sans produits chimiques\nLivraison le jour même\nPaiement à la livraison', prixLabel: 'Panier dès', prix: '5 000 FCFA', quand: '', lieu: 'Douala', bouton: 'Commander mon panier', lien: '', sticker: '100% bio' },
  },
  {
    id: 'beaute',
    nom: 'Beauté et luxe',
    design: 'aff-or',
    accent: '#C99700',
    data: { accroche: 'Salon de beauté', titre: 'Offrez-vous un moment *d’exception*', sousTitre: 'Coiffure, soins et maquillage par des professionnelles', points: 'Sur rendez-vous\nProduits de qualité\nAmbiance privée', prixLabel: '', prix: '', quand: 'Du mardi au dimanche', lieu: 'Bonapriso, Douala', bouton: 'Prendre rendez-vous', lien: '', sticker: '' },
  },
  {
    id: 'sport',
    nom: 'Sport',
    design: 'aff-diagonal',
    accent: '#0E7490',
    data: { accroche: 'Coaching sportif', titre: 'Transformez votre corps en *60 jours*', sousTitre: 'Programme personnalisé avec coach diplômé', points: 'Séances en salle ou à domicile\nSuivi nutrition\nRésultats garantis', prixLabel: 'Abonnement', prix: '25 000 FCFA / mois', quand: '', lieu: 'Yaoundé', bouton: 'Séance d’essai offerte', lien: '', sticker: '1ère séance gratuite' },
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
  const clean = (t) => t.replace(/\*/g, '').trim();
  if (d.accroche.trim()) L.push(caps(clean(d.accroche)));
  if (d.titre.trim()) L.push(clean(d.titre));
  if (d.sousTitre.trim()) L.push(clean(d.sousTitre));
  const pts = pointsOf(d);
  if (pts.length) L.push('', ...pts.map((p) => `✅ ${p}`));
  if (d.prix.trim()) L.push('', `💰 ${[d.prixLabel.trim(), d.prix.trim()].filter(Boolean).join(' ')}`);
  if (d.quand.trim()) L.push(`📅 ${d.quand.trim()}`);
  if (d.lieu.trim()) L.push(`📍 ${d.lieu.trim()}`);
  if (d.lien.trim()) L.push(`🔗 ${d.lien.trim()}`);
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
   Primitives « finition premium » : dégradés, reflets,
   pièces, bulles, verre, étincelles…
   ===================================================== */
const GOLD = '#f2a900';
const YELLOW = '#FFC21A';
// Choisit entre encre foncée et blanc selon le meilleur contraste (norme WCAG)
const readable = (bg) => {
  const L = lum(bg);
  const contrast = (l2) => (Math.max(L, l2) + 0.05) / (Math.min(L, l2) + 0.05);
  return contrast(lum(INK)) > contrast(1) ? INK : '#ffffff';
};
const accent2Of = (a) => (lum(a) > 0.42 ? INK : GOLD);
const fixA = (a) => (/^#[0-9a-f]{6}$/i.test(a) ? a : '#B42318');
const rgba = (col, al) => {
  const [R, G, B] = hexRgb(col);
  return `rgba(${R},${G},${B},${al})`;
};

function gradient(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
function radial(c, x, y, r, col, al, w, h) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, al));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
}
function cover(c, img, x, y, w, h) {
  const k = Math.max(w / img.width, h / img.height);
  const iw = img.width * k;
  const ih = img.height * k;
  c.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

/* Bouton 3D brillant (dégradé + reflet + liseré) */
function gloss(c, x, y, w, h, r, col, o = {}) {
  c.save();
  if (o.brutal) {
    rpath(c, x + 7, y + 7, w, h, r);
    c.fillStyle = INK;
    c.fill();
    rpath(c, x, y, w, h, r);
    c.fillStyle = col;
    c.fill();
    c.lineWidth = 4;
    c.strokeStyle = INK;
    c.stroke();
    c.restore();
    return;
  }
  c.shadowColor = rgba('#000000', 0.34);
  c.shadowBlur = 22;
  c.shadowOffsetY = 9;
  rpath(c, x, y, w, h, r);
  c.fillStyle = gradient(c, 0, y, 0, y + h, [[0, mix(col, '#ffffff', 0.4)], [0.5, col], [1, mix(col, '#000000', 0.26)]]);
  c.fill();
  c.restore();
  c.save();
  rpath(c, x, y, w, h, r);
  c.clip();
  rpath(c, x + h * 0.07, y + h * 0.06, w - h * 0.14, h * 0.44, r * 0.75);
  c.fillStyle = gradient(c, 0, y, 0, y + h * 0.5, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0.05)']]);
  c.fill();
  c.restore();
  c.save();
  rpath(c, x + 1.5, y + 1.5, w - 3, h - 3, r);
  c.strokeStyle = 'rgba(255,255,255,0.4)';
  c.lineWidth = 3;
  c.stroke();
  c.restore();
}

/* Carte de contenu : verre dépoli, blanc, brut, doré… */
function panel(c, x, y, w, h, r, kind, P) {
  c.save();
  if (kind === 'glass') {
    rpath(c, x, y, w, h, r);
    c.fillStyle = gradient(c, x, y, x, y + h, [[0, 'rgba(255,255,255,0.24)'], [1, 'rgba(255,255,255,0.09)']]);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.45)';
    c.lineWidth = 2;
    c.stroke();
  } else if (kind === 'brutal') {
    rpath(c, x + 6, y + 6, w, h, r);
    c.fillStyle = INK;
    c.fill();
    rpath(c, x, y, w, h, r);
    c.fillStyle = '#fff';
    c.fill();
    c.lineWidth = 4;
    c.strokeStyle = INK;
    c.stroke();
  } else if (kind === 'gold') {
    rpath(c, x, y, w, h, r);
    c.fillStyle = 'rgba(255,255,255,0.05)';
    c.fill();
    c.strokeStyle = rgba(P.accent, 0.7);
    c.lineWidth = 2;
    c.stroke();
  } else {
    c.shadowColor = 'rgba(15,23,42,0.16)';
    c.shadowBlur = 16;
    c.shadowOffsetY = 5;
    rpath(c, x, y, w, h, r);
    c.fillStyle = '#fff';
    c.fill();
    c.shadowColor = 'transparent';
    rpath(c, x, y, w, h, r);
    c.strokeStyle = 'rgba(15,23,42,0.07)';
    c.lineWidth = 2;
    c.stroke();
    c.save();
    rpath(c, x, y, w, h, r);
    c.clip();
    rect(c, x, y, 9, h, P.accent);
    c.restore();
  }
  c.restore();
}

function spark(c, x, y, r, col, al = 1) {
  c.save();
  c.globalAlpha = al;
  c.fillStyle = col;
  c.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const ang = (i * Math.PI) / 4 - Math.PI / 2;
    const rr = i % 2 ? r * 0.26 : r;
    c.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
  }
  c.closePath();
  c.fill();
  c.restore();
}

function orb(c, x, y, r, col, al = 1) {
  c.save();
  c.globalAlpha = al;
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, mix(col, '#ffffff', 0.85));
  g.addColorStop(0.35, mix(col, '#ffffff', 0.25));
  g.addColorStop(1, mix(col, '#000000', 0.35));
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function coin(c, x, y, r, col = YELLOW, sym = 'F') {
  const dark = mix(col, '#6b3f00', 0.5);
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.35)';
  c.shadowBlur = r * 0.5;
  c.shadowOffsetY = r * 0.2;
  circle(c, x, y, r, dark);
  c.restore();
  circle(c, x, y - r * 0.05, r * 0.94, gradient(c, x - r, y - r, x + r, y + r, [[0, mix(col, '#ffffff', 0.7)], [0.45, col], [1, mix(col, '#6b3f00', 0.35)]]));
  c.save();
  c.strokeStyle = mix(col, '#6b3f00', 0.35);
  c.lineWidth = r * 0.07;
  c.beginPath();
  c.arc(x, y - r * 0.05, r * 0.72, 0, Math.PI * 2);
  c.stroke();
  c.restore();
  txt(c, sym, x, y + r * 0.28, { size: r * 0.95, weight: '800', color: mix(col, '#6b3f00', 0.5), align: 'center' });
}

function coinStack(c, cx, by, rx, n, col = YELLOW) {
  const ry = rx * 0.34;
  const th = rx * 0.24;
  const dark = mix(col, '#6b3f00', 0.45);
  for (let i = 0; i < n; i += 1) {
    const y = by - i * th;
    c.save();
    if (i === 0) {
      c.shadowColor = 'rgba(0,0,0,0.35)';
      c.shadowBlur = rx * 0.35;
      c.shadowOffsetY = rx * 0.12;
    }
    c.beginPath();
    c.moveTo(cx - rx, y - th);
    c.lineTo(cx - rx, y);
    c.ellipse(cx, y, rx, ry, 0, Math.PI, 0, true);
    c.lineTo(cx + rx, y - th);
    c.closePath();
    c.fillStyle = gradient(c, cx - rx, 0, cx + rx, 0, [[0, dark], [0.35, mix(col, '#6b3f00', 0.1)], [1, dark]]);
    c.fill();
    c.restore();
    c.beginPath();
    c.ellipse(cx, y - th, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = gradient(c, cx - rx, y - th - ry, cx + rx, y - th + ry, [[0, mix(col, '#ffffff', 0.65)], [0.5, col], [1, mix(col, '#6b3f00', 0.2)]]);
    c.fill();
    c.strokeStyle = rgba(dark, 0.6);
    c.lineWidth = rx * 0.04;
    c.stroke();
  }
  const ty = by - n * th + th;
  c.save();
  c.strokeStyle = rgba(dark, 0.55);
  c.lineWidth = rx * 0.05;
  c.beginPath();
  c.ellipse(cx, ty - th, rx * 0.66, ry * 0.66, 0, 0, Math.PI * 2);
  c.stroke();
  c.restore();
}

function leaf(c, x, y, len, ang, col) {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(len * 0.3, -len * 0.34, len * 0.75, -len * 0.24, len, 0);
  c.bezierCurveTo(len * 0.75, len * 0.24, len * 0.3, len * 0.34, 0, 0);
  c.fillStyle = gradient(c, 0, -len * 0.3, len, len * 0.3, [[0, mix(col, '#ffffff', 0.25)], [1, mix(col, '#000000', 0.25)]]);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.4)';
  c.lineWidth = Math.max(1.5, len * 0.014);
  c.beginPath();
  c.moveTo(len * 0.04, 0);
  c.lineTo(len * 0.92, 0);
  c.stroke();
  c.restore();
}

/* Pastille « étoile » (autocollant) */
function sticker(c, cx, cy, R, text, P, rot = -0.14) {
  const lines = (() => {
    const w = text.trim().split(/\s+/);
    return w.length > 1 && text.length > 7 ? [w.slice(0, Math.ceil(w.length / 2)).join(' '), w.slice(Math.ceil(w.length / 2)).join(' ')] : [text.trim()];
  })();
  c.save();
  c.translate(cx, cy);
  c.rotate(rot);
  const pts = [];
  const n = 18;
  for (let i = 0; i < n * 2; i += 1) {
    const ang = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? R * 0.88 : R;
    pts.push([Math.cos(ang) * rr, Math.sin(ang) * rr]);
  }
  c.shadowColor = 'rgba(0,0,0,0.35)';
  c.shadowBlur = 20;
  c.shadowOffsetY = 8;
  poly(c, pts, gradient(c, 0, -R, 0, R, [[0, mix(P.stickBg, '#ffffff', 0.35)], [1, mix(P.stickBg, '#000000', 0.2)]]));
  c.shadowColor = 'transparent';
  c.strokeStyle = '#fff';
  c.lineWidth = 5;
  c.beginPath();
  c.arc(0, 0, R * 0.74, 0, Math.PI * 2);
  c.stroke();
  const size = lines.length > 1 ? R * 0.36 : R * 0.5;
  lines.forEach((l, i) => txt(c, l, 0, (i - (lines.length - 1) / 2) * size * 1.05 + size * 0.34, { size, weight: '800', color: P.stickFg, align: 'center', maxW: R * 1.2 }));
  c.restore();
}

/* =====================================================
   Illustrations dessinées (utilisées sans photo)
   ===================================================== */
const ART = {
  pieces(c, x, y, w, h) {
    const by = y + h * 0.95;
    const rx = Math.min(w * 0.14, h * 0.3);
    coinStack(c, x + w * 0.2, by, rx, 3);
    coinStack(c, x + w * 0.5, by, rx * 1.15, 6);
    coinStack(c, x + w * 0.8, by, rx, 4);
    coin(c, x + w * 0.34, y + h * 0.28, rx * 0.62);
    coin(c, x + w * 0.67, y + h * 0.16, rx * 0.5);
    coin(c, x + w * 0.9, y + h * 0.42, rx * 0.4);
    spark(c, x + w * 0.12, y + h * 0.3, rx * 0.5, '#fff', 0.9);
    spark(c, x + w * 0.58, y + h * 0.03, rx * 0.35, '#fff', 0.8);
  },
  bulles(c, x, y, w, h, P) {
    const R = Math.min(h * 0.26, w * 0.17);
    const items = [['heart', 0.2, 0.34, 1], ['eye', 0.52, 0.2, 0.82], ['star', 0.8, 0.4, 1], ['share', 0.36, 0.72, 0.72], ['heart', 0.72, 0.78, 0.6]];
    items.forEach(([ic, fx, fy, k], i) => {
      const cx = x + w * fx;
      const cy = y + h * fy;
      const r = R * k;
      c.save();
      c.shadowColor = 'rgba(0,0,0,0.3)';
      c.shadowBlur = 20;
      c.shadowOffsetY = 8;
      circle(c, cx, cy, r, gradient(c, cx, cy - r, cx, cy + r, [[0, '#ffffff'], [1, mix(P.bubbleCol, '#ffffff', 0.55)]]));
      c.restore();
      poly(c, [[cx - r * 0.5, cy + r * 0.78], [cx - r * 0.95, cy + r * 1.35], [cx - r * 0.1, cy + r * 0.96]], '#e8eef9');
      icon(c, ic, cx - r * 0.45, cy - r * 0.45, r * 0.9, i % 2 ? P.bubbleCol : '#e11d48');
    });
    coin(c, x + w * 0.52, y + h * 0.62, R * 0.62);
    spark(c, x + w * 0.1, y + h * 0.1, R * 0.4, '#fff', 0.9);
    spark(c, x + w * 0.9, y + h * 0.85, R * 0.3, '#fff', 0.8);
  },
  verre(c, x, y, w, h, P) {
    const R = Math.min(h * 0.42, w * 0.22);
    orb(c, x + w * 0.3, y + h * 0.55, R, P.orbA, 0.95);
    orb(c, x + w * 0.62, y + h * 0.4, R * 0.78, P.orbB, 0.92);
    orb(c, x + w * 0.82, y + h * 0.72, R * 0.46, '#ffffff', 0.7);
    orb(c, x + w * 0.12, y + h * 0.2, R * 0.28, P.orbB, 0.8);
    c.save();
    c.strokeStyle = 'rgba(255,255,255,0.5)';
    c.lineWidth = 3;
    c.beginPath();
    c.ellipse(x + w * 0.5, y + h * 0.58, R * 1.55, R * 0.42, -0.25, 0, Math.PI * 2);
    c.stroke();
    c.restore();
    spark(c, x + w * 0.5, y + h * 0.08, R * 0.3, '#fff', 0.95);
  },
  cyber(c, x, y, w, h, P) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const R = Math.min(h * 0.46, w * 0.3);
    [1, 0.74, 0.5].forEach((k, i) => {
      c.save();
      c.strokeStyle = i === 1 ? P.neon2 : P.neon;
      c.shadowColor = i === 1 ? P.neon2 : P.neon;
      c.shadowBlur = 22;
      c.lineWidth = 5 - i;
      c.beginPath();
      for (let j = 0; j < 6; j += 1) {
        const ang = (j / 6) * Math.PI * 2 + Math.PI / 6 + i * 0.2;
        c.lineTo(cx + Math.cos(ang) * R * k, cy + Math.sin(ang) * R * k);
      }
      c.closePath();
      c.stroke();
      c.restore();
    });
    c.save();
    c.shadowColor = P.neon;
    c.shadowBlur = 30;
    poly(c, [[cx + R * 0.1, cy - R * 0.38], [cx - R * 0.2, cy + R * 0.06], [cx - R * 0.01, cy + R * 0.06], [cx - R * 0.1, cy + R * 0.38], [cx + R * 0.2, cy - R * 0.06], [cx + R * 0.01, cy - R * 0.06]], '#fff');
    c.restore();
    [[0.1, 0.2], [0.9, 0.3], [0.85, 0.85], [0.15, 0.8]].forEach(([fx, fy], i) => spark(c, x + w * fx, y + h * fy, 16, i % 2 ? P.neon2 : P.neon, 0.9));
  },
  soleil(c, x, y, w, h, P) {
    const cx = x + w / 2;
    const R = Math.min(h * 0.5, w * 0.3);
    const cy = y + h * 0.48;
    c.save();
    c.shadowColor = rgba('#ffd166', 0.8);
    c.shadowBlur = 60;
    circle(c, cx, cy, R, gradient(c, 0, cy - R, 0, cy + R, [[0, '#fff3b0'], [0.5, '#ffc24a'], [1, '#ff7a45']]));
    c.restore();
    c.save();
    c.beginPath();
    c.arc(cx, cy, R * 1.01, 0, Math.PI * 2);
    c.clip();
    for (let i = 0; i < 5; i += 1) {
      const yy = cy + R * (0.18 + i * 0.17);
      rect(c, cx - R, yy, R * 2, R * (0.025 + i * 0.022), P.sunCut);
    }
    c.restore();
    c.save();
    c.strokeStyle = 'rgba(255,255,255,0.8)';
    c.lineWidth = 6;
    c.lineCap = 'round';
    [0.18, 0.1].forEach((k, i) => {
      c.beginPath();
      const yy = y + h * (0.88 + i * 0.07);
      for (let t = 0; t <= 1.001; t += 0.05) c.lineTo(x + w * (0.08 + t * 0.84), yy + Math.sin(t * Math.PI * 6) * h * k * 0.18);
      c.stroke();
    });
    c.restore();
  },
  pop(c, x, y, w, h, P) {
    const R = Math.min(h * 0.32, w * 0.2);
    const o = (fn) => {
      c.save();
      c.lineWidth = 5;
      c.strokeStyle = INK;
      fn();
      c.restore();
    };
    c.fillStyle = P.accent;
    o(() => {
      c.beginPath();
      c.arc(x + w * 0.3, y + h * 0.5, R, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    });
    c.fillStyle = YELLOW;
    o(() => {
      c.beginPath();
      c.moveTo(x + w * 0.62, y + h * 0.12);
      c.lineTo(x + w * 0.62 + R * 1.2, y + h * 0.62);
      c.lineTo(x + w * 0.62 - R * 0.9, y + h * 0.62);
      c.closePath();
      c.fill();
      c.stroke();
    });
    c.fillStyle = '#4cc9f0';
    o(() => {
      c.fillRect(x + w * 0.6, y + h * 0.66, R * 1.5, R * 0.9);
      c.strokeRect(x + w * 0.6, y + h * 0.66, R * 1.5, R * 0.9);
    });
    o(() => {
      c.beginPath();
      for (let t = 0; t <= 1.001; t += 0.04) c.lineTo(x + w * (0.06 + t * 0.34), y + h * 0.88 + Math.sin(t * Math.PI * 5) * 16);
      c.stroke();
    });
    spark(c, x + w * 0.5, y + h * 0.28, R * 0.5, INK, 1);
    spark(c, x + w * 0.92, y + h * 0.3, R * 0.4, P.accent, 1);
  },
  barres(c, x, y, w, h, P) {
    const n = 5;
    const bw = (w * 0.74) / n;
    const x0 = x + w * 0.13;
    const base = y + h * 0.94;
    const pts = [];
    for (let i = 0; i < n; i += 1) {
      const bh = h * (0.22 + i * 0.13);
      const bx = x0 + i * bw + bw * 0.1;
      rpath(c, bx, base - bh, bw * 0.8, bh, bw * 0.16);
      c.fillStyle = gradient(c, 0, base - bh, 0, base, [[0, mix(P.accent, '#ffffff', 0.35)], [1, mix(P.accent, '#000000', 0.2)]]);
      c.fill();
      pts.push([bx + bw * 0.4, base - bh - h * 0.05]);
    }
    c.save();
    c.strokeStyle = YELLOW;
    c.lineWidth = 9;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.shadowColor = 'rgba(0,0,0,0.3)';
    c.shadowBlur = 12;
    c.beginPath();
    pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
    c.stroke();
    const [lx, ly] = pts[n - 1];
    const [px, py] = pts[n - 2];
    const ang = Math.atan2(ly - py, lx - px);
    c.beginPath();
    c.moveTo(lx + Math.cos(ang) * 22, ly + Math.sin(ang) * 22);
    c.lineTo(lx + Math.cos(ang + 2.5) * 34, ly + Math.sin(ang + 2.5) * 34);
    c.lineTo(lx + Math.cos(ang - 2.5) * 34, ly + Math.sin(ang - 2.5) * 34);
    c.closePath();
    c.fillStyle = YELLOW;
    c.fill();
    c.restore();
    pts.slice(0, -1).forEach(([px2, py2]) => circle(c, px2, py2, 9, '#fff'));
  },
  diamant(c, x, y, w, h, P) {
    const cx = x + w / 2;
    const R = Math.min(h * 0.46, w * 0.28);
    const top = y + h * 0.14;
    const mid = y + h * 0.4;
    const bot = y + h * 0.92;
    const f = (pts, a, b) => poly(c, pts, gradient(c, 0, top, 0, bot, [[0, mix(P.g1, '#ffffff', a)], [1, mix(P.g3, '#000000', b)]]));
    c.save();
    c.shadowColor = rgba(P.g2, 0.6);
    c.shadowBlur = 50;
    f([[cx - R * 0.55, top], [cx + R * 0.55, top], [cx + R, mid], [cx - R, mid]], 0.2, 0);
    c.restore();
    f([[cx - R, mid], [cx, bot], [cx - R * 0.35, mid]], 0, 0.1);
    f([[cx - R * 0.35, mid], [cx, bot], [cx + R * 0.35, mid]], 0.3, 0);
    f([[cx + R * 0.35, mid], [cx, bot], [cx + R, mid]], 0, 0.25);
    f([[cx - R * 0.55, top], [cx - R * 0.2, mid], [cx - R, mid]], 0.4, 0);
    f([[cx + R * 0.55, top], [cx + R, mid], [cx + R * 0.2, mid]], 0, 0.15);
    spark(c, cx - R * 0.9, top + R * 0.1, R * 0.28, '#fff', 0.95);
    spark(c, cx + R * 1.05, mid + R * 0.4, R * 0.2, '#fff', 0.85);
  },
  feuilles(c, x, y, w, h, P) {
    const cx = x + w / 2;
    const by = y + h * 0.95;
    const L = Math.min(h * 0.85, w * 0.42);
    [[-1.25, 0.7], [-0.85, 0.9], [-0.4, 1], [0.4, 1], [0.85, 0.9], [1.25, 0.7]].forEach(([ang, k], i) => leaf(c, cx, by, L * k, ang - Math.PI / 2, i % 2 ? P.leaf2 : P.leaf1));
    leaf(c, cx, by, L * 1.1, -Math.PI / 2, P.leaf1);
    circle(c, cx + w * 0.3, y + h * 0.18, h * 0.12, gradient(c, 0, y, 0, y + h * 0.3, [[0, '#fff3b0'], [1, '#ffc24a']]));
    spark(c, cx - w * 0.3, y + h * 0.2, 20, '#fff', 0.9);
  },
  vitesse(c, x, y, w, h, P) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    c.save();
    for (let i = 0; i < 6; i += 1) {
      const yy = y + h * (0.1 + i * 0.15);
      const len = w * (0.35 + ((i * 37) % 30) / 100);
      c.globalAlpha = 0.5;
      poly(c, [[x + w * 0.04, yy], [x + w * 0.04 + len, yy], [x + w * 0.04 + len - 26, yy + 22], [x + w * 0.04 - 26, yy + 22]], '#fff');
    }
    c.restore();
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.4)';
    c.shadowBlur = 26;
    c.shadowOffsetY = 10;
    const R = Math.min(h * 0.42, w * 0.2);
    poly(c, [[cx + R * 0.35, cy - R], [cx - R * 0.55, cy + R * 0.12], [cx - R * 0.02, cy + R * 0.12], [cx - R * 0.35, cy + R], [cx + R * 0.6, cy - R * 0.2], [cx + R * 0.04, cy - R * 0.2]], gradient(c, 0, cy - R, 0, cy + R, [[0, '#fff3b0'], [1, YELLOW]]));
    c.restore();
  },
};

/* =====================================================
   Les 18 modèles : palette + décor de fond
   ===================================================== */
const DESIGNS = {
  /* ---------- Nouveaux styles ---------- */

  /* Titre dans une bulle de dialogue, fond bleu nuit */
  'aff-bulles': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag', gloss: true, bubble: true, pts: 'glass', chips: true, logoPlate: true, art: 'bulles', heroShape: 'round',
    pal: (a) => ({ headFg: '#fff', titleFg: INK, bodyFg: '#fff', accent: YELLOW, check: INK, pillBg: YELLOW, pillFg: INK, priceBg: YELLOW, priceFg: INK, hlBg: a, hlFg: readable(a), footerBg: 'rgba(0,0,0,0.3)', footerFg: '#fff', heroRing: '#fff', bubbleCol: a, chipBg: 'rgba(255,255,255,0.14)' }),
    paint(c, F, P, a) {
      c.fillStyle = gradient(c, 0, 0, F.w * 0.4, F.h, [[0, mix(a, '#071533', 0.8)], [1, mix(a, '#071533', 0.5)]]);
      c.fillRect(0, 0, F.w, F.h);
      radial(c, F.w * 0.9, F.h * 0.85, F.w * 0.9, a, 0.55, F.w, F.h);
      radial(c, F.w * 0.05, F.h * 0.1, F.w * 0.6, '#22d3ee', 0.14, F.w, F.h);
      spark(c, F.w * 0.9, F.h * 0.12, 30, '#fff', 0.7);
      spark(c, F.w * 0.04, F.h * 0.4, 22, YELLOW, 0.8);
      spark(c, F.w * 0.94, F.h * 0.55, 18, '#fff', 0.6);
    },
  },

  /* Vert profond, pièces d'or et reflets */
  'aff-argent': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'shadow', pts: 'glass', chips: true, logoPlate: true, art: 'pieces', heroShape: 'round',
    pal: (a) => ({ headFg: '#fff', titleFg: '#fff', bodyFg: '#fff', accent: YELLOW, check: INK, pillBg: YELLOW, pillFg: INK, priceBg: YELLOW, priceFg: INK, hlBg: YELLOW, hlFg: INK, footerBg: 'rgba(0,0,0,0.35)', footerFg: '#fff', heroRing: YELLOW, chipBg: 'rgba(255,255,255,0.12)' }),
    paint(c, F, P, a) {
      c.fillStyle = gradient(c, 0, 0, 0, F.h, [[0, mix(a, '#02140a', 0.7)], [1, mix(a, '#010806', 0.4)]]);
      c.fillRect(0, 0, F.w, F.h);
      radial(c, F.w * 0.5, F.h * 0.4, F.w * 0.95, a, 0.6, F.w, F.h);
      radial(c, F.w * 0.9, F.h * 0.05, F.w * 0.5, YELLOW, 0.18, F.w, F.h);
      coin(c, F.w * 0.92, F.h * 0.14, 46, YELLOW);
      coin(c, F.w * 0.95, F.h * 0.34, 30, YELLOW);
      spark(c, F.w * 0.82, F.h * 0.07, 24, '#fff', 0.8);
      spark(c, F.w * 0.14, F.h * 0.3, 18, YELLOW, 0.8);
    },
  },

  /* Dégradé violet-turquoise, sphères et cartes en verre */
  'aff-verre': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'shadow', pts: 'glass', chips: true, logoPlate: true, art: 'verre', heroShape: 'circle',
    pal: (a) => {
      const dk = mix(a, '#000000', 0.4);
      return { headFg: '#fff', titleFg: '#fff', bodyFg: '#fff', accent: '#fff', check: dk, pillBg: 'rgba(255,255,255,0.22)', pillFg: '#fff', priceBg: '#fff', priceFg: dk, hlBg: '#fff', hlFg: dk, footerBg: 'rgba(255,255,255,0.14)', footerFg: '#fff', heroRing: 'rgba(255,255,255,0.8)', orbA: mix(a, '#ec4899', 0.5), orbB: mix(a, '#22d3ee', 0.65), chipBg: 'rgba(255,255,255,0.16)' };
    },
    paint(c, F, P, a) {
      c.fillStyle = gradient(c, 0, 0, F.w, F.h, [[0, mix(a, '#312e81', 0.35)], [0.55, mix(a, '#7c3aed', 0.3)], [1, mix(a, '#0891b2', 0.6)]]);
      c.fillRect(0, 0, F.w, F.h);
      orb(c, F.w * 0.92, F.h * 0.1, 150, P.orbA, 0.85);
      orb(c, -20, F.h * 0.55, 110, P.orbB, 0.6);
      orb(c, F.w * 0.86, F.h * 0.88, 90, '#ffffff', 0.35);
      spark(c, F.w * 0.62, F.h * 0.06, 24, '#fff', 0.8);
    },
  },

  /* Néon sur noir, grille et halos */
  'aff-cyber': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'glow', pts: 'glass', chips: true, logoPlate: true, art: 'cyber', heroShape: 'round',
    pal: (a) => {
      const t = lift(a);
      return { headFg: '#fff', titleFg: '#fff', bodyFg: '#e8e9ff', accent: t, check: readable(t), pillBg: t, pillFg: readable(t), priceBg: t, priceFg: readable(t), hlBg: t, hlFg: readable(t), footerBg: 'rgba(255,255,255,0.06)', footerFg: '#fff', footerLine: t, heroRing: t, neon: t, neon2: '#22d3ee', glow: t, chipBg: rgba(t, 0.18) };
    },
    paint(c, F, P) {
      rect(c, 0, 0, F.w, F.h, '#05060f');
      radial(c, F.w * 0.85, F.h * 0.1, F.w * 0.9, P.neon, 0.4, F.w, F.h);
      radial(c, F.w * 0.1, F.h * 0.85, F.w * 0.8, P.neon2, 0.22, F.w, F.h);
      c.save();
      c.strokeStyle = rgba(P.neon, 0.16);
      c.lineWidth = 2;
      for (let x = 0; x <= F.w; x += 62) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, F.h);
        c.stroke();
      }
      for (let y = 0; y <= F.h; y += 62) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(F.w, y);
        c.stroke();
      }
      c.strokeStyle = P.neon;
      c.shadowColor = P.neon;
      c.shadowBlur = 18;
      c.lineWidth = 4;
      [[30, 30, 1, 1], [F.w - 30, 30, -1, 1], [30, F.h - 30, 1, -1], [F.w - 30, F.h - 30, -1, -1]].forEach(([x, y, sx, sy]) => {
        c.beginPath();
        c.moveTo(x, y + sy * 90);
        c.lineTo(x, y);
        c.lineTo(x + sx * 90, y);
        c.stroke();
      });
      c.restore();
    },
  },

  /* Coucher de soleil dégradé, soleil rayé */
  'aff-sunset': {
    align: 'center', upper: true, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'shadow', pts: 'glass', chips: true, logoPlate: true, art: 'soleil', heroShape: 'circle',
    pal: (a) => {
      const bg = mix(a, '#3b0a45', 0.25);
      const fg = readable(bg);
      return { headFg: fg, titleFg: fg, bodyFg: fg, accent: '#FFE08A', check: INK, pillBg: '#FFE08A', pillFg: INK, priceBg: '#FFE08A', priceFg: INK, hlBg: '#FFE08A', hlFg: INK, footerBg: 'rgba(40,5,40,0.45)', footerFg: '#fff', heroRing: '#FFE08A', sunCut: mix(a, '#3b0a45', 0.45), chipBg: 'rgba(255,255,255,0.14)' };
    },
    paint(c, F, P, a) {
      c.fillStyle = gradient(c, 0, 0, 0, F.h, [[0, mix(a, '#ffb347', 0.35)], [0.45, a], [1, mix(a, '#3b0a45', 0.7)]]);
      c.fillRect(0, 0, F.w, F.h);
      radial(c, F.w * 0.5, F.h * 0.1, F.w * 0.9, '#ffe08a', 0.3, F.w, F.h);
      c.save();
      c.globalAlpha = 0.14;
      for (let i = 0; i < 7; i += 1) rect(c, 0, F.h * 0.56 + i * 44, F.w, 10 + i * 3, '#fff');
      c.restore();
      spark(c, F.w * 0.12, F.h * 0.12, 22, '#fff', 0.8);
      spark(c, F.w * 0.93, F.h * 0.045, 28, '#fff', 0.7);
    },
  },

  /* Pop : crème, formes colorées, contours noirs */
  'aff-memphis': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', brutal: true, fx: 'extrude', pts: 'brutal', logoPlate: true, art: 'pop', heroShape: 'round',
    pal: (a) => ({ headFg: INK, titleFg: INK, bodyFg: INK, accent: a, check: readable(a), pillBg: YELLOW, pillFg: INK, priceBg: a, priceFg: readable(a), hlBg: YELLOW, hlFg: INK, extrude: a, footerBg: YELLOW, footerFg: INK, footerLine: INK, heroRing: INK }),
    paint(c, F, P, a) {
      rect(c, 0, 0, F.w, F.h, '#fff4dc');
      c.save();
      c.fillStyle = rgba(INK, 0.16);
      for (let y = 0; y < 6; y += 1) for (let x = 0; x < 6; x += 1) circle(c, F.w - 230 + x * 28, F.h * 0.38 + y * 28, 4, rgba(INK, 0.22));
      c.lineWidth = 5;
      c.strokeStyle = INK;
      c.fillStyle = a;
      c.beginPath();
      c.arc(F.w - 20, 60, 120, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      for (let t = 0; t <= 1.001; t += 0.03) c.lineTo(F.w * (0.62 + t * 0.3), F.h * 0.965 + Math.sin(t * Math.PI * 6) * 12);
      c.stroke();
      c.restore();
    },
  },

  /* Pro : bandeau diagonal, graphique, sobre */
  'aff-corporate': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag', gloss: true, pts: 'card', headPad: 90, art: 'barres', heroShape: 'round', logoPlate: false,
    pal: (a) => {
      const a2 = accent2Of(a);
      return { headFg: readable(a), titleFg: readable(a), bodyFg: '#26314a', accent: a, check: readable(a), pillBg: a2, pillFg: readable(a2), priceBg: a, priceFg: readable(a), hlBg: a2, hlFg: readable(a2), footerBg: a, footerFg: readable(a) };
    },
    paint(c, F, P, a, info) {
      rect(c, 0, 0, F.w, F.h, '#f6f8fb');
      const hb = info.headBottom + 40;
      c.save();
      poly(c, [[0, 0], [F.w, 0], [F.w, hb - 10], [0, hb + 90]], accent2Of(a));
      poly(c, [[0, 0], [F.w, 0], [F.w, hb - 56], [0, hb + 40]], mix(a, '#000000', 0.08));
      c.globalAlpha = 0.08;
      circle(c, F.w - 60, 80, 260, '#fff');
      c.restore();
    },
  },

  /* Or noir : luxe, titre métallique */
  'aff-or': {
    align: 'center', upper: true, fam: SERIF, wt: '700', price: 'tag', gloss: true, fx: 'gold', pts: 'gold', chips: false, margin: 96, top: 120, art: 'diamant', heroShape: 'arch',
    pal: (a) => {
      const g1 = mix(a, '#ffffff', 0.62);
      const g3 = mix(a, '#000000', 0.5);
      return { headFg: g1, titleFg: g1, bodyFg: mix(a, '#ffffff', 0.78), accent: a, check: INK, pillBg: a, pillFg: INK, priceBg: a, priceFg: INK, hlBg: a, hlFg: INK, footerBg: null, footerFg: mix(a, '#ffffff', 0.7), footerLine: a, heroRing: a, g1, g2: a, g3 };
    },
    paint(c, F, P, a) {
      c.fillStyle = gradient(c, 0, 0, 0, F.h, [[0, '#0b0b0d'], [1, mix(a, '#000000', 0.82)]]);
      c.fillRect(0, 0, F.w, F.h);
      radial(c, F.w * 0.5, F.h * 0.3, F.w * 0.8, a, 0.2, F.w, F.h);
      c.save();
      c.strokeStyle = gradient(c, 0, 0, F.w, F.h, [[0, P.g1], [0.5, P.g2], [1, P.g3]]);
      c.lineWidth = 4;
      c.strokeRect(40, 40, F.w - 80, F.h - 80);
      c.lineWidth = 1.5;
      c.globalAlpha = 0.6;
      c.strokeRect(58, 58, F.w - 116, F.h - 116);
      c.restore();
      spark(c, 100, 110, 20, P.g1, 0.9);
      spark(c, F.w - 100, 110, 20, P.g1, 0.9);
    },
  },

  /* Nature : feuilles, fond clair, marqueur jaune */
  'aff-nature': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag', gloss: true, hl: 'under', pts: 'card', art: 'feuilles', heroShape: 'arch', logoPlate: false,
    pal: (a) => {
      const dk = mix(a, '#000000', 0.55);
      return { headFg: dk, titleFg: dk, bodyFg: mix(a, '#000000', 0.6), accent: a, check: readable(a), pillBg: a, pillFg: readable(a), priceBg: a, priceFg: readable(a), hlBg: '#FFD84D', hlFg: dk, footerBg: dk, footerFg: '#fff', heroRing: null, leaf1: a, leaf2: mix(a, '#a3e635', 0.35) };
    },
    paint(c, F, P, a) {
      c.fillStyle = gradient(c, 0, 0, 0, F.h, [[0, '#f6fbef'], [1, '#e0efd0']]);
      c.fillRect(0, 0, F.w, F.h);
      c.save();
      c.globalAlpha = 0.9;
      [[-0.2, 1.0], [0.1, 0.8], [0.45, 0.6], [0.75, 0.45]].forEach(([ang, k], i) => leaf(c, F.w + 30, -20, 330 * k, Math.PI * 0.5 + ang + 0.5, i % 2 ? mix(a, '#a3e635', 0.4) : a));
      [[-0.3, 0.9], [0.1, 0.7], [0.5, 0.5]].forEach(([ang, k], i) => leaf(c, -30, F.h * 0.9, 240 * k, -0.4 - ang, i % 2 ? a : mix(a, '#a3e635', 0.4)));
      c.restore();
    },
  },

  /* Sport : diagonales, italique, éclair */
  'aff-diagonal': {
    align: 'left', upper: true, italic: true, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'extrude', pts: 'glass', chips: true, logoPlate: true, art: 'vitesse', heroShape: 'round',
    pal: (a) => ({ headFg: '#fff', titleFg: '#fff', bodyFg: '#fff', accent: YELLOW, check: INK, pillBg: YELLOW, pillFg: INK, priceBg: YELLOW, priceFg: INK, hlBg: YELLOW, hlFg: INK, extrude: mix(a, '#000000', 0.6), footerBg: mix(a, '#000000', 0.55), footerFg: '#fff', heroRing: '#fff', chipBg: 'rgba(255,255,255,0.14)' }),
    paint(c, F, P, a) {
      rect(c, 0, 0, F.w, F.h, a);
      poly(c, [[0, F.h * 0.12], [F.w, F.h * 0.02], [F.w, F.h * 0.55], [0, F.h * 0.7]], mix(a, '#000000', 0.28));
      c.save();
      c.globalAlpha = 0.1;
      for (let i = 0; i < 6; i += 1) poly(c, [[F.w * (0.5 + i * 0.1), 0], [F.w * (0.55 + i * 0.1), 0], [F.w * (0.25 + i * 0.1), F.h], [F.w * (0.2 + i * 0.1), F.h]], '#fff');
      c.restore();
    },
  },

  /* ---------- Les 8 modèles d'origine, améliorés ---------- */

  /* Aplat de couleur, formes géantes, étiquette dorée */
  'aff-audace': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'shadow', pts: 'glass', chips: true, logoPlate: true,
    pal: (a) => {
      const fg = readable(a);
      const a2 = accent2Of(a);
      return { headFg: fg, bodyFg: fg, accent: a2, check: readable(a2), pillBg: a2, pillFg: readable(a2), priceBg: a2, priceFg: readable(a2), hlBg: a2, hlFg: readable(a2), footerBg: mix(a, '#000000', 0.42), footerFg: '#fff', heroRing: '#fff', chipBg: 'rgba(255,255,255,0.12)' };
    },
    paint(c, F, P, a) {
      c.fillStyle = gradient(c, 0, 0, F.w * 0.5, F.h, [[0, mix(a, '#ffffff', 0.1)], [1, mix(a, '#000000', 0.25)]]);
      c.fillRect(0, 0, F.w, F.h);
      c.save();
      c.globalAlpha = 0.1;
      circle(c, F.w + 50, -30, 430, '#fff');
      circle(c, -80, F.h * 0.6, 320, '#fff');
      c.globalAlpha = 0.07;
      poly(c, [[F.w * 0.55, F.h], [F.w, F.h * 0.55], [F.w, F.h]], '#fff');
      c.restore();
      spark(c, F.w * 0.9, F.h * 0.1, 28, '#fff', 0.7);
      spark(c, F.w * 0.06, F.h * 0.36, 18, '#fff', 0.5);
    },
  },

  /* Blanc, barre de couleur, très lisible */
  'aff-net': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag', gloss: true, pts: 'card', hl: 'under',
    pal: (a) => ({ headFg: INK, titleFg: INK, bodyFg: '#26314a', accent: a, check: readable(a), pillBg: a, pillFg: readable(a), priceBg: a, priceFg: readable(a), hlBg: rgba(a, 0.3), hlFg: INK, footerBg: a, footerFg: readable(a) }),
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
    align: 'center', upper: true, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'glow', pts: 'glass', chips: true, logoPlate: true,
    pal: (a) => {
      const t = lift(a);
      return { headFg: '#fff', titleFg: '#fff', bodyFg: '#e5ecff', accent: t, check: readable(t), pillBg: t, pillFg: readable(t), priceBg: t, priceFg: readable(t), hlBg: t, hlFg: readable(t), footerBg: 'rgba(255,255,255,0.08)', footerFg: '#fff', heroRing: t, footerLine: t, glow: t, chipBg: rgba(t, 0.16) };
    },
    paint(c, F, P, a) {
      const t = lift(a);
      c.fillStyle = gradient(c, 0, 0, 0, F.h, [[0, '#0b1020'], [1, '#141b3a']]);
      c.fillRect(0, 0, F.w, F.h);
      radial(c, F.w * 0.9, F.h * 0.08, F.w * 0.9, t, 0.5, F.w, F.h);
      radial(c, F.w * 0.05, F.h * 0.75, F.w * 0.8, '#22d3ee', 0.2, F.w, F.h);
      c.save();
      c.strokeStyle = t;
      c.globalAlpha = 0.5;
      c.lineWidth = 3;
      rpath(c, 28, 28, F.w - 56, F.h - 56, 34);
      c.stroke();
      c.restore();
      spark(c, F.w * 0.1, F.h * 0.1, 22, '#fff', 0.7);
      spark(c, F.w * 0.92, F.h * 0.5, 16, t, 0.9);
    },
  },

  /* Bandeau courbe en haut, contenu clair */
  'aff-vague': {
    align: 'left', upper: false, fam: FONT, wt: '800', price: 'tag', gloss: true, pts: 'card', logoPlate: false, headPad: 78,
    pal: (a) => {
      const a2 = accent2Of(a);
      return { headFg: readable(a), titleFg: readable(a), bodyFg: '#26314a', accent: a, check: readable(a), pillBg: a2, pillFg: readable(a2), priceBg: a, priceFg: readable(a), hlBg: a2, hlFg: readable(a2), footerBg: a, footerFg: readable(a) };
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
      wave(hb, gradient(c, 0, 0, F.w, hb, [[0, mix(a, '#000000', 0.12)], [1, mix(a, '#ffffff', 0.08)]]));
    },
  },

  /* Bandes de motif wax en haut et en bas */
  'aff-pagne': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', gloss: true, pts: 'card', top: 160, bottom: 76,
    pal: (a) => ({ headFg: INK, titleFg: inkOn(a), bodyFg: '#26314a', accent: a, check: readable(a), pillBg: a, pillFg: readable(a), priceBg: GOLD, priceFg: INK, hlBg: GOLD, hlFg: INK, footerBg: a, footerFg: readable(a), footerLine: GOLD }),
    paint(c, F, P, a) {
      rect(c, 0, 0, F.w, F.h, '#fff');
      wax(c, 0, 0, F.w, 110, a);
      rect(c, 0, 110, F.w, 8, GOLD);
      wax(c, 0, F.h - 76, F.w, 76, a);
    },
  },

  /* Rayons de soleil et pastille de prix explosive */
  'aff-promo': {
    align: 'center', upper: true, fam: FONT, wt: '800', price: 'burst', gloss: true, fx: 'shadow', pts: 'glass', chips: true, logoPlate: true,
    pal: (a) => {
      const fg = readable(a);
      const a2 = accent2Of(a);
      return { headFg: fg, bodyFg: fg, accent: a2, check: readable(a2), pillBg: a2, pillFg: readable(a2), priceBg: a2, priceFg: readable(a2), hlBg: a2, hlFg: readable(a2), footerBg: mix(a, '#000000', 0.45), footerFg: '#fff', heroRing: '#fff', chipBg: 'rgba(255,255,255,0.12)' };
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
      coin(c, F.w * 0.9, F.h * 0.12, 40, YELLOW, '%');
      coin(c, F.w * 0.08, F.h * 0.46, 30, YELLOW, '%');
      spark(c, F.w * 0.14, F.h * 0.1, 22, '#fff', 0.8);
    },
  },

  /* Photo plein cadre sous un voile sombre */
  'aff-photo': {
    align: 'left', upper: true, fam: FONT, wt: '800', price: 'tag', gloss: true, fx: 'shadow', pts: 'glass', chips: true, photoBg: true, logoPlate: true,
    pal: (a) => {
      const t = lum(a) < 0.22 ? lift(a) : a;
      return { headFg: '#fff', titleFg: '#fff', bodyFg: '#fff', accent: t, check: readable(t), pillBg: t, pillFg: readable(t), priceBg: t, priceFg: readable(t), hlBg: t, hlFg: readable(t), footerBg: 'rgba(0,0,0,0.55)', footerFg: '#fff', chipBg: 'rgba(255,255,255,0.14)' };
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
    align: 'center', upper: false, fam: SERIF, wt: '700', price: 'plain', hl: 'color', margin: 120, top: 130, bottom: 40, pillOutline: true,
    pal: (a) => ({ headFg: INK, titleFg: INK, bodyFg: '#33405a', accent: inkOn(a), check: '#fff', pillBg: inkOn(a), pillFg: inkOn(a), priceBg: inkOn(a), priceFg: inkOn(a), hlBg: inkOn(a), hlFg: inkOn(a), footerBg: null, footerFg: '#33405a', footerLine: inkOn(a) }),
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
      spark(c, 90, 100, 14, ac, 0.8);
      spark(c, F.w - 90, 100, 14, ac, 0.8);
    },
  },
};

/* =====================================================
   Texte riche : *mot* = mot mis en valeur
   ===================================================== */
export const stripMarks = (t) => String(t || '').replace(/\*/g, '');

function richLines(c, text, maxW, size, D, fam) {
  const parts = String(text).split(/(\*[^*]+\*)/).filter(Boolean);
  const words = [];
  parts.forEach((p) => {
    const hl = /^\*[^*]+\*$/.test(p);
    (hl ? p.slice(1, -1) : p).split(/\s+/).filter(Boolean).forEach((w) => words.push({ w, hl }));
  });
  c.save();
  c.font = `${D.italic ? 'italic ' : ''}${D.wt} ${size}px ${fam}`;
  const sp = c.measureText(' ').width;
  const pad = D.hl === 'color' ? 0 : size * 0.16;
  const ms = words.map((o) => ({ ...o, tw: c.measureText(o.w).width }));
  c.restore();
  const wOf = (o) => o.tw + (o.hl ? 2 * pad : 0);
  const lines = [];
  let cur = [];
  let cw = 0;
  ms.forEach((o) => {
    const w = wOf(o);
    if (cur.length && cw + sp + w > maxW) {
      lines.push({ ws: cur, w: cw });
      cur = [o];
      cw = w;
    } else {
      cw += cur.length ? sp + w : w;
      cur.push(o);
    }
  });
  if (cur.length) lines.push({ ws: cur, w: cw });
  return { lines, sp, pad, wide: ms.some((o) => wOf(o) > maxW) };
}

function drawRich(c, R, x0, by0, lh, size, D, P, F, align, fam, color) {
  c.save();
  c.font = `${D.italic ? 'italic ' : ''}${D.wt} ${size}px ${fam}`;
  c.textBaseline = 'alphabetic';
  c.textAlign = 'left';
  const hlKind = D.hl || 'pill';
  R.lines.forEach((ln, i) => {
    const by = by0 + i * lh;
    let x = align === 'center' ? x0 - ln.w / 2 : x0;
    let fill = color;
    if (D.fx === 'gold' && P.g1) fill = gradient(c, 0, by - size, 0, by + size * 0.2, [[0, P.g1], [0.5, P.g2], [1, P.g3]]);
    ln.ws.forEach((o) => {
      const w = o.tw + (o.hl ? 2 * R.pad : 0);
      if (o.hl && hlKind === 'pill') {
        rpath(c, x, by - size * 0.84, w, size * 1.02, size * 0.2);
        c.fillStyle = P.hlBg || P.pillBg;
        c.fill();
        if (D.brutal) {
          c.lineWidth = 4;
          c.strokeStyle = INK;
          c.stroke();
        }
      } else if (o.hl && hlKind === 'under') {
        rpath(c, x - 4, by - size * 0.34, w + 8, size * 0.36, size * 0.1);
        c.fillStyle = P.hlBg || P.accent;
        c.fill();
      }
      const tx = x + (o.hl ? R.pad : 0);
      if (o.hl && hlKind === 'pill') {
        c.fillStyle = P.hlFg || P.pillFg;
        c.fillText(o.w, tx, by);
      } else {
        c.save();
        const col = o.hl && hlKind === 'color' ? P.hlFg || P.accent : fill;
        if (D.fx === 'shadow') {
          c.shadowColor = 'rgba(0,0,0,0.4)';
          c.shadowBlur = 12;
          c.shadowOffsetY = 5;
        } else if (D.fx === 'glow') {
          c.shadowColor = P.glow || P.accent;
          c.shadowBlur = 26;
        } else if (D.fx === 'extrude') {
          c.fillStyle = P.extrude || '#000';
          for (let k = 1; k <= 7; k += 1) c.fillText(o.w, tx + k * 0.9, by + k * 0.9);
        } else if (D.fx === 'gold') {
          c.shadowColor = 'rgba(0,0,0,0.5)';
          c.shadowBlur = 8;
          c.shadowOffsetY = 4;
        }
        c.fillStyle = col;
        c.fillText(o.w, tx, by);
        c.restore();
      }
      x += w + R.sp;
    });
  });
  c.restore();
}

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
  const stickerTxt = d.sticker.trim();
  let stickerDone = false;

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
          c.save();
          c.shadowColor = 'rgba(0,0,0,0.25)';
          c.shadowBlur = 14;
          c.shadowOffsetY = 5;
          rpath(c, x, cy - boxW / 2, boxW, boxW, 18 * s);
          c.fillStyle = '#fff';
          c.fill();
          c.restore();
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
    const text = caps(stripMarks(d.accroche.trim()));
    c.save();
    c.font = `800 ${size}px ${FONT}`;
    c.letterSpacing = `${4 * s}px`;
    const tw = Math.min(c.measureText(text).width, CW - 70 * s);
    c.restore();
    const pw = tw + 64 * s;
    const ph = 62 * s;
    add('head', ph, (y) => {
      const x = center ? (F.w - pw) / 2 : M;
      if (D.pillOutline) {
        rpath(c, x, y, pw, ph, ph / 2);
        c.strokeStyle = P.pillBg;
        c.lineWidth = 3;
        c.stroke();
      } else if (D.brutal) {
        gloss(c, x, y, pw, ph, ph / 2, P.pillBg, { brutal: true });
      } else {
        c.save();
        c.shadowColor = 'rgba(0,0,0,0.25)';
        c.shadowBlur = 12;
        c.shadowOffsetY = 4;
        rpath(c, x, y, pw, ph, ph / 2);
        c.fillStyle = P.pillBg;
        c.fill();
        c.restore();
      }
      txt(c, text, x + pw / 2, y + ph / 2 + size * 0.35, { size, weight: '800', color: P.pillFg, align: 'center', spacing: 4 * s, maxW: tw + 2 });
    });
  }

  /* Titre : la plus grande taille qui tient en 3 lignes (mots *clés* mis en valeur) */
  if (d.titre.trim()) {
    const raw = d.titre.trim();
    const text = D.upper ? raw.toUpperCase() : raw;
    const bpad = D.bubble ? 34 * s : 0;
    const tw = CW - 2 * bpad;
    let size = titleCap * s;
    let R = null;
    for (; size >= 40 * s; size -= 4) {
      R = richLines(c, text, tw, size, D, fam);
      if (R.lines.length <= 3 && !R.wide) break;
    }
    const pill = (D.hl || 'pill') === 'pill';
    const lh = size * (pill ? 1.2 : 1.08);
    const textH = R.lines.length * lh;
    if (D.bubble) {
      const bh = textH + 2 * bpad - (lh - size) * 0.4;
      const tail = 30 * s;
      add('head', bh + tail, (y) => {
        c.save();
        c.shadowColor = 'rgba(0,0,0,0.3)';
        c.shadowBlur = 24;
        c.shadowOffsetY = 10;
        rpath(c, M, y, CW, bh, 34 * s);
        c.fillStyle = '#fff';
        c.fill();
        poly(c, [[M + 60 * s, y + bh - 4], [M + 140 * s, y + bh - 4], [M + 60 * s, y + bh + tail]], '#fff');
        c.restore();
        drawRich(c, R, M + bpad, y + bpad + size * 0.84, lh, size, D, P, F, 'left', fam, P.titleFg || P.headFg);
      });
    } else {
      add('head', textH, (y) => {
        drawRich(c, R, ax, y + size * 0.9, lh, size, D, P, F, al, fam, P.titleFg || P.headFg);
      });
    }
  }

  /* Sous-titre */
  if (d.sousTitre.trim()) {
    const size = 38 * s;
    const o = { size, weight: '500', fam: D.fam === SERIF ? SERIF : FONT, italic: D.fam === SERIF };
    const lines = wrapLines(c, stripMarks(d.sousTitre.trim()), CW, o, 3);
    const lh = size * 1.32;
    add('head', lines.length * lh, (y) => {
      lines.forEach((l, i) => txt(c, l, ax, y + size * 0.9 + i * lh, { ...o, color: P.headFg, alpha: 0.94, align: al, maxW: CW }));
    });
  }

  /* Espace sous un bandeau de couleur */
  if (D.headPad) add('pad', D.headPad * s, () => {});

  /* Photo principale, ou illustration dessinée */
  const art = !imgs.photo && D.art && ART[D.art];
  if (heroH > 0 && ((imgs.photo && !D.photoBg) || art)) {
    const R0 = Math.min(110 * s, 112);
    add('body', heroH, (y) => {
      const shape = D.heroShape || 'round';
      let bx = M;
      let bw = CW;
      if (shape === 'circle') {
        bw = Math.min(CW, heroH);
        bx = M + (CW - bw) / 2;
      } else if (shape === 'arch') {
        bw = Math.min(CW, heroH * 0.9);
        bx = M + (CW - bw) / 2;
      }
      const path = (grow = 0) => {
        const gx = bx - grow;
        const gy = y - grow;
        const gw = bw + 2 * grow;
        const gh = heroH + 2 * grow;
        if (shape === 'circle') {
          c.beginPath();
          c.arc(bx + bw / 2, y + heroH / 2, bw / 2 + grow, 0, Math.PI * 2);
        } else if (shape === 'arch') {
          const r = gw / 2;
          c.beginPath();
          c.moveTo(gx, gy + gh);
          c.lineTo(gx, gy + r);
          c.arc(gx + r, gy + r, r, Math.PI, 0);
          c.lineTo(gx + gw, gy + gh);
          c.closePath();
        } else rpath(c, gx, gy, gw, gh, 26 + grow * 0.5);
      };
      if (art) {
        c.save();
        c.beginPath();
        c.rect(M - 20, y - 10, CW + 40, heroH + 20);
        c.clip();
        ART[D.art](c, M, y, CW, heroH, P);
        c.restore();
      } else {
        c.save();
        if (P.heroRing) {
          path(8);
          c.fillStyle = P.heroRing;
          c.fill();
        } else {
          c.shadowColor = 'rgba(0,0,0,0.28)';
          c.shadowBlur = 30;
          c.shadowOffsetY = 12;
          path(0);
          c.fillStyle = '#fff';
          c.fill();
          c.shadowColor = 'transparent';
        }
        path(0);
        c.clip();
        cover(c, imgs.photo, bx, y, bw, heroH);
        c.restore();
        if (stickerTxt) sticker(c, M + CW - R0 * 0.75, y + R0 * 0.75, R0, stickerTxt, P);
      }
    });
    if (!art && stickerTxt) stickerDone = true;
    if (art && stickerTxt && !stickerDone) {
      stickerDone = true;
      blocks[blocks.length - 1].after = (y) => sticker(c, M + CW - 100 * s, y + 92 * s, 100 * s, stickerTxt, P);
    }
  }
  if (stickerTxt && !stickerDone) {
    stickerDone = true;
    const R = 96 * s;
    add('body', 2 * R * 0.86, (y) => sticker(c, center ? F.w / 2 : M + R, y + R * 0.86, R, stickerTxt, P));
  }

  /* Points forts */
  const pts = pointsOf(d).map(stripMarks);
  if (pts.length) {
    const kind = D.pts || 'plain';
    const size = 35 * s;
    const r = 18 * s;
    if (kind === 'plain') {
      const lh = 58 * s;
      c.save();
      c.font = `600 ${size}px ${FONT}`;
      const widest = Math.min(CW - 2 * r - 22 * s, Math.max(...pts.map((p) => c.measureText(p).width)));
      c.restore();
      const listW = widest + 2 * r + 22 * s;
      add('body', pts.length * lh, (y) => {
        const x0 = center ? (F.w - listW) / 2 : M;
        pts.forEach((p, i) => {
          const cy = y + i * lh + r;
          circle(c, x0 + r, cy, r, P.accent);
          icon(c, 'check', x0 + r - r * 0.55, cy - r * 0.55, r * 1.1, P.check);
          txt(c, p, x0 + 2 * r + 22 * s, cy + size * 0.34, { size, weight: '600', color: P.bodyFg, maxW: widest + 2 });
        });
      });
    } else {
      const rowH = 70 * s;
      const gap = 14 * s;
      const fs = 33 * s;
      add('body', pts.length * rowH + (pts.length - 1) * gap, (y) => {
        pts.forEach((p, i) => {
          const yy = y + i * (rowH + gap);
          panel(c, M, yy, CW, rowH, 22 * s, kind, P);
          const cx = M + 24 * s + r;
          const cy = yy + rowH / 2;
          circle(c, cx, cy, r, kind === 'brutal' ? P.accent : P.accent);
          icon(c, 'check', cx - r * 0.55, cy - r * 0.55, r * 1.1, P.check);
          const col = kind === 'brutal' || kind === 'card' ? INK : P.bodyFg;
          txt(c, p, cx + r + 20 * s, cy + fs * 0.34, { size: fs, weight: '700', color: col, maxW: CW - (cx - M) - r - 44 * s });
        });
      });
    }
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
        c.shadowColor = 'rgba(0,0,0,0.35)';
        c.shadowBlur = 26;
        c.shadowOffsetY = 9;
        poly(c, pts2, gradient(c, 0, cy - R, 0, cy + R, [[0, mix(P.priceBg, '#ffffff', 0.4)], [0.55, P.priceBg], [1, mix(P.priceBg, '#000000', 0.22)]]));
        c.restore();
        c.save();
        c.strokeStyle = 'rgba(255,255,255,0.55)';
        c.lineWidth = 4;
        c.beginPath();
        c.arc(cx, cy, R * 0.74, 0, Math.PI * 2);
        c.stroke();
        c.restore();
        const inner = R * 1.4;
        if (label) txt(c, caps(label), cx, cy - R * 0.3, { size: 26 * s, weight: '800', color: P.priceFg, align: 'center', spacing: 2 * s, maxW: inner, alpha: 0.85 });
        txt(c, price, cx, cy + (label ? R * 0.24 : R * 0.14), { size: 62 * s, weight: '800', color: P.priceFg, align: 'center', maxW: inner });
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
        if (D.gloss || D.brutal) gloss(c, x, y, pw, th, 26 * s, P.priceBg, { brutal: D.brutal });
        else {
          c.save();
          c.shadowColor = 'rgba(0,0,0,0.22)';
          c.shadowBlur = 18;
          c.shadowOffsetY = 6;
          rpath(c, x, y, pw, th, 26 * s);
          c.fillStyle = P.priceBg;
          c.fill();
          c.restore();
        }
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

  /* Bouton d'action brillant + lien */
  const btnTxt = d.bouton.trim();
  const link = d.lien.trim();
  if (btnTxt || link) {
    const bh = 92 * s;
    const lh2 = 64 * s;
    const g2 = 18 * s;
    const total = (btnTxt ? bh : 0) + (link ? lh2 : 0) + (btnTxt && link ? g2 : 0);
    add('body', total, (y) => {
      let yy = y;
      if (btnTxt) {
        const size = 38 * s;
        c.save();
        c.font = `800 ${size}px ${FONT}`;
        const tw = Math.min(c.measureText(btnTxt).width, CW - 190 * s);
        c.restore();
        const ar = bh * 0.64;
        const bw = Math.min(CW, tw + 60 * s + ar + 26 * s);
        const x = center ? (F.w - bw) / 2 : M;
        gloss(c, x, yy, bw, bh, bh / 2, YELLOW, { brutal: D.brutal });
        txt(c, btnTxt, x + 36 * s + tw / 2, yy + bh / 2 + size * 0.35, { size, weight: '800', color: INK, align: 'center', maxW: tw + 2 });
        const ax2 = x + bw - 16 * s - ar / 2;
        circle(c, ax2, yy + bh / 2, ar / 2, INK);
        icon(c, 'arrow', ax2 - ar * 0.3, yy + bh / 2 - ar * 0.3, ar * 0.6, '#fff');
        yy += bh + g2;
      }
      if (link) {
        const size = 31 * s;
        c.save();
        c.font = `700 ${size}px ${FONT}`;
        const tw = Math.min(c.measureText(link).width, CW - 120 * s);
        c.restore();
        const lw = tw + 100 * s;
        const x = center ? (F.w - lw) / 2 : M;
        c.save();
        c.shadowColor = 'rgba(0,0,0,0.25)';
        c.shadowBlur = 14;
        c.shadowOffsetY = 5;
        rpath(c, x, yy, lw, lh2, lh2 / 2);
        c.fillStyle = '#fff';
        c.fill();
        c.restore();
        rpath(c, x, yy, lw, lh2, lh2 / 2);
        c.strokeStyle = D.brutal ? INK : rgba(P.accent === '#fff' ? '#000000' : P.accent, 0.9);
        c.lineWidth = D.brutal ? 4 : 3;
        c.stroke();
        icon(c, 'globe', x + 26 * s, yy + lh2 / 2 - size * 0.55, size * 1.1, INK);
        txt(c, link, x + 26 * s + size * 1.1 + 14 * s + tw / 2, yy + lh2 / 2 + size * 0.34, { size, weight: '700', color: INK, align: 'center', maxW: tw + 2 });
      }
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
    if (single) maxW = F.w - 2 * M - 50;
    const lone = D.align === 'center' && (single || (items.length % 2 === 1 && i === items.length - 1));
    if (lone) {
      c.save();
      c.font = `600 ${size}px ${FONT}`;
      const tw = Math.min(c.measureText(it.text).width, maxW - 50);
      c.restore();
      x = (F.w - (size + 16 + tw)) / 2;
    }
    if (D.chips && P.chipBg) {
      c.save();
      c.font = `600 ${size}px ${FONT}`;
      const tw = Math.min(c.measureText(it.text).width, maxW - size - 16);
      c.restore();
      rpath(c, x - 16, cy - 24, size + 16 + tw + 32, 48, 24);
      c.fillStyle = P.chipBg;
      c.fill();
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
  const P = { stickBg: lum(a) > 0.55 ? '#e11d48' : YELLOW, stickFg: lum(a) > 0.55 ? '#fff' : INK, ...D.pal(a) };
  if (D.brutal) P.stickBg = '#ff4d6d';
  const fp = footerPlan(c, data, F, D, P);
  const top = D.top || 84;
  const footerTop = F.h - (D.bottom || 0) - fp.h;
  const avail = footerTop - top - 34;
  const gapBase = 32;
  const hasArt = !!(D.art && ART[D.art]);
  const wantsHero = (!!imgs.photo && !D.photoBg) || (!imgs.photo && hasArt);

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
        heroH = Math.min(free, F.h * (hasArt && !imgs.photo ? 0.5 : 0.42));
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
  placed.forEach((b) => {
    b.draw(b.y);
    if (b.after) b.after(b.y);
  });
  drawFooter(c, F, D, P, fp, footerTop);
  c.restore();
}
