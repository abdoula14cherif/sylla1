import './extras.css';
import { CONFIG } from './config.js';
import { LAYOUTS, PROFILES, LETTERS, LETTER_CATS } from './catalog.js';
import { esc } from './cv.js';
import { SENDER, labelsOf, defaults, buildDoc } from './letters-core.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

/* ---------- Premium : réglages d'origine + fichier premium.json de l'admin ---------- */
const ALL = [...LAYOUTS, ...PROFILES, ...LETTERS];
let premium = new Set(ALL.filter((x) => x.premium).map((x) => x.id));
let unlockAll = CONFIG.unlockAll;
const locked = (id) => !unlockAll && premium.has(id);
const nameOf = (id) => {
  const x = ALL.find((y) => y.id === id);
  return x ? x.nom || x.titre : id;
};

async function loadRemote() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${CONFIG.premiumUrl}?t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = await res.json();
    if (Array.isArray(data.premium)) premium = new Set(data.premium);
    unlockAll = CONFIG.unlockAll || data.unlockAll === true;
    return true;
  } catch {
    return false; // hors ligne ou fichier absent : on garde les réglages d'origine
  }
}

/* ---------- Petits outils d'interface ---------- */
function toast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

function showPremium(label) {
  let m = $('#premium-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'premium-modal';
    m.className = 'modal';
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target.closest('[data-close]')) m.hidden = true;
    });
    document.body.appendChild(m);
  }
  const msg = encodeURIComponent(`Bonjour, je veux débloquer le modèle premium « ${label} » sur Digiform.`);
  m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">
      <h3>Modèle premium</h3>
      <p>« ${esc(label)} » fait partie des modèles premium. Contactez l'administrateur pour le débloquer et pouvoir le télécharger.</p>
      <a class="primary" href="https://wa.me/${CONFIG.adminWhatsapp}?text=${msg}" target="_blank" rel="noopener">Demander sur WhatsApp</a>
      <button type="button" class="link-btn" data-close>Fermer</button>
    </div>`;
  m.hidden = false;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/* ================== Initialisation ================== */
export function initExtras(api) {
  /* ----- 1. Modèles de mise en page (boutons) ----- */
  const seg = $('#toolbar .seg');
  seg.classList.add('wrap');
  function renderLayouts() {
    seg.innerHTML = LAYOUTS.map(
      (l) => `<button type="button" data-template="${l.id}">${esc(l.nom)}${locked(l.id) ? ' 🔒' : ''}</button>`
    ).join('');
    api.syncToolbar();
  }

  /* ----- 2. Modèles de CV par métier ----- */
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Modèle de CV par métier</h2>
    <label class="f"><span>Remplit le CV avec une structure adaptée. Vos informations personnelles sont conservées.</span>
    <select id="profile-select"></select></label>`;
  $('#editor').prepend(card);
  const sel = $('#profile-select', card);

  function renderProfiles() {
    sel.innerHTML =
      `<option value="">Choisir un modèle…</option>` +
      PROFILES.map((p) => `<option value="${p.id}">${esc(p.nom)}${locked(p.id) ? ' 🔒' : ''}</option>`).join('');
    sel.value = api.getState().profil || '';
  }

  sel.addEventListener('change', () => {
    const p = PROFILES.find((x) => x.id === sel.value);
    const s = api.getState();
    if (!p) return;
    const filled = s.resume.trim() || s.competences.trim() || s.experiences.some((e) => e.poste.trim() || e.desc.trim());
    if (filled && !confirm('Remplacer le contenu actuel du CV par ce modèle ? Vos informations personnelles sont conservées.')) {
      sel.value = s.profil || '';
      return;
    }
    Object.assign(s, {
      profil: p.id,
      template: p.template,
      accent: p.accent,
      resume: p.resume,
      competences: p.competences,
      experiences: p.experiences.map((e) => ({ ...e })),
      formations: p.formations.map((f) => ({ ...f })),
    });
    if (!s.identite.titre.trim()) s.identite.titre = p.titre;
    api.syncForm();
    sel.value = p.id;
    renderLayouts();
    if (locked(p.id)) toast('Modèle premium : aperçu gratuit, téléchargement réservé 🔒');
  });
  $('#btn-sample').addEventListener('click', () => (sel.value = api.getState().profil || ''));
  $('#btn-reset').addEventListener('click', () => (sel.value = api.getState().profil || ''));

  /* ----- 3. Téléchargement du CV : vérifier le premium ----- */
  $('.sticky-cta').addEventListener(
    'click',
    (e) => {
      if (!e.target.closest('#btn-pdf')) return;
      const s = api.getState();
      const bad = [s.template, s.profil].find((id) => id && locked(id));
      if (bad) {
        e.stopPropagation();
        showPremium(nameOf(bad));
      } else if (isNative) {
        e.stopPropagation();
        toast("L'export PDF arrive bientôt dans l'application.");
      }
    },
    true
  );

  /* ----- 4. Lettres et emails ----- */
  $('#btn-sample').textContent = 'Exemple';
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'ghost';
  open.textContent = 'Lettres';
  $('.top-actions').prepend(open);

  const ov = document.createElement('div');
  ov.id = 'letters';
  ov.className = 'overlay';
  ov.hidden = true;
  ov.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" id="ltr-back">← Retour</button><strong>Lettres et emails</strong></div>
    <div class="ov-body">
      <div id="ltr-list"></div>
      <div id="ltr-detail" hidden>
        <div class="card"><h2 id="ltr-name"></h2><div id="ltr-fields"></div></div>
        <div class="ltr-actions">
          <button type="button" class="primary" id="ltr-copy">Copier le texte</button>
          <button type="button" class="btn2" id="ltr-share">Partager</button>
          <button type="button" class="btn2" id="ltr-print">Imprimer ou PDF</button>
        </div>
        <div class="letter-paper" id="ltr-paper"></div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  if (isNative) $('#ltr-print').hidden = true;

  let cat = 'all';
  let cur = null;
  let vals = {};

  function renderList() {
    const chips = [{ id: 'all', nom: 'Tous' }, ...LETTER_CATS]
      .map((c) => `<button type="button" class="chip${cat === c.id ? ' on' : ''}" data-cat="${c.id}">${esc(c.nom)}</button>`)
      .join('');
    const items = LETTERS.filter((l) => cat === 'all' || l.cat === cat)
      .map(
        (l) =>
          `<button type="button" class="ltr-item" data-id="${l.id}"><span>${esc(l.titre)}</span>${
            locked(l.id) ? '<em>🔒 Premium</em>' : ''
          }</button>`
      )
      .join('');
    $('#ltr-list').innerHTML = `<div class="chips-row">${chips}</div><div class="ltr-items">${items}</div>`;
  }

  function renderPaper() {
    $('#ltr-paper').innerHTML = buildDoc(cur, vals, true);
  }

  function openLetter(l) {
    cur = l;
    const d = defaults(api.getState().identite);
    SENDER.forEach((k) => {
      if (!(vals[k] || '').trim()) vals[k] = d[k];
    });
    const content = labelsOf(l).filter((k) => !SENDER.includes(k));
    const input = (k, long) =>
      long
        ? `<label class="f"><span>${esc(k)}</span><textarea rows="2" data-ph="${esc(k)}">${esc(vals[k] || '')}</textarea></label>`
        : `<label class="f"><span>${esc(k)}</span><input data-ph="${esc(k)}" value="${esc(vals[k] || '')}"></label>`;
    $('#ltr-name').textContent = l.titre;
    $('#ltr-fields').innerHTML =
      `<p class="hint"><strong>Vos coordonnées</strong></p>` +
      SENDER.map((k) => input(k, false)).join('') +
      (content.length ? `<p class="hint"><strong>Le contenu</strong></p>` + content.map((k) => input(k, true)).join('') : '');
    $('#ltr-list').hidden = true;
    $('#ltr-detail').hidden = false;
    renderPaper();
    $('.ov-body', ov).scrollTop = 0;
  }

  function backToList() {
    cur = null;
    $('#ltr-detail').hidden = true;
    $('#ltr-list').hidden = false;
    renderList();
  }

  open.addEventListener('click', () => {
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    backToList();
  });
  $('#ltr-back').addEventListener('click', () => {
    if (cur) {
      backToList();
    } else {
      ov.hidden = true;
      document.body.style.overflow = '';
    }
  });

  ov.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cat]');
    if (c) {
      cat = c.dataset.cat;
      renderList();
      return;
    }
    const it = e.target.closest('[data-id]');
    if (it) openLetter(LETTERS.find((l) => l.id === it.dataset.id));
  });

  ov.addEventListener('input', (e) => {
    const k = e.target.dataset.ph;
    if (k === undefined || !cur) return;
    vals[k] = e.target.value;
    renderPaper();
  });

  const gate = () => {
    if (cur && locked(cur.id)) {
      showPremium(cur.titre);
      return false;
    }
    return !!cur;
  };

  $('#ltr-copy').addEventListener('click', async () => {
    if (!gate()) return;
    toast((await copyText(buildDoc(cur, vals, false))) ? 'Texte copié' : 'Copie impossible');
  });
  $('#ltr-share').addEventListener('click', async () => {
    if (!gate()) return;
    const text = buildDoc(cur, vals, false);
    if (navigator.share) {
      navigator.share({ title: cur.titre, text }).catch(() => {});
    } else {
      toast((await copyText(text)) ? 'Texte copié' : 'Partage impossible');
    }
  });
  $('#ltr-print').addEventListener('click', () => {
    if (!gate()) return;
    document.body.dataset.print = 'letter';
    window.print();
  });
  window.addEventListener('afterprint', () => delete document.body.dataset.print);

  /* ----- Démarrage ----- */
  const refresh = () => {
    renderLayouts();
    renderProfiles();
    if (!ov.hidden && !cur) renderList();
  };
  refresh();
  loadRemote().then((ok) => ok && refresh());
}