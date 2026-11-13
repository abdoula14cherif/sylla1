import './extras.css';
import { LAYOUTS, PROFILES, LETTERS, LETTER_CATS } from './catalog.js';
import { DOCS, DOC_CATS, DOC_NOTE } from './docs-data.js';
import { PALETTE, FONTS, SIZES, PAGES, isHex } from './design.js';
import { esc, renderCV, applyDesign } from './cv.js';
import { logoSVG, logoDataURI } from './logo.js';
import { isNative } from './native.js';
import { exportDocument, printPage } from './pdf.js';
import { locked, showPremium, toast, loadRemote, onPremiumChange } from './premium.js';
import { createTemplateRoom } from './room.js';
import { createInvoiceRoom } from './invoices.js';
import { createStampRoom } from './stamp.js';
import { createCardRoom } from './card.js';
import { createTrackerRoom } from './suivi.js';
import { createAfficheRoom } from './affiche.js';
import { createPostsRoom } from './posts.js';
import { initHub } from './hub.js';

const $ = (sel, root = document) => root.querySelector(sel);
const NAMES = new Map([...LAYOUTS, ...PROFILES].map((x) => [x.id, x.nom]));
const SEC_LABELS = [
  ['profil', 'Profil'],
  ['experiences', 'Expériences'],
  ['formations', 'Formations'],
  ['competences', 'Compétences'],
  ['langues', 'Langues'],
  ['loisirs', 'Centres d’intérêt'],
  ['extra', 'Rubrique perso'],
];

export function initExtras(api) {
  let hub = null;

  /* ----- Logo vectoriel partout ----- */
  document.querySelectorAll('.mark').forEach((m) => (m.innerHTML = logoSVG(30)));
  let fav = document.querySelector('link[rel="icon"]');
  if (!fav) {
    fav = document.createElement('link');
    fav.rel = 'icon';
    document.head.appendChild(fav);
  }
  fav.href = logoDataURI();

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
  $('#pagewarn').textContent = 'Votre CV dépasse une page : il sera sur 2 pages dans le PDF. Raccourcissez ou masquez une rubrique.';

  /* ----- CV : mises en page ----- */
  const seg = $('#toolbar .seg');
  seg.classList.add('wrap');
  function renderLayouts() {
    seg.innerHTML = LAYOUTS.map((l) => `<button type="button" data-template="${l.id}">${esc(l.nom)}${locked(l.id) ? ' 🔒' : ''}</button>`).join('');
    api.syncToolbar();
  }

  /* ----- CV : couleurs (palette + couleur libre) ----- */
  const sw = $('#toolbar .sw');
  sw.classList.add('sw-big');
  sw.innerHTML =
    PALETTE.map((c) => `<button type="button" data-accent="${c}" style="background:${c}" aria-label="${c}"></button>`).join('') +
    `<label class="color-custom" title="Couleur personnalisée"><input type="color" id="accent-custom" value="#14213D"></label>`;
  const custom = $('#accent-custom');
  custom.addEventListener('input', () => {
    api.getState().accent = custom.value;
    api.syncToolbar();
    api.update();
    refreshDesign();
  });

  /* ----- CV : panneau « Personnaliser » ----- */
  const panel = document.createElement('details');
  panel.className = 'design';
  panel.open = false;
  const segHTML = (attr, list) => list.map((x) => `<button type="button" ${attr}="${x.id}">${esc(x.nom)}</button>`).join('');
  panel.innerHTML = `<summary>Personnaliser</summary>
    <div class="dz">
      <p class="hint">Format de page</p><div class="seg" id="cv-format">${segHTML('data-fmt', [PAGES.A4, PAGES.Letter])}</div>
      <p class="hint">Police</p><div class="seg wrap" id="cv-font">${segHTML('data-font', FONTS)}</div>
      <p class="hint">Taille du texte</p><div class="seg" id="cv-size">${segHTML('data-size', SIZES)}</div>
      <p class="hint">Photo</p><div class="seg" id="cv-photo">${segHTML('data-photo', [{ id: 'rond', nom: 'Ronde' }, { id: 'carre', nom: 'Carrée' }, { id: 'aucune', nom: 'Aucune' }])}</div>
      <p class="hint">Rubriques à afficher</p>
      <div class="chk-grid" id="cv-secs">${SEC_LABELS.map(([k, n]) => `<label class="chk"><input type="checkbox" data-sec="${k}"> ${esc(n)}</label>`).join('')}</div>
    </div>`;
  $('#toolbar').appendChild(panel);

  function refreshDesign() {
    const s = api.getState();
    const on = (sel, attr, val) => panel.querySelectorAll(sel).forEach((b) => b.classList.toggle('on', b.getAttribute(attr) === val));
    on('[data-fmt]', 'data-fmt', s.format || 'A4');
    on('[data-font]', 'data-font', s.police || 'auto');
    on('[data-size]', 'data-size', s.taille || 'normal');
    on('[data-photo]', 'data-photo', s.photoForme || 'rond');
    panel.querySelectorAll('[data-sec]').forEach((c) => (c.checked = s.sections[c.dataset.sec] !== false));
    const inPalette = PALETTE.some((c) => c.toLowerCase() === String(s.accent).toLowerCase());
    $('.color-custom', sw).classList.toggle('on', !inPalette);
    if (isHex(s.accent)) custom.value = s.accent;
  }
  panel.addEventListener('click', (e) => {
    const s = api.getState();
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.fmt) s.format = b.dataset.fmt;
    else if (b.dataset.font) s.police = b.dataset.font;
    else if (b.dataset.size) s.taille = b.dataset.size;
    else if (b.dataset.photo) s.photoForme = b.dataset.photo;
    else return;
    api.update();
    refreshDesign();
  });
  panel.addEventListener('change', (e) => {
    if (!e.target.dataset.sec) return;
    api.getState().sections[e.target.dataset.sec] = e.target.checked;
    api.update();
  });
  $('#toolbar').addEventListener('click', (e) => {
    if (!e.target.closest('.design')) refreshDesign();
  });

  /* ----- CV : rubrique personnalisée (dans l'onglet Remplir) ----- */
  const extra = document.createElement('div');
  extra.className = 'card';
  extra.innerHTML = `<h2>Rubrique personnalisée</h2>
    <label class="f"><span>Titre de la rubrique</span><input data-bind="extraTitre" placeholder="Permis, certifications, projets…"></label>
    <label class="f"><span>Contenu (une ligne par élément)</span><textarea data-bind="extraTexte" placeholder="Permis B&#10;Certificat Excel avancé"></textarea></label>`;
  $('#editor').appendChild(extra);

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
    refreshDesign();
    if (locked(p.id)) toast('Modèle premium : aperçu gratuit, téléchargement réservé');
  });
  const resync = () => {
    sel.value = api.getState().profil || '';
    refreshDesign();
  };
  $('#btn-sample').addEventListener('click', resync);
  $('#btn-reset').addEventListener('click', resync);

  /* ----- CV : téléchargement et impression ----- */
  const pdfBtn = $('#btn-pdf');
  pdfBtn.textContent = isNative ? 'Partager le PDF' : 'Télécharger le PDF';
  const row = document.createElement('div');
  row.className = 'cta-row';
  if (!isNative) {
    const pb = document.createElement('button');
    pb.type = 'button';
    pb.id = 'btn-print';
    pb.className = 'btn2';
    pb.textContent = 'Imprimer';
    row.appendChild(pb);
  }
  row.appendChild(pdfBtn);
  $('.sticky-cta').appendChild(row);

  let busy = false;
  async function exportCV() {
    if (busy) return;
    busy = true;
    toast('Création du PDF…');
    const s = api.getState();
    const nom = (s.identite.nom || '').trim();
    try {
      const r = await exportDocument({
        fmt: s.format,
        filename: `CV-${nom.replace(/[^\w-]+/g, '-') || 'Digiform'}.pdf`,
        title: nom ? `CV ${nom}` : 'CV',
        build: (stage) => {
          const cv = document.createElement('div');
          applyDesign(cv, s);
          cv.innerHTML = renderCV(s);
          cv.style.position = 'relative';
          cv.style.transform = 'none';
          cv.style.boxShadow = 'none';
          stage.appendChild(cv);
          return cv;
        },
      });
      if (r === 'downloaded') toast('PDF téléchargé');
      if (r === 'failed') toast('Partage impossible');
    } catch {
      toast('Création du PDF impossible');
    } finally {
      busy = false;
    }
  }
  $('.sticky-cta').addEventListener(
    'click',
    (e) => {
      const isPdf = e.target.closest('#btn-pdf');
      const isPrint = e.target.closest('#btn-print');
      if (!isPdf && !isPrint) return;
      e.stopPropagation();
      const s = api.getState();
      const bad = [s.template, s.profil].find((id) => id && locked(id));
      if (bad) return showPremium(`CV : ${NAMES.get(bad) || bad}`);
      if (isPdf) exportCV();
      else printPage(s.format);
    },
    true
  );

  /* ----- Les autres salles ----- */
  const getIdentity = () => api.getState().identite;
  const onBack = () => hub.back();
  const modules = {
    lettres: createTemplateRoom({ id: 'lettres', title: 'Lettres et emails', items: LETTERS, cats: LETTER_CATS, sender: true, getIdentity, onBack }),
    documents: createTemplateRoom({ id: 'documents', title: 'Contrats et reçus', items: DOCS, cats: DOC_CATS, sender: false, note: DOC_NOTE, getIdentity, onBack }),
    factures: createInvoiceRoom({ onBack, goStamp: () => hub.go('cachet') }),
    cachet: createStampRoom({ onBack }),
    carte: createCardRoom({ getIdentity, onBack }),
    suivi: createTrackerRoom({ getIdentity, onBack }),
    affiches: createAfficheRoom({ onBack }),
    posts: createPostsRoom({ getIdentity, onBack }),
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
  api.syncForm();
  refreshDesign();
  loadRemote();
}
