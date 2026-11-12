import './extras.css';
import { LAYOUTS, PROFILES, LETTERS, LETTER_CATS } from './catalog.js';
import { DOCS, DOC_CATS, DOC_NOTE } from './docs-data.js';
import { esc } from './cv.js';
import { logoSVG, logoDataURI } from './logo.js';
import { isNative } from './native.js';
import { locked, showPremium, toast, loadRemote, onPremiumChange } from './premium.js';
import { createTemplateRoom } from './room.js';
import { createInvoiceRoom } from './invoices.js';
import { createCardRoom } from './card.js';
import { createTrackerRoom } from './suivi.js';
import { initHub } from './hub.js';

const $ = (sel, root = document) => root.querySelector(sel);
const NAMES = new Map([...LAYOUTS, ...PROFILES].map((x) => [x.id, x.nom]));

export function initExtras(api) {
  let hub = null;

  /* ----- Logo vectoriel partout ----- */
  document.querySelectorAll('.mark').forEach((m) => (m.innerHTML = logoSVG(30)));
  const fav = document.querySelector('link[rel="icon"]');
  if (fav) fav.href = logoDataURI();

  /* ----- CV : bouton retour à l'accueil ----- */
  const homeBtn = document.createElement('button');
  homeBtn.type = 'button';
  homeBtn.className = 'ghost icon-btn';
  homeBtn.setAttribute('aria-label', "Retour à l'accueil");
  homeBtn.textContent = '←';
  homeBtn.addEventListener('click', () => hub.back());
  const left = document.createElement('div');
  left.className = 'top-left';
  left.append(homeBtn, $('.top .brand'));
  $('.top').prepend(left);
  $('#btn-sample').textContent = 'Exemple';

  /* ----- CV : mises en page ----- */
  const seg = $('#toolbar .seg');
  seg.classList.add('wrap');
  function renderLayouts() {
    seg.innerHTML = LAYOUTS.map((l) => `<button type="button" data-template="${l.id}">${esc(l.nom)}${locked(l.id) ? ' 🔒' : ''}</button>`).join('');
    api.syncToolbar();
  }

  /* ----- CV : modèles par métier ----- */
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h2>Modèle de CV par métier</h2>
    <label class="f"><span>Remplit le CV avec une structure adaptée. Vos informations personnelles sont conservées.</span>
    <select id="profile-select"></select></label>`;
  $('#editor').prepend(card);
  const sel = $('#profile-select', card);

  function renderProfiles() {
    sel.innerHTML =
      '<option value="">Choisir un modèle…</option>' +
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
    if (locked(p.id)) toast('Modèle premium : aperçu gratuit, téléchargement réservé');
  });
  $('#btn-sample').addEventListener('click', () => (sel.value = api.getState().profil || ''));
  $('#btn-reset').addEventListener('click', () => (sel.value = api.getState().profil || ''));

  /* ----- CV : téléchargement ----- */
  $('.sticky-cta').addEventListener(
    'click',
    (e) => {
      if (!e.target.closest('#btn-pdf')) return;
      const s = api.getState();
      const bad = [s.template, s.profil].find((id) => id && locked(id));
      if (bad) {
        e.stopPropagation();
        showPremium(`CV : ${NAMES.get(bad) || bad}`);
      } else if (isNative) {
        e.stopPropagation();
        toast("L'export PDF arrive bientôt dans l'application.");
      }
    },
    true
  );

  /* ----- Les autres salles ----- */
  const getIdentity = () => api.getState().identite;
  const onBack = () => hub.back();
  const modules = {
    lettres: createTemplateRoom({ id: 'lettres', title: 'Lettres et emails', items: LETTERS, cats: LETTER_CATS, sender: true, getIdentity, onBack }),
    documents: createTemplateRoom({ id: 'documents', title: 'Contrats et reçus', items: DOCS, cats: DOC_CATS, sender: false, note: DOC_NOTE, getIdentity, onBack }),
    factures: createInvoiceRoom({ onBack }),
    carte: createCardRoom({ getIdentity, onBack }),
    suivi: createTrackerRoom({ getIdentity, onBack }),
  };

  hub = initHub({
    modules,
    getCvHint: () => {
      const n = (api.getState().identite.nom || '').trim();
      return n ? `Reprendre le CV de ${n}` : null;
    },
  });

  /* ----- Démarrage ----- */
  const refresh = () => {
    renderLayouts();
    renderProfiles();
  };
  onPremiumChange(refresh);
  refresh();
  loadRemote();
}
