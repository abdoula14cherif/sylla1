import './style.css';
import { renderCV, esc, applyDesign } from './cv.js';
import { PAGES } from './design.js';
import { LEVELS } from './i18n.js';
import { emptyState, sampleState, EMPTY_ITEMS } from './sample.js';
import { load, save, clear } from './storage.js';
import { initExtras } from './extras.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function fresh() {
  const base = emptyState();
  const saved = load() || {};
  return { ...base, ...saved, identite: { ...base.identite, ...(saved.identite || {}) }, sections: { ...base.sections, ...(saved.sections || {}) } };
}

let state = fresh();
let saveTimer = null;

/* ---------- Chemins pour les champs simples (identite.nom, resume…) ---------- */
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : ''), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => o[k], obj);
  target[last] = value;
}

/* ---------- Listes (expériences, formations, langues) ---------- */
const field = (list, i, key, label, ph = '') =>
  `<label class="f"><span>${label}</span><input data-list="${list}" data-i="${i}" data-k="${key}" value="${esc(
    state[list][i][key]
  )}" placeholder="${esc(ph)}"></label>`;

function renderLists() {
  $('#list-experiences').innerHTML = state.experiences
    .map(
      (e, i) => `<div class="item-card">
        ${field('experiences', i, 'poste', 'Poste', 'Assistante commerciale')}
        ${field('experiences', i, 'entreprise', 'Entreprise et ville', 'Société Atlantique, Douala')}
        <div class="grid2">
          ${field('experiences', i, 'debut', 'Début', 'Mars 2022')}
          ${field('experiences', i, 'fin', 'Fin', 'Vide si en cours')}
        </div>
        <label class="f"><span>Missions (une par ligne)</span>
          <textarea data-list="experiences" data-i="${i}" data-k="desc">${esc(e.desc)}</textarea></label>
        <button type="button" class="link-btn danger" data-remove="experiences:${i}">Supprimer cette expérience</button>
      </div>`
    )
    .join('');

  $('#list-formations').innerHTML = state.formations
    .map(
      (f, i) => `<div class="item-card">
        ${field('formations', i, 'diplome', 'Diplôme', 'BTS Commerce International')}
        ${field('formations', i, 'ecole', 'École et ville', 'Institut supérieur de Douala')}
        <div class="grid2">
          ${field('formations', i, 'debut', 'Début', '2018')}
          ${field('formations', i, 'fin', 'Fin', '2020')}
        </div>
        <button type="button" class="link-btn danger" data-remove="formations:${i}">Supprimer cette formation</button>
      </div>`
    )
    .join('');

  $('#list-langues').innerHTML = state.langues
    .map(
      (l, i) => `<div class="item-card">
        <div class="grid2">
          ${field('langues', i, 'nom', 'Langue', 'Français')}
          <label class="f"><span>Niveau</span>
            <select data-list="langues" data-i="${i}" data-k="niveau" data-num>
              ${LEVELS.fr.map((n, j) => `<option value="${j}" ${l.niveau === j ? 'selected' : ''}>${n}</option>`).join('')}
            </select></label>
        </div>
        <button type="button" class="link-btn danger" data-remove="langues:${i}">Supprimer cette langue</button>
      </div>`
    )
    .join('');
}

/* ---------- Aperçu : affichage et mise à l'échelle ---------- */
function fit() {
  const stage = $('#stage');
  const avail = stage.clientWidth - 24;
  if (avail <= 0) return; // onglet masqué
  const cv = $('#cv');
  const w = cv.offsetWidth || 794;
  const s = Math.min(1, avail / w);
  cv.style.transform = `scale(${s})`;
  const wrap = $('#cv-wrap');
  wrap.style.width = `${w * s}px`;
  wrap.style.height = `${cv.offsetHeight * s}px`;
  const page = PAGES[state.format] || PAGES.A4;
  $('#pagewarn').hidden = cv.offsetHeight <= page.h + 7;
}

function update() {
  const cv = $('#cv');
  applyDesign(cv, state);
  cv.innerHTML = renderCV(state);
  fit();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => save(state), 400);
}

function syncToolbar() {
  $$('#toolbar button').forEach((b) => {
    const d = b.dataset;
    b.classList.toggle('on', d.template === state.template || d.lang === state.lang || d.accent === state.accent);
  });
}

function syncPhoto() {
  $('#photo-prev').style.backgroundImage = state.photo ? `url(${state.photo})` : '';
  $('#photo-remove').hidden = !state.photo;
}

function syncForm() {
  $$('[data-bind]').forEach((el) => {
    el.value = getPath(state, el.dataset.bind) ?? '';
  });
  renderLists();
  syncToolbar();
  syncPhoto();
  update();
}

/* ---------- Événements ---------- */
$('#editor').addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.bind) {
    setPath(state, t.dataset.bind, t.value);
  } else if (t.dataset.list) {
    state[t.dataset.list][Number(t.dataset.i)][t.dataset.k] = 'num' in t.dataset ? Number(t.value) : t.value;
  } else {
    return;
  }
  update();
});

$('#editor').addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) {
    state[add.dataset.add].push({ ...EMPTY_ITEMS[add.dataset.add] });
    renderLists();
    update();
    return;
  }
  const rm = e.target.closest('[data-remove]');
  if (rm) {
    const [list, i] = rm.dataset.remove.split(':');
    state[list].splice(Number(i), 1);
    if (!state[list].length) state[list].push({ ...EMPTY_ITEMS[list] });
    renderLists();
    update();
  }
});

$('#toolbar').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.template) state.template = b.dataset.template;
  if (b.dataset.lang) state.lang = b.dataset.lang;
  if (b.dataset.accent) state.accent = b.dataset.accent;
  syncToolbar();
  update();
});

function setTab(tab) {
  $('.layout').dataset.tab = tab;
  $$('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  window.scrollTo(0, 0);
  requestAnimationFrame(fit);
}
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) setTab(b.dataset.tab);
});

/* Photo : recadrée en carré et réduite pour rester légère */
$('#photo-input').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const size = 360;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const m = Math.min(img.width, img.height);
      canvas.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
      state.photo = canvas.toDataURL('image/jpeg', 0.85);
      syncPhoto();
      update();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});
$('#photo-remove').addEventListener('click', () => {
  state.photo = '';
  syncPhoto();
  update();
});

$('#btn-sample').addEventListener('click', () => {
  state = sampleState();
  syncForm();
});
$('#btn-reset').addEventListener('click', () => {
  if (!confirm('Effacer tout le contenu du CV ?')) return;
  state = emptyState();
  clear();
  syncForm();
});

new ResizeObserver(fit).observe($('#stage'));
window.addEventListener('resize', fit);

syncForm();
initExtras({ getState: () => state, syncForm, syncToolbar, update });
