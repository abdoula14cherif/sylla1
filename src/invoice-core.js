import { esc } from './cv.js';
import { isHex } from './design.js';

export const INVOICE_STYLES = [
  { id: 'facture-simple', nom: 'Simple' },
  { id: 'facture-pro', nom: 'Pro' },
  { id: 'facture-encadre', nom: 'Encadré' },
  { id: 'facture-moderne', nom: 'Moderne' },
  { id: 'facture-minimal', nom: 'Minimal' },
  { id: 'facture-bande', nom: 'Bande' },
];

export const DEVISES = {
  FCFA: { sym: 'FCFA', un: 'franc CFA', pl: 'francs CFA', dec: 0 },
  EUR: { sym: '€', un: 'euro', pl: 'euros', dec: 2 },
  USD: { sym: '$', un: 'dollar US', pl: 'dollars US', dec: 2 },
};

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
  return { lines, sub, remiseAmt, net, tva, total, acompte, reste: total - acompte };
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
  return {
    type,
    style: (prev && prev.style) || 'facture-simple',
    couleur: (prev && prev.couleur) || '#14213D',
    format: (prev && prev.format) || 'A4',
    devise: (prev && prev.devise) || 'FCFA',
    numero: `${type === 'devis' ? 'D' : 'F'}-${String(n).padStart(4, '0')}`,
    date: todayISO(),
    echeance: '',
    emetteur: prev ? { ...prev.emetteur } : { nom: '', adresse: '', tel: '', email: '', niu: '' },
    client: { nom: '', adresse: '', tel: '' },
    lignes: [{ desc: '', qte: '1', pu: '' }],
    tva: '0',
    remise: '0',
    acompte: '0',
    paiement: prev ? prev.paiement : '',
    conditions: prev ? prev.conditions : '',
    notes: '',
    cachet: prev && prev.cachet ? { ...prev.cachet } : defaultObj('cachet'),
    signature: prev && prev.signature ? { ...prev.signature } : defaultObj('signature'),
  };
}

const lib = (doc) => (doc.type === 'devis' ? 'Devis' : 'Facture');

/* ---------- Aperçu HTML (même rendu à l'écran, en PDF et à l'impression) ---------- */
export function invoiceHTML(doc, assets = {}, page = { w: 794, h: 1123 }, opts = {}) {
  const t = totals(doc);
  const dev = DEVISES[doc.devise] || DEVISES.FCFA;
  const M = (n) => `${fmtMoney(n, doc.devise)} ${dev.sym}`;
  const color = isHex(doc.couleur) ? doc.couleur : '#14213D';
  const e = doc.emetteur;
  const c = doc.client;
  const rows = t.lines
    .filter((l) => l.desc.trim() || num(l.pu))
    .map((l) => `<tr><td>${esc(l.desc)}</td><td class="r">${esc(String(l.qte))}</td><td class="r">${fmtMoney(num(l.pu), doc.devise)}</td><td class="r">${fmtMoney(l.total, doc.devise)}</td></tr>`)
    .join('');
  const from = [
    e.nom.trim() ? `<strong>${esc(e.nom)}</strong>` : '<strong class="ph">Votre entreprise</strong>',
    e.adresse.trim() && esc(e.adresse),
    [e.tel, e.email].filter((x) => x.trim()).map(esc).join(' – '),
    e.niu.trim() && `NIU : ${esc(e.niu)}`,
  ].filter(Boolean).join('<br>');
  const to = [
    c.nom.trim() ? `<strong>${esc(c.nom)}</strong>` : '<strong class="ph">Nom du client</strong>',
    c.adresse.trim() && esc(c.adresse),
    c.tel.trim() && esc(c.tel),
  ].filter(Boolean).join('<br>');
  const limit = doc.echeance ? `<p>${doc.type === 'devis' ? "Valable jusqu'au" : 'Échéance'} : ${esc(dateFR(doc.echeance))}</p>` : '';

  const tot = [];
  if (t.remiseAmt > 0 || t.tva > 0) tot.push(['Sous-total', M(t.sub), '']);
  if (t.remiseAmt > 0) tot.push([`Remise (${esc(String(doc.remise))} %)`, `− ${M(t.remiseAmt)}`, '']);
  if (t.tva > 0) tot.push([`TVA (${esc(String(doc.tva))} %)`, M(t.tva), '']);
  tot.push(['Total', M(t.total), 'big']);
  if (t.acompte > 0) {
    tot.push(['Acompte versé', `− ${M(t.acompte)}`, '']);
    tot.push(['Reste à payer', M(t.reste), 'big2']);
  }
  const words = t.total > 0 ? montantEnLettres(Math.round(t.total * 100) / 100, doc.devise) : '';
  const obj = (kind, o, src) =>
    o && o.on && src
      ? `<img class="ov-obj" data-obj="${kind}" alt="" src="${src}" style="left:${o.x}%;top:${o.y}%;width:${o.size}%;transform:translate(-50%,-50%) rotate(${o.rot}deg)">`
      : '';
  const px = Math.round(page.w * 0.06);
  const py = Math.round(page.w * 0.055);

  return `<div class="inv-paper ${esc(doc.style)}${opts.pdf ? ' pdf' : ''}" style="--inv:${color};--px:${px}px;--py:${py}px;width:${page.w}px;min-height:${page.h}px">
    <div class="inv-head">
      <div class="inv-from">${assets.logo ? `<img class="inv-logo" alt="" src="${assets.logo}">` : ''}<div>${from}</div></div>
      <div class="inv-title"><h1>${lib(doc).toUpperCase()}</h1><p>N° ${esc(doc.numero)}</p><p>Date : ${esc(dateFR(doc.date))}</p>${limit}</div>
    </div>
    <div class="inv-to"><small>${doc.type === 'devis' ? 'Devis pour' : 'Facturé à'}</small><br>${to}</div>
    <table class="inv-table"><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">Prix unitaire</th><th class="r">Total</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="ph">Ajoutez vos lignes</td></tr>'}</tbody></table>
    <div class="inv-totals">${tot.map(([a, b, k]) => `<div class="${k}"><span>${a}</span><span>${b}</span></div>`).join('')}</div>
    ${words ? `<p class="inv-words">Arrêté ${doc.type === 'devis' ? 'le présent devis' : 'la présente facture'} à la somme de <strong>${esc(words)}</strong>.</p>` : ''}
    ${doc.paiement.trim() ? `<p class="inv-pay"><strong>Paiement :</strong> ${esc(doc.paiement)}</p>` : ''}
    ${doc.conditions.trim() ? `<p class="inv-cond">${esc(doc.conditions).replace(/\n/g, '<br>')}</p>` : ''}
    ${doc.notes.trim() ? `<p class="inv-notes">${esc(doc.notes).replace(/\n/g, '<br>')}</p>` : ''}
    <div class="inv-sign"><span>Signature et cachet</span></div>
    ${obj('cachet', doc.cachet, assets.cachet)}${obj('signature', doc.signature, assets.signature)}
  </div>`;
}

/* ---------- Version texte ---------- */
export function invoiceText(doc) {
  const t = totals(doc);
  const dev = DEVISES[doc.devise] || DEVISES.FCFA;
  const M = (n) => `${fmtMoney(n, doc.devise)} ${dev.sym}`;
  const e = doc.emetteur;
  const c = doc.client;
  const L = [`${lib(doc).toUpperCase()} N° ${doc.numero}`];
  if (doc.date) L.push(`Date : ${dateFR(doc.date)}`);
  if (doc.echeance) L.push(`${doc.type === 'devis' ? "Valable jusqu'au" : 'Échéance'} : ${dateFR(doc.echeance)}`);
  L.push('');
  const from = [e.nom, e.tel, e.email, e.niu && `NIU ${e.niu}`].filter((x) => x && x.trim());
  if (from.length) L.push(`De : ${from.join(' – ')}`);
  const to = [c.nom, c.tel].filter((x) => x && x.trim());
  if (to.length) L.push(`Pour : ${to.join(' – ')}`);
  L.push('');
  t.lines.filter((l) => l.desc.trim() || num(l.pu)).forEach((l, i) => L.push(`${i + 1}. ${l.desc.trim() || 'Article'} : ${l.qte} × ${fmtMoney(num(l.pu), doc.devise)} = ${M(l.total)}`));
  L.push('');
  if (t.remiseAmt > 0 || t.tva > 0) L.push(`Sous-total : ${M(t.sub)}`);
  if (t.remiseAmt > 0) L.push(`Remise (${doc.remise} %) : − ${M(t.remiseAmt)}`);
  if (t.tva > 0) L.push(`TVA (${doc.tva} %) : ${M(t.tva)}`);
  L.push(`TOTAL : ${M(t.total)}`);
  if (t.acompte > 0) {
    L.push(`Acompte versé : − ${M(t.acompte)}`);
    L.push(`RESTE À PAYER : ${M(t.reste)}`);
  }
  if (t.total > 0) L.push(`Arrêté à la somme de : ${montantEnLettres(Math.round(t.total * 100) / 100, doc.devise)}`);
  if (doc.paiement.trim()) L.push('', `Paiement : ${doc.paiement.trim()}`);
  if (doc.conditions.trim()) L.push('', doc.conditions.trim());
  if (doc.notes.trim()) L.push('', doc.notes.trim());
  return L.join('\n');
}
