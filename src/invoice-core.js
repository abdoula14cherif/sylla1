import { esc } from './cv.js';

export const INVOICE_STYLES = [
  { id: 'facture-simple', nom: 'Simple' },
  { id: 'facture-pro', nom: 'Pro' },
  { id: 'facture-encadre', nom: 'Encadré' },
];

export const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

export const num = (v) => {
  const x = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(x) ? x : 0;
};

export function totals(doc) {
  const lines = doc.lignes.map((l) => ({ ...l, total: num(l.qte) * num(l.pu) }));
  const sub = lines.reduce((a, l) => a + l.total, 0);
  const tva = (sub * num(doc.tva)) / 100;
  return { lines, sub, tva, total: sub + tva };
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
export function blankDoc(type, n, prev) {
  return {
    type,
    style: (prev && prev.style) || 'facture-simple',
    numero: `${type === 'devis' ? 'D' : 'F'}-${String(n).padStart(4, '0')}`,
    date: todayISO(),
    echeance: '',
    emetteur: prev ? { ...prev.emetteur } : { nom: '', adresse: '', tel: '', email: '', niu: '' },
    client: { nom: '', adresse: '', tel: '' },
    lignes: [{ desc: '', qte: '1', pu: '' }],
    tva: '0',
    paiement: prev ? prev.paiement : '',
    notes: '',
  };
}

const lib = (doc) => (doc.type === 'devis' ? 'Devis' : 'Facture');

/* ---------- Aperçu HTML ---------- */
export function invoiceHTML(doc) {
  const t = totals(doc);
  const e = doc.emetteur;
  const c = doc.client;
  const rows = t.lines
    .filter((l) => l.desc.trim() || num(l.pu))
    .map(
      (l) =>
        `<tr><td>${esc(l.desc)}</td><td class="r">${esc(String(l.qte))}</td><td class="r">${fmt(num(l.pu))}</td><td class="r">${fmt(l.total)}</td></tr>`
    )
    .join('');
  const from = [
    e.nom.trim() ? `<strong>${esc(e.nom)}</strong>` : '<strong class="ph">Votre entreprise</strong>',
    e.adresse.trim() && esc(e.adresse),
    [e.tel, e.email].filter((x) => x.trim()).map(esc).join(' – '),
    e.niu.trim() && `NIU : ${esc(e.niu)}`,
  ]
    .filter(Boolean)
    .join('<br>');
  const to = [
    c.nom.trim() ? `<strong>${esc(c.nom)}</strong>` : '<strong class="ph">Nom du client</strong>',
    c.adresse.trim() && esc(c.adresse),
    c.tel.trim() && esc(c.tel),
  ]
    .filter(Boolean)
    .join('<br>');
  const limit = doc.echeance
    ? `<p>${doc.type === 'devis' ? "Valable jusqu'au" : 'Échéance'} : ${esc(dateFR(doc.echeance))}</p>`
    : '';
  const tvaRow = num(doc.tva) > 0 ? `<div><span>TVA (${esc(String(doc.tva))} %)</span><span>${fmt(t.tva)} FCFA</span></div>` : '';
  const words = t.total > 0 ? `${enLettres(Math.round(t.total))} francs CFA` : '';
  return `<div class="inv-paper ${esc(doc.style)}">
    <div class="inv-head">
      <div class="inv-from">${from}</div>
      <div class="inv-title"><h1>${lib(doc).toUpperCase()}</h1><p>N° ${esc(doc.numero)}</p><p>Date : ${esc(dateFR(doc.date))}</p>${limit}</div>
    </div>
    <div class="inv-to"><small>${doc.type === 'devis' ? 'Devis pour' : 'Facturé à'}</small><br>${to}</div>
    <table class="inv-table"><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">Prix unitaire</th><th class="r">Total</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="ph">Ajoutez vos lignes</td></tr>'}</tbody></table>
    <div class="inv-totals">
      ${tvaRow ? `<div><span>Sous-total</span><span>${fmt(t.sub)} FCFA</span></div>${tvaRow}` : ''}
      <div class="big"><span>Total</span><span>${fmt(t.total)} FCFA</span></div>
    </div>
    ${words ? `<p class="inv-words">Arrêté ${doc.type === 'devis' ? 'le présent devis' : 'la présente facture'} à la somme de <strong>${esc(words)}</strong>.</p>` : ''}
    ${doc.paiement.trim() ? `<p class="inv-pay"><strong>Paiement :</strong> ${esc(doc.paiement)}</p>` : ''}
    ${doc.notes.trim() ? `<p class="inv-notes">${esc(doc.notes)}</p>` : ''}
    <div class="inv-sign">Signature et cachet</div>
  </div>`;
}

/* ---------- Version texte (WhatsApp, SMS) ---------- */
export function invoiceText(doc) {
  const t = totals(doc);
  const e = doc.emetteur;
  const c = doc.client;
  const L = [];
  L.push(`${lib(doc).toUpperCase()} N° ${doc.numero}`);
  if (doc.date) L.push(`Date : ${dateFR(doc.date)}`);
  if (doc.echeance) L.push(`${doc.type === 'devis' ? "Valable jusqu'au" : 'Échéance'} : ${dateFR(doc.echeance)}`);
  L.push('');
  const from = [e.nom, e.tel, e.email, e.niu && `NIU ${e.niu}`].filter((x) => x && x.trim());
  if (from.length) L.push(`De : ${from.join(' – ')}`);
  const to = [c.nom, c.tel].filter((x) => x && x.trim());
  if (to.length) L.push(`Pour : ${to.join(' – ')}`);
  L.push('');
  t.lines
    .filter((l) => l.desc.trim() || num(l.pu))
    .forEach((l, i) => L.push(`${i + 1}. ${l.desc.trim() || 'Article'} : ${l.qte} × ${fmt(num(l.pu))} = ${fmt(l.total)} FCFA`));
  L.push('');
  if (num(doc.tva) > 0) {
    L.push(`Sous-total : ${fmt(t.sub)} FCFA`);
    L.push(`TVA (${doc.tva} %) : ${fmt(t.tva)} FCFA`);
  }
  L.push(`TOTAL : ${fmt(t.total)} FCFA`);
  if (t.total > 0) L.push(`Arrêté à la somme de : ${enLettres(Math.round(t.total))} francs CFA`);
  if (doc.paiement.trim()) L.push('', `Paiement : ${doc.paiement.trim()}`);
  if (doc.notes.trim()) L.push('', doc.notes.trim());
  return L.join('\n');
}
