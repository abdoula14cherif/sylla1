import { CONFIG } from './config.js';
import { LAYOUTS, PROFILES, LETTERS } from './catalog.js';
import { DOCS } from './docs-data.js';
import { INVOICE_STYLES } from './invoice-core.js';
import { CARD_DESIGNS } from './card-core.js';
import { AFFICHE_DESIGNS } from './affiche-core.js';
import { esc } from './cv.js';
import { logoSVG } from './logo.js';
import { copyText } from './native.js';
import { locked, getPremiumIds, getUnlockAll, onPremiumChange, showPremium, showSoon, toast } from './premium.js';

const $ = (s, r = document) => r.querySelector(s);

/* ---------- Icônes vectorielles ---------- */
const ICONS = {
  cv: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><circle cx="12" cy="12" r="2"/><path d="M9 18c.6-2.4 5.4-2.4 6 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 16h5"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16c.4-1.6 4.6-1.6 5 0M14 10h4M14 13h3"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* ---------- Les salles (cartes de l'accueil) ---------- */
const ROOMS = [
  { id: 'cv', salle: 'salle-cv', titre: 'CV', icon: 'cv', tone: 'navy', wide: true, desc: () => `${PROFILES.length} modèles par métier, ${LAYOUTS.length} mises en page` },
  { id: 'lettres', salle: 'salle-lettres', titre: 'Lettres et emails', icon: 'mail', tone: 'teal', desc: () => `${LETTERS.length} modèles à remplir` },
  { id: 'documents', salle: 'salle-documents', titre: 'Contrats et reçus', icon: 'doc', tone: 'slate', desc: () => `${DOCS.length} modèles prêts à signer` },
  { id: 'factures', salle: 'salle-factures', titre: 'Factures et devis', icon: 'receipt', tone: 'gold', desc: () => 'Total en lettres, partage WhatsApp' },
  { id: 'affiches', salle: 'salle-affiches', titre: 'Affiches', icon: 'image', tone: 'orange', desc: () => `${AFFICHE_DESIGNS.length} modèles : A4, statut WhatsApp, carré` },
  { id: 'posts', titre: 'Posts avec IA', icon: 'spark', soon: true, desc: 'Une semaine de publications en un clic' },
  { id: 'carte', salle: 'salle-carte', titre: 'Carte de visite', icon: 'card', tone: 'rose', desc: () => `${CARD_DESIGNS.length} modèles, QR code et contact en un scan` },
  { id: 'suivi', salle: 'salle-suivi', titre: 'Suivi des candidatures', icon: 'list', tone: 'indigo', desc: () => 'Relances et réponses au même endroit' },
];
const descOf = (r) => (typeof r.desc === 'function' ? r.desc() : r.desc);
const TOTAL_MODELS = LAYOUTS.length + PROFILES.length + LETTERS.length + DOCS.length + INVOICE_STYLES.length + CARD_DESIGNS.length + AFFICHE_DESIGNS.length;

/* ---------- Groupes de l'écran admin ---------- */
const adminGroups = () => [
  { titre: 'Salles (écrans entiers)', items: ROOMS.filter((r) => r.salle).map((r) => ({ id: r.salle, nom: r.titre })) },
  { titre: 'CV : mises en page', items: LAYOUTS.map((x) => ({ id: x.id, nom: x.nom })) },
  { titre: 'CV par métier', items: PROFILES.map((x) => ({ id: x.id, nom: x.nom })) },
  { titre: 'Lettres et emails', items: LETTERS.map((x) => ({ id: x.id, nom: x.titre })) },
  { titre: 'Contrats et reçus', items: DOCS.map((x) => ({ id: x.id, nom: x.titre })) },
  { titre: 'Factures : styles', items: INVOICE_STYLES.map((x) => ({ id: x.id, nom: x.nom })) },
  { titre: 'Carte de visite : modèles', items: CARD_DESIGNS.map((x) => ({ id: x.id, nom: x.nom })) },
  { titre: 'Affiches : modèles', items: AFFICHE_DESIGNS.map((x) => ({ id: x.id, nom: x.nom })) },
];

export function initHub({ modules, getCvHint }) {
  /* ----- Accueil ----- */
  const home = document.createElement('div');
  home.id = 'home';
  home.className = 'home';
  home.hidden = true;
  const hour = new Date().getHours();
  home.innerHTML = `
    <header class="home-head">
      <div class="home-brand" id="home-brand">${logoSVG(36, true)}<span>Digiform</span></div>
      <h1>${hour < 18 ? 'Bonjour' : 'Bonsoir'},<br>que voulez-vous créer ?</h1>
      <p>Vos documents pro, prêts en quelques minutes.</p>
      <div class="home-chips"><span>${TOTAL_MODELS} modèles</span><span>Données sur votre téléphone</span></div>
    </header>
    <main class="home-grid" id="home-grid"></main>
    <p class="home-foot">Digiform</p>`;
  document.body.appendChild(home);

  const hintOf = (r) => {
    const h = r.id === 'cv' ? getCvHint() : modules[r.id] && modules[r.id].hint ? modules[r.id].hint() : null;
    return h || descOf(r);
  };

  function renderCards() {
    $('#home-grid').innerHTML = ROOMS.map((r, i) => {
      const lock = r.salle && locked(r.salle);
      const tag = r.soon ? '<span class="pill soon">Bientôt</span>' : lock ? '<span class="pill lock">Premium</span>' : '';
      return `<button type="button" class="rcard tone-${r.tone || 'soon'}${r.wide ? ' wide' : ''}${r.soon ? ' soon-card' : ''}" style="--i:${i}" data-room="${r.id}">
        <span class="ic">${icon(r.icon)}</span>
        <span class="ct"><strong>${esc(r.titre)}</strong><small>${esc(hintOf(r))}</small></span>${tag}
      </button>`;
    }).join('');
  }

  $('#home-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-room]');
    if (!b) return;
    const r = ROOMS.find((x) => x.id === b.dataset.room);
    if (r.soon) return showSoon(r.titre, r.desc);
    if (r.salle && locked(r.salle)) return showPremium(r.titre);
    go(r.id);
  });

  /* ----- Écran admin (génère le fichier premium.json) ----- */
  const admin = document.createElement('div');
  admin.id = 'admin';
  admin.className = 'overlay';
  admin.hidden = true;
  admin.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>Réglages admin</strong></div>
    <div class="ov-body">
      <p class="doc-note">Activez « Premium » sur ce que vous voulez verrouiller. Copiez ensuite le fichier, ouvrez GitHub, collez-le à la place du contenu de <b>premium.json</b> puis enregistrez (Commit). Les téléphones le lisent au lancement de l'app.</p>
      <div data-r="groups"></div>
      <div class="card">
        <label class="adm-row nob"><span>Tout débloquer (promotion)</span><input type="checkbox" class="sw-toggle" data-unlock></label>
        <div class="adm-actions">
          <button type="button" class="btn2" data-act="free">Tout gratuit</button>
          <button type="button" class="btn2" data-act="all">Tout premium</button>
        </div>
        <pre class="adm-json" data-r="json"></pre>
        <button type="button" class="primary" data-act="copy">Copier le fichier</button>
        <a class="btn2 linkbtn" href="${esc(CONFIG.adminEditUrl)}" target="_blank" rel="noopener">Ouvrir premium.json sur GitHub</a>
      </div>
    </div>`;
  document.body.appendChild(admin);
  let draft = new Set();
  let draftUnlock = false;
  const jsonText = () => JSON.stringify({ premium: [...draft], unlockAll: draftUnlock }, null, 2);

  function renderAdmin() {
    $('[data-r="groups"]', admin).innerHTML = adminGroups()
      .map(
        (g) => `<details class="adm-group"><summary>${esc(g.titre)} <small>${g.items.filter((x) => draft.has(x.id)).length}/${g.items.length} premium</small></summary>
          ${g.items.map((x) => `<label class="adm-row"><span>${esc(x.nom)}</span><input type="checkbox" class="sw-toggle" data-id="${esc(x.id)}"${draft.has(x.id) ? ' checked' : ''}></label>`).join('')}
        </details>`
      )
      .join('');
    $('[data-unlock]', admin).checked = draftUnlock;
    $('[data-r="json"]', admin).textContent = jsonText();
  }
  function refreshAdminCounts() {
    admin.querySelectorAll('.adm-group').forEach((d, i) => {
      d.querySelector('summary small').textContent = `${adminGroups()[i].items.filter((x) => draft.has(x.id)).length}/${adminGroups()[i].items.length} premium`;
    });
    $('[data-r="json"]', admin).textContent = jsonText();
  }
  admin.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.id) t.checked ? draft.add(t.dataset.id) : draft.delete(t.dataset.id);
    else if ('unlock' in t.dataset) draftUnlock = t.checked;
    else return;
    refreshAdminCounts();
  });
  admin.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'back') return back();
    if (act === 'free') {
      draft = new Set();
      renderAdmin();
    }
    if (act === 'all') {
      draft = new Set(adminGroups().flatMap((g) => g.items.map((x) => x.id)));
      renderAdmin();
    }
    if (act === 'copy') toast((await copyText(jsonText())) ? 'Fichier copié. Collez-le sur GitHub.' : 'Copie impossible');
  });

  /* ----- Navigation (l'historique gère le bouton retour d'Android) ----- */
  let pushed = false;
  let last = null;
  const route = () => location.hash.replace(/^#\/?/, '') || 'home';
  function go(r) {
    pushed = true;
    location.hash = `#/${r}`;
  }
  function back() {
    if (pushed) {
      pushed = false;
      history.back();
    } else {
      location.replace('#/');
    }
  }
  function render() {
    let r = route();
    const room = ROOMS.find((x) => x.id === r);
    const ok = r === 'home' || r === 'admin' || (room && !room.soon && !(room.salle && locked(room.salle)));
    if (!ok) {
      r = 'home';
      history.replaceState(null, '', '#/');
    }
    document.body.dataset.room = r;
    home.hidden = r !== 'home';
    admin.hidden = r !== 'admin';
    Object.entries(modules).forEach(([id, m]) => {
      m.el.hidden = id !== r;
      if (id === r && last !== r && m.onShow) m.onShow();
    });
    if (r === 'admin' && last !== 'admin') {
      draft = new Set(getPremiumIds());
      draftUnlock = getUnlockAll();
      renderAdmin();
    }
    if (r === 'home') renderCards();
    if (last !== r) window.scrollTo(0, 0);
    last = r;
  }
  window.addEventListener('hashchange', render);
  onPremiumChange(() => {
    if (route() === 'home' || last === 'home') renderCards();
    Object.values(modules).forEach((m) => m.refresh && m.refresh());
    render();
  });

  // 5 appuis rapides sur le logo = écran admin
  let taps = 0;
  let timer;
  $('#home-brand').addEventListener('click', () => {
    taps += 1;
    clearTimeout(timer);
    timer = setTimeout(() => (taps = 0), 1500);
    if (taps >= 5) {
      taps = 0;
      go('admin');
    }
  });

  render();
  return { go, back, render };
}
