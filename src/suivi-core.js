import { todayISO, dateFR } from './invoice-core.js';

/* =====================================================
   Suivi des candidatures : statuts, relances, messages
   ===================================================== */
export const STATUTS = [
  { id: 'a-envoyer', nom: 'À envoyer', tone: '#475569', bg: '#eef1f6' },
  { id: 'envoyee', nom: 'Envoyée', tone: '#1d4ed8', bg: '#e3ecff' },
  { id: 'relancee', nom: 'Relancée', tone: '#b45309', bg: '#fdf0d5' },
  { id: 'entretien', nom: 'Entretien', tone: '#6d28d9', bg: '#efe7fd' },
  { id: 'offre', nom: 'Offre reçue', tone: '#047857', bg: '#dcf5ea' },
  { id: 'refusee', nom: 'Refusée', tone: '#b42318', bg: '#fde6e3' },
];
export const statutOf = (id) => STATUTS.find((s) => s.id === id) || STATUTS[1];

// Délai avant la prochaine relance, selon le statut (en jours)
const DELAIS = { 'a-envoyer': 0, envoyee: 7, relancee: 7, entretien: 3 };
export const hasRelance = (statut) => statut in DELAIS && DELAIS[statut] > 0;

/* ---------- Dates (calcul en UTC pour éviter les décalages d'heure d'été) ---------- */
const ms = (iso) => Date.parse(`${iso}T00:00:00Z`);
export function addDays(iso, n) {
  const d = new Date(ms(iso) + n * 86400000);
  return d.toISOString().slice(0, 10);
}
export const daysDiff = (a, b) => Math.round((ms(b) - ms(a)) / 86400000); // b - a

export function agoLabel(iso, today = todayISO()) {
  if (!iso) return '';
  const n = daysDiff(iso, today);
  if (n <= 0) return "aujourd'hui";
  if (n === 1) return 'hier';
  if (n < 30) return `il y a ${n} jours`;
  const m = Math.floor(n / 30);
  return `il y a ${m} mois`;
}

/* ---------- Une candidature ---------- */
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function blankApp() {
  const t = todayISO();
  return {
    id: uid(),
    entreprise: '',
    poste: '',
    contact: '',
    tel: '',
    email: '',
    lien: '',
    date: t,
    statut: 'envoyee',
    relance: addDays(t, DELAIS.envoyee),
    notes: '',
    histo: [{ date: t, statut: 'envoyee' }],
  };
}

// Change le statut, garde l'historique et recalcule la relance
export function setStatut(app, statut, today = todayISO()) {
  if (app.statut === statut) return app;
  app.statut = statut;
  app.histo = [...(app.histo || []), { date: today, statut }];
  app.relance = hasRelance(statut) ? addDays(today, DELAIS[statut]) : '';
  return app;
}

// État de la relance : { kind: 'late' | 'today' | 'soon', days }
export function dueState(app, today = todayISO()) {
  if (!app.relance || !hasRelance(app.statut)) return null;
  const d = daysDiff(today, app.relance);
  if (d < 0) return { kind: 'late', days: -d };
  if (d === 0) return { kind: 'today', days: 0 };
  return { kind: 'soon', days: d };
}
export const isDue = (app, today = todayISO()) => {
  const s = dueState(app, today);
  return !!s && (s.kind === 'late' || s.kind === 'today');
};

export function dueLabel(s) {
  if (!s) return '';
  if (s.kind === 'late') return `Relance en retard de ${s.days} j`;
  if (s.kind === 'today') return "À relancer aujourd'hui";
  return s.days === 1 ? 'Relance demain' : `Relance dans ${s.days} j`;
}

/* ---------- Statistiques ---------- */
export function stats(list, today = todayISO()) {
  const sent = list.filter((a) => a.statut !== 'a-envoyer');
  const answered = list.filter((a) => ['entretien', 'offre', 'refusee'].includes(a.statut));
  return {
    total: list.length,
    due: list.filter((a) => isDue(a, today)).length,
    entretiens: list.filter((a) => a.statut === 'entretien').length,
    offres: list.filter((a) => a.statut === 'offre').length,
    reponse: sent.length ? Math.round((answered.length / sent.length) * 100) : 0,
    count: (id) => list.filter((a) => a.statut === id).length,
  };
}

// Les plus urgentes d'abord : relances en retard, puis du jour, puis à venir, puis le reste
export function sortApps(list, today = todayISO()) {
  const rank = (a) => {
    const s = dueState(a, today);
    if (s) return s.kind === 'late' ? 0 : s.kind === 'today' ? 1 : 2;
    return a.statut === 'a-envoyer' ? 3 : 4;
  };
  return [...list].sort((x, y) => {
    const r = rank(x) - rank(y);
    if (r) return r;
    const dx = dueState(x, today);
    const dy = dueState(y, today);
    if (dx && dy) return daysDiff(today, x.relance) - daysDiff(today, y.relance);
    return (y.date || '').localeCompare(x.date || '');
  });
}

/* ---------- Messages prêts à envoyer ---------- */
export const MESSAGES = [
  { id: 'relance', nom: 'Relance' },
  { id: 'merci', nom: 'Remerciement' },
  { id: 'retour', nom: 'Demander un retour' },
];

export const defaultMessage = (statut) => (statut === 'entretien' ? 'merci' : 'relance');

export function buildMessage(app, kind, me = {}) {
  const poste = app.poste.trim() || 'proposé';
  const ent = app.entreprise.trim();
  const chez = ent ? ` chez ${ent}` : '';
  const hello = app.contact.trim() ? `Bonjour ${app.contact.trim()},` : 'Bonjour,';
  const sign = ['Cordialement,', (me.nom || '').trim(), (me.tel || '').trim()].filter(Boolean).join('\n');
  const when = app.date ? dateFR(app.date) : '';
  let subject;
  let body;
  if (kind === 'merci') {
    subject = `Merci pour notre entretien : ${poste}`;
    body = `${hello}\n\nJe vous remercie pour le temps que vous m'avez accordé lors de notre entretien pour le poste de ${poste}${chez}. Cet échange a renforcé mon intérêt pour ce poste et pour votre équipe.\n\nJe reste à votre disposition pour tout complément d'information.\n\n${sign}`;
  } else if (kind === 'retour') {
    subject = `Suite à notre entretien : ${poste}`;
    body = `${hello}\n\nSuite à notre entretien pour le poste de ${poste}${chez}, je me permets de vous demander où en est le processus de recrutement.\n\nSi vous avez besoin d'un document ou d'une précision de ma part, je reste disponible.\n\n${sign}`;
  } else {
    subject = `Ma candidature : ${poste}`;
    body = `${hello}\n\nJe me permets de revenir vers vous au sujet de ma candidature au poste de ${poste}${chez}${when ? `, envoyée le ${when}` : ''}.\n\nCette opportunité m'intéresse beaucoup et je reste disponible pour échanger quand vous le souhaitez.\n\nDans l'attente de votre retour, je vous souhaite une bonne journée.\n\n${sign}`;
  }
  return { subject, body };
}

/* ---------- Récapitulatif à partager ---------- */
export function summaryText(list, today = todayISO()) {
  const st = stats(list, today);
  const L = [`Mes candidatures (${st.total})`, `${st.entretiens} entretien(s) · ${st.offres} offre(s) · ${st.due} à relancer`, ''];
  sortApps(list, today).forEach((a) => {
    const due = dueState(a, today);
    L.push(
      `• ${a.entreprise.trim() || 'Entreprise'} – ${a.poste.trim() || 'Poste'} [${statutOf(a.statut).nom}]${a.date ? ` · ${dateFR(a.date)}` : ''}${due ? ` · ${dueLabel(due)}` : ''}`
    );
  });
  return L.join('\n');
}
