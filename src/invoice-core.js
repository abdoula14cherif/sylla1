import { esc } from './cv.js';
import { isHex } from './design.js';

export const INVOICE_STYLES = [
  { id: 'facture-simple', nom: 'Simple' },
  { id: 'facture-pro', nom: 'Pro' },
  { id: 'facture-encadre', nom: 'Encadré' },
  { id: 'facture-moderne', nom: 'Moderne' },
  { id: 'facture-minimal', nom: 'Minimal' },
  { id: 'facture-bande', nom: 'Bande' },
  { id: 'facture-classique', nom: 'Carnet (cadres)' },
  { id: 'facture-wax', nom: 'Wax' },
  { id: 'facture-boutique', nom: 'Ticket boutique' },
  { id: 'facture-stripe', nom: 'Montant dû' },
  { id: 'facture-luxe', nom: 'Luxe noir & or' },
  { id: 'facture-societe', nom: 'Société' },
];

/* Types de documents */
export const DOC_TYPES = {
  facture: { nom: 'Facture', court: 'Facture', p: 'F', pour: 'Facturé à', mot: 'la présente facture' },
  proforma: { nom: 'Proforma', court: 'Facture proforma', p: 'PF', pour: 'Facturé à', mot: 'la présente facture proforma' },
  devis: { nom: 'Devis', court: 'Devis', p: 'D', pour: 'Devis pour', mot: 'le présent devis' },
  recu: { nom: 'Reçu', court: 'Reçu', p: 'R', pour: 'Reçu de', mot: 'le présent reçu' },
};
const tp = (doc) => DOC_TYPES[doc.type] || DOC_TYPES.facture;
const validite = (doc) => doc.type === 'devis' || doc.type === 'proforma';

export const DEVISES = {
  FCFA: { nom: 'FCFA (franc CFA)', sym: 'FCFA', un: 'franc CFA', pl: 'francs CFA', dec: 0 },
  EUR: { nom: 'Euro (€)', sym: '€', un: 'euro', pl: 'euros', dec: 2 },
  USD: { nom: 'Dollar US ($)', sym: '$', un: 'dollar US', pl: 'dollars US', dec: 2 },
  GBP: { nom: 'Livre sterling (£)', sym: '£', un: 'livre sterling', pl: 'livres sterling', dec: 2 },
  MAD: { nom: 'Dirham marocain (MAD)', sym: 'MAD', un: 'dirham', pl: 'dirhams', dec: 2 },
  NGN: { nom: 'Naira (₦)', sym: '₦', un: 'naira', pl: 'nairas', dec: 2 },
  CDF: { nom: 'Franc congolais (CDF)', sym: 'CDF', un: 'franc congolais', pl: 'francs congolais', dec: 0 },
};

/* Modèles par pays : devise, TVA usuelle, intitulés des identifiants, mentions types */
const PAIEMENT_MM = (l) => `${l}\nEspèces ou virement bancaire`;
const COND_AFR = 'Marchandises vendues ne sont ni reprises ni échangées.\nTout retard de paiement peut donner lieu à des pénalités.';
export const PAYS = {
  CM: { nom: 'Cameroun', drap: '🇨🇲', devise: 'FCFA', tva: '19.25', id1: 'NIU', id2: 'RCCM', tvaNote: 'TVA au taux de 19,25 % (17,5 % + 10 % de centimes additionnels communaux)', paiement: PAIEMENT_MM('MTN Mobile Money : 6 .. .. .. ..\nOrange Money : 6 .. .. .. ..'), conditions: COND_AFR },
  SN: { nom: 'Sénégal', drap: '🇸🇳', devise: 'FCFA', tva: '18', id1: 'NINEA', id2: 'RCCM', tvaNote: 'TVA au taux de 18 %', paiement: PAIEMENT_MM('Wave : 7. ... .. ..\nOrange Money : 7. ... .. ..'), conditions: COND_AFR },
  CI: { nom: "Côte d'Ivoire", drap: '🇨🇮', devise: 'FCFA', tva: '18', id1: 'N° CC', id2: 'RCCM', tvaNote: 'TVA au taux de 18 %', paiement: PAIEMENT_MM('Wave : 07 .. .. .. ..\nOrange Money / MTN MoMo : 05 .. .. .. ..'), conditions: COND_AFR },
  GA: { nom: 'Gabon', drap: '🇬🇦', devise: 'FCFA', tva: '18', id1: 'NIF', id2: 'RCCM', tvaNote: 'TVA au taux de 18 %', paiement: PAIEMENT_MM('Airtel Money : 07 .. .. ..'), conditions: COND_AFR },
  ML: { nom: 'Mali', drap: '🇲🇱', devise: 'FCFA', tva: '18', id1: 'NIF', id2: 'RCCM', tvaNote: 'TVA au taux de 18 %', paiement: PAIEMENT_MM('Orange Money : 7. .. .. ..\nMoov Money : 6. .. .. ..'), conditions: COND_AFR },
  BJ: { nom: 'Bénin', drap: '🇧🇯', devise: 'FCFA', tva: '18', id1: 'IFU', id2: 'RCCM', tvaNote: 'TVA au taux de 18 %', paiement: PAIEMENT_MM('MTN MoMo : 9. .. .. ..\nMoov Money : 9. .. .. ..'), conditions: COND_AFR },
  TG: { nom: 'Togo', drap: '🇹🇬', devise: 'FCFA', tva: '18', id1: 'NIF', id2: 'RCCM', tvaNote: 'TVA au taux de 18 %', paiement: PAIEMENT_MM('T-Money : 9. .. .. ..\nFlooz : 9. .. .. ..'), conditions: COND_AFR },
  CD: { nom: 'RDC', drap: '🇨🇩', devise: 'USD', tva: '16', id1: 'N° Impôt (NIF)', id2: 'RCCM / Id. Nat.', tvaNote: 'TVA au taux de 16 %', paiement: PAIEMENT_MM('M-Pesa / Airtel Money : 08. ... ....'), conditions: COND_AFR },
  MA: { nom: 'Maroc', drap: '🇲🇦', devise: 'MAD', tva: '20', id1: 'ICE', id2: 'RC / IF', tvaNote: 'TVA au taux de 20 %', paiement: 'Virement bancaire ou espèces', conditions: 'Tout retard de paiement peut donner lieu à des pénalités.' },
  NG: { nom: 'Nigeria', drap: '🇳🇬', devise: 'NGN', tva: '7.5', id1: 'TIN', id2: 'RC No.', tvaNote: 'VAT à 7,5 %', paiement: 'Virement bancaire (Opay / Palmpay / banque)', conditions: 'Paiement à réception de la facture.' },
  FR: { nom: 'France', drap: '🇫🇷', devise: 'EUR', tva: '20', id1: 'SIRET', id2: 'N° TVA intracom.', tvaNote: 'TVA au taux de 20 %', paiement: 'Virement bancaire (IBAN ci-dessous)', conditions: "Paiement à 30 jours. En cas de retard : pénalités de retard et indemnité forfaitaire de recouvrement de 40 € (art. L441-10 du Code de commerce)." },
  XX: { nom: 'Autre pays', drap: '🌍', devise: 'USD', tva: '0', id1: 'N° fiscal', id2: 'N° registre', tvaNote: '', paiement: 'Virement bancaire', conditions: 'Paiement à réception de la facture.' },
};

/* Modèles d'activité : lignes d'exemple adaptées au terrain */
export const MODELES = [
  { id: 'boutique', nom: 'Boutique / épicerie', objet: 'Vente de marchandises', lignes: [['Sac de riz 25 kg', '2', '17500'], ['Huile végétale 5 L', '3', '6500'], ['Sucre 1 kg', '10', '900'], ['Savon de ménage (carton)', '1', '12000']], conditions: 'Marchandises vendues ne sont ni reprises ni échangées.' },
  { id: 'btp', nom: 'Quincaillerie / BTP', objet: 'Fourniture de matériaux et main-d’œuvre', lignes: [['Ciment CPJ 42,5 (sac de 50 kg)', '40', '6500'], ['Fer à béton Ø10 (barre de 12 m)', '30', '4200'], ['Main-d’œuvre maçon (jour)', '5', '10000'], ['Transport sur chantier (forfait)', '1', '35000']], conditions: 'Acompte de 50 % à la commande, solde à la livraison.\nValidité de l’offre : 15 jours.' },
  { id: 'tel', nom: 'Téléphonie / électronique', objet: 'Vente d’appareils et accessoires', lignes: [['Smartphone Android 128 Go', '1', '95000'], ['Verre trempé + coque', '1', '3500'], ['Chargeur rapide 25 W', '1', '6000']], conditions: 'Garantie 6 mois sur l’appareil (hors casse et oxydation).\nConservez cette facture pour toute réclamation.' },
  { id: 'resto', nom: 'Restauration / traiteur', objet: 'Prestation de restauration — événement', lignes: [['Buffet complet (par personne)', '50', '7500'], ['Boissons (forfait)', '1', '85000'], ['Location chaises et bâches (forfait)', '1', '60000'], ['Service — serveurs', '4', '10000']], conditions: 'Acompte de 50 % à la réservation, non remboursable.\nSolde à régler le jour de l’événement.' },
  { id: 'digital', nom: 'Prestations digitales', objet: 'Création de support de communication', lignes: [['Création de logo et charte graphique', '1', '50000'], ['Site vitrine (5 pages)', '1', '250000'], ['Maintenance mensuelle', '3', '15000']], conditions: 'Acompte de 50 % au démarrage.\nLes fichiers sources sont remis après règlement complet.' },
  { id: 'transport', nom: 'Transport / logistique', objet: 'Transport de marchandises', lignes: [['Transport Douala – Yaoundé (camion 10 t)', '1', '180000'], ['Manutention (chargement/déchargement)', '1', '25000'], ['Assurance marchandise', '1', '15000']], conditions: 'Le transporteur n’est pas responsable des marchandises mal emballées.\nPaiement à la livraison.' },
  { id: 'ecole', nom: 'École / formation', objet: 'Frais de scolarité et de formation', lignes: [['Inscription', '1', '25000'], ['Frais de scolarité — 1re tranche', '1', '75000'], ['Uniforme et fournitures', '1', '18000']], conditions: 'Les frais de scolarité ne sont pas remboursables.' },
];

export const num = (v) => {
  const x = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(x) ? x : 0;
};

export function fmtMoney(n, devise = 'FCFA') {
  const d = DEVISES[devise] || DEVISES.FCFA;
  const v = d.dec ? Math.round((n || 0) * 100) / 100 : Math.round(n || 0);
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d.dec && v % 1 ? 2 : 0, maximumFractionDigits: d.dec }).format(v);
}
export const fmt = (n) => fmtMoney(n, 'FCFA');

export function totals(doc) {
  const lines = doc.lignes.map((l) => ({ ...l, total: num(l.qte) * num(l.pu) }));
  const sub = lines.reduce((a, l) => a + l.total, 0);
  const remiseAmt = (sub * num(doc.remise)) / 100;
  const net = sub - remiseAmt;
  const tva = (net * num(doc.tva)) / 100;
  const total = net + tva;
  const acompte = num(doc.acompte);
  return { lines, sub, remiseAmt, net, tva, total, acompte, reste: Math.max(0, total - acompte) };
}

/* ---------- Montant en lettres (français) ---------- */
const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const T = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

function below100(n, final) {
  if (n < 17) return U[n];
  if (n < 20) return `dix-${U[n - 10]}`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7) return u === 1 ? 'soixante et onze' : `soixante-${below100(n - 60)}`;
  if (t === 8) return u === 0 ? (final ? 'quatre-vingts' : 'quatre-vingt') : `quatre-vingt-${U[u]}`;
  if (t === 9) return `quatre-vingt-${below100(n - 80)}`;
  if (u === 0) return T[t];
  if (u === 1) return `${T[t]} et un`;
  return `${T[t]}-${U[u]}`;
}

function below1000(n, final) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = '';
  if (h) s = (h === 1 ? 'cent' : `${U[h]} cent`) + (r === 0 && h > 1 && final ? 's' : '');
  if (r) s += (s ? ' ' : '') + below100(r, final);
  return s;
}

export function enLettres(value) {
  const n = Math.floor(Math.abs(value || 0));
  if (n === 0) return 'zéro';
  if (n >= 1e12) return String(n);
  const mil = Math.floor(n / 1e9);
  const mi = Math.floor((n % 1e9) / 1e6);
  const th = Math.floor((n % 1e6) / 1000);
  const rest = n % 1000;
  const parts = [];
  if (mil) parts.push(`${below1000(mil, false)} milliard${mil > 1 ? 's' : ''}`);
  if (mi) parts.push(`${below1000(mi, false)} million${mi > 1 ? 's' : ''}`);
  if (th) parts.push(th === 1 ? 'mille' : `${below1000(th, false)} mille`);
  if (rest) parts.push(below1000(rest, true));
  return parts.join(' ');
}

export function montantEnLettres(n, devise = 'FCFA') {
  const d = DEVISES[devise] || DEVISES.FCFA;
  if (!d.dec) {
    const w = Math.round(n);
    return `${enLettres(w)} ${w > 1 ? d.pl : d.un}`;
  }
  const cents = Math.round(n * 100);
  const w = Math.floor(cents / 100);
  const c = cents % 100;
  return `${enLettres(w)} ${w > 1 ? d.pl : d.un}${c ? ` et ${enLettres(c)} centime${c > 1 ? 's' : ''}` : ''}`;
}

/* ---------- Dates ---------- */
export function todayISO() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function dateFR(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ---------- Document vierge ---------- */
export const defaultObj = (kind) => (kind === 'cachet' ? { on: false, x: 76, y: 86, size: 24, rot: -8 } : { on: false, x: 28, y: 88, size: 22, rot: 0 });

export function blankDoc(type, n, prev) {
  const pays = (prev && prev.pays) || 'CM';
  const P = PAYS[pays] || PAYS.CM;
  return {
    type,
    pays,
    style: (prev && prev.style) || 'facture-simple',
    couleur: (prev && prev.couleur) || '#14213D',
    format: (prev && prev.format) || 'A4',
    devise: (prev && prev.devise) || P.devise,
    numero: `${(DOC_TYPES[type] || DOC_TYPES.facture).p}-${String(n).padStart(4, '0')}`,
    date: todayISO(),
    echeance: '',
    objet: '',
    emetteur: prev ? { nom: '', adresse: '', tel: '', email: '', niu: '', rccm: '', forme: '', compte: '', ...prev.emetteur } : { nom: '', adresse: '', tel: '', email: '', niu: '', rccm: '', forme: '', compte: '' },
    client: { nom: '', adresse: '', tel: '', niu: '' },
    lignes: [{ desc: '', qte: '1', pu: '' }],
    tva: prev ? prev.tva || '0' : '0',
    remise: '0',
    acompte: '0',
    paiement: prev ? prev.paiement : '',
    conditions: prev ? prev.conditions : '',
    notes: '',
    cachet: prev && prev.cachet ? { ...prev.cachet } : defaultObj('cachet'),
    signature: prev && prev.signature ? { ...prev.signature } : defaultObj('signature'),
  };
}

const lib = (doc) => tp(doc).court;

/* ---------- Aperçu HTML (même rendu à l'écran, en PDF et à l'impression) ---------- */
export function invoiceHTML(doc, assets = {}, page = { w: 794, h: 1123 }, opts = {}) {
  const t = totals(doc);
  const dev = DEVISES[doc.devise] || DEVISES.FCFA;
  const P = PAYS[doc.pays] || PAYS.CM;
  const M = (n) => `${fmtMoney(n, doc.devise)} ${dev.sym}`;
  const color = isHex(doc.couleur) ? doc.couleur : '#14213D';
  const e = doc.emetteur;
  const c = doc.client;
  const rows = t.lines
    .filter((l) => l.desc.trim() || num(l.pu))
    .map((l) => `<tr><td>${esc(l.desc)}</td><td class="r">${esc(String(l.qte))}</td><td class="r">${fmtMoney(num(l.pu), doc.devise)}</td><td class="r">${fmtMoney(l.total, doc.devise)}</td></tr>`)
    .join('');
  const ids = [e.niu.trim() && `${esc(P.id1)} : ${esc(e.niu)}`, e.rccm.trim() && `${esc(P.id2)} : ${esc(e.rccm)}`].filter(Boolean).join(' · ');
  const from = [
    e.nom.trim() ? `<strong>${esc(e.nom)}</strong>` : '<strong class="ph">Votre entreprise</strong>',
    e.forme.trim() && `<span class="forme">${esc(e.forme)}</span>`,
    e.adresse.trim() && esc(e.adresse),
    [e.tel, e.email].filter((x) => x.trim()).map(esc).join(' – '),
    ids,
  ].filter(Boolean).join('<br>');
  const to = [
    c.nom.trim() ? `<strong>${esc(c.nom)}</strong>` : '<strong class="ph">Nom du client</strong>',
    c.adresse.trim() && esc(c.adresse),
    c.tel.trim() && esc(c.tel),
    c.niu.trim() && `${esc(P.id1)} : ${esc(c.niu)}`,
  ].filter(Boolean).join('<br>');
  const limit = doc.echeance ? `<p>${validite(doc) ? "Valable jusqu'au" : 'Échéance'} : ${esc(dateFR(doc.echeance))}</p>` : '';
  const hasTva = t.tva > 0;

  const tot = [];
  if (t.remiseAmt > 0 || hasTva) tot.push([t.remiseAmt > 0 ? 'Sous-total' : hasTva ? 'Total HT' : 'Sous-total', M(t.sub), '']);
  if (t.remiseAmt > 0) tot.push([`Remise (${esc(String(doc.remise))} %)`, `− ${M(t.remiseAmt)}`, '']);
  if (t.remiseAmt > 0 && hasTva) tot.push(['Net HT', M(t.net), '']);
  if (hasTva) tot.push([`TVA (${esc(String(doc.tva).replace('.', ','))} %)`, M(t.tva), '']);
  tot.push([hasTva ? 'Total TTC' : 'Total', M(t.total), 'big']);
  if (t.acompte > 0) {
    tot.push([doc.type === 'recu' ? 'Déjà réglé' : 'Acompte versé', `− ${M(t.acompte)}`, '']);
    tot.push(['Reste à payer', M(t.reste), 'big2']);
  }
  const words = t.total > 0 ? montantEnLettres(Math.round(t.total * 100) / 100, doc.devise) : '';
  const paid = t.total > 0 && t.acompte >= t.total && doc.type !== 'devis' && doc.type !== 'proforma';
  const dueLabel = doc.type === 'devis' ? 'Montant du devis' : doc.type === 'recu' ? 'Montant reçu' : doc.type === 'proforma' ? 'Montant proforma' : t.acompte > 0 ? 'Reste à payer' : 'Montant à payer';
  const dueVal = doc.type === 'recu' ? t.total : t.acompte > 0 && doc.type !== 'devis' ? t.reste : t.total;
  const obj = (kind, o, src) =>
    o && o.on && src
      ? `<img class="ov-obj" data-obj="${kind}" alt="" src="${src}" style="left:${o.x}%;top:${o.y}%;width:${o.size}%;transform:translate(-50%,-50%) rotate(${o.rot}deg)">`
      : '';
  const px = Math.round(page.w * 0.06);
  const py = Math.round(page.w * 0.055);
  const legal = [hasTva && P.tvaNote, e.compte.trim() && `Compte bancaire : ${esc(e.compte)}`].filter(Boolean).join(' — ');
  const lead =
    doc.type === 'recu'
      ? `${c.nom.trim() ? `Reçu de <strong>${esc(c.nom)}</strong> la` : 'Reçu la'} somme de <strong>${esc(words)}</strong>${doc.objet.trim() ? ` pour : ${esc(doc.objet)}` : ''}.`
      : `Arrêté ${tp(doc).mot} à la somme de <strong>${esc(words)}</strong>.`;

  return `<div class="inv-paper ${esc(doc.style)} t-${esc(doc.type)}${opts.pdf ? ' pdf' : ''}" style="--inv:${color};--px:${px}px;--py:${py}px;width:${page.w}px;min-height:${page.h}px">
    <div class="inv-head">
      <div class="inv-from">${assets.logo ? `<img class="inv-logo" alt="" src="${assets.logo}">` : ''}<div>${from}</div></div>
      <div class="inv-title"><h1>${lib(doc).toUpperCase()}</h1><p>N° ${esc(doc.numero)}</p><p>Date : ${esc(dateFR(doc.date))}</p>${limit}</div>
    </div>
    ${paid ? '<div class="inv-paid">PAYÉ</div>' : ''}
    <div class="inv-to"><small>${tp(doc).pour}</small><br>${to}</div>
    ${doc.objet.trim() && doc.type !== 'recu' ? `<p class="inv-objet"><strong>Objet :</strong> ${esc(doc.objet)}</p>` : ''}
    <div class="inv-due"><span>${dueLabel}</span><strong>${M(dueVal)}</strong></div>
    <table class="inv-table"><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">Prix unitaire</th><th class="r">Total</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="ph">Ajoutez vos lignes</td></tr>'}</tbody></table>
    <div class="inv-totals">${tot.map(([a, b, k]) => `<div class="${k}"><span>${a}</span><span>${b}</span></div>`).join('')}</div>
    ${words ? `<p class="inv-words">${lead}</p>` : ''}
    ${doc.paiement.trim() ? `<p class="inv-pay"><strong>Paiement :</strong> ${esc(doc.paiement).replace(/\n/g, '<br>')}</p>` : ''}
    ${doc.conditions.trim() ? `<p class="inv-cond">${esc(doc.conditions).replace(/\n/g, '<br>')}</p>` : ''}
    ${doc.notes.trim() ? `<p class="inv-notes">${esc(doc.notes).replace(/\n/g, '<br>')}</p>` : ''}
    <div class="inv-sign"><span>${doc.type === 'recu' ? 'Cachet et signature de celui qui reçoit' : doc.type === 'devis' ? 'Bon pour accord, signature du client' : 'Signature et cachet'}</span></div>
    ${legal ? `<p class="inv-legal">${legal}</p>` : ''}
    ${obj('cachet', doc.cachet, assets.cachet)}${obj('signature', doc.signature, assets.signature)}
  </div>`;
}

/* ---------- Version texte ---------- */
export function invoiceText(doc) {
  const t = totals(doc);
  const dev = DEVISES[doc.devise] || DEVISES.FCFA;
  const P = PAYS[doc.pays] || PAYS.CM;
  const M = (n) => `${fmtMoney(n, doc.devise)} ${dev.sym}`;
  const e = doc.emetteur;
  const c = doc.client;
  const L = [`${lib(doc).toUpperCase()} N° ${doc.numero}`];
  if (doc.date) L.push(`Date : ${dateFR(doc.date)}`);
  if (doc.echeance) L.push(`${validite(doc) ? "Valable jusqu'au" : 'Échéance'} : ${dateFR(doc.echeance)}`);
  if (doc.objet.trim()) L.push(`Objet : ${doc.objet.trim()}`);
  L.push('');
  const from = [e.nom, e.tel, e.email, e.niu && `${P.id1} ${e.niu}`, e.rccm && `${P.id2} ${e.rccm}`].filter((x) => x && x.trim());
  if (from.length) L.push(`De : ${from.join(' – ')}`);
  const to = [c.nom, c.tel, c.niu && `${P.id1} ${c.niu}`].filter((x) => x && x.trim());
  if (to.length) L.push(`Pour : ${to.join(' – ')}`);
  L.push('');
  t.lines.filter((l) => l.desc.trim() || num(l.pu)).forEach((l, i) => L.push(`${i + 1}. ${l.desc.trim() || 'Article'} : ${l.qte} × ${fmtMoney(num(l.pu), doc.devise)} = ${M(l.total)}`));
  L.push('');
  const hasTva = t.tva > 0;
  if (t.remiseAmt > 0 || hasTva) L.push(`${hasTva && t.remiseAmt <= 0 ? 'Total HT' : 'Sous-total'} : ${M(t.sub)}`);
  if (t.remiseAmt > 0) L.push(`Remise (${doc.remise} %) : − ${M(t.remiseAmt)}`);
  if (hasTva) L.push(`TVA (${String(doc.tva).replace('.', ',')} %) : ${M(t.tva)}`);
  L.push(`${hasTva ? 'TOTAL TTC' : 'TOTAL'} : ${M(t.total)}`);
  if (t.acompte > 0) {
    L.push(`${doc.type === 'recu' ? 'Déjà réglé' : 'Acompte versé'} : − ${M(t.acompte)}`);
    L.push(`RESTE À PAYER : ${M(t.reste)}`);
  }
  if (t.total > 0) L.push(`Arrêté à la somme de : ${montantEnLettres(Math.round(t.total * 100) / 100, doc.devise)}`);
  if (doc.paiement.trim()) L.push('', `Paiement : ${doc.paiement.trim()}`);
  if (e.compte.trim()) L.push(`Compte bancaire : ${e.compte.trim()}`);
  if (doc.conditions.trim()) L.push('', doc.conditions.trim());
  if (doc.notes.trim()) L.push('', doc.notes.trim());
  return L.join('\n');
}
