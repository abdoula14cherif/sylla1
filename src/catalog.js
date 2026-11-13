import { LABELS, LEVELS } from './i18n.js';
import { FONT_STACKS, SIZES, PAGES } from './design.js';

// Filigrane "Créé avec Digiform" : passer à true pour la version gratuite
export const WATERMARK = false;

export const DEFAULT_SECTIONS = { profil: true, experiences: true, formations: true, competences: true, langues: true, loisirs: true, extra: true };

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const has = (s) => typeof s === 'string' && s.trim().length > 0;
const nl = (s) => esc(s).replace(/\n/g, '<br>');

function period(start, end, L) {
  const a = (start || '').trim();
  const b = (end || '').trim();
  if (!a && !b) return '';
  if (!a) return esc(b);
  return `${esc(a)} – ${esc(b || L.present)}`;
}

function bullets(text) {
  const lines = (text || '')
    .split('\n')
    .map((l) => l.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
  if (!lines.length) return '';
  return `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
}

function experienceBlock(list, L) {
  const items = list.filter((e) => has(e.poste) || has(e.entreprise) || has(e.desc));
  if (!items.length) return '';
  return `<section class="blk"><h2>${L.experience}</h2>${items
    .map(
      (e) => `<article class="item">
        <div class="row"><h3>${esc(e.poste)}</h3><span class="when">${period(e.debut, e.fin, L)}</span></div>
        ${has(e.entreprise) ? `<div class="org">${esc(e.entreprise)}</div>` : ''}
        ${bullets(e.desc)}
      </article>`
    )
    .join('')}</section>`;
}

function educationBlock(list, L) {
  const items = list.filter((f) => has(f.diplome) || has(f.ecole));
  if (!items.length) return '';
  return `<section class="blk"><h2>${L.education}</h2>${items
    .map(
      (f) => `<article class="item">
        <div class="row"><h3>${esc(f.diplome)}</h3><span class="when">${period(f.debut, f.fin, { present: '' }).replace(/ – $/, '')}</span></div>
        ${has(f.ecole) ? `<div class="org">${esc(f.ecole)}</div>` : ''}
      </article>`
    )
    .join('')}</section>`;
}

// Applique le style choisi (couleur, police, taille, format de page) à la feuille
export function applyDesign(cv, s) {
  const page = PAGES[s.format] || PAGES.A4;
  cv.className = `cv tpl-${s.template} ph-${s.photoForme || 'rond'}${WATERMARK ? ' wm' : ''}`;
  cv.style.setProperty('--accent', s.accent);
  cv.style.width = `${page.w}px`;
  cv.style.minHeight = `${page.h}px`;
  const size = SIZES.find((x) => x.id === s.taille) || SIZES[1];
  cv.style.fontSize = `${size.px}px`;
  cv.style.fontFamily = FONT_STACKS[s.police] || '';
}

export function renderCV(s) {
  const L = LABELS[s.lang] || LABELS.fr;
  const id = s.identite;
  const sec = { ...DEFAULT_SECTIONS, ...(s.sections || {}) };
  const skills = (s.competences || '').split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
  const langs = s.langues.filter((l) => has(l.nom));
  const contact = [id.tel, id.email, id.ville, id.lien].filter(has).map((c) => `<span>${esc(c)}</span>`);

  const name = has(id.nom) ? esc(id.nom) : `<span class="ph">${L.yourName}</span>`;
  const title = has(id.titre) ? esc(id.titre) : `<span class="ph">${L.yourTitle}</span>`;
  const photo = s.photo && s.photoForme !== 'aucune' ? `<img class="photo" alt="" src="${s.photo}">` : '';

  const profile = sec.profil && has(s.resume) ? `<section class="blk"><h2>${L.profile}</h2><p>${nl(s.resume)}</p></section>` : '';
  const skillsHtml =
    sec.competences && skills.length
      ? `<section class="blk"><h2>${L.skills}</h2><ul class="chips">${skills.map((k) => `<li>${esc(k)}</li>`).join('')}</ul></section>`
      : '';
  const langsHtml =
    sec.langues && langs.length
      ? `<section class="blk"><h2>${L.languages}</h2><ul class="langs">${langs
          .map((l) => `<li><span>${esc(l.nom)}</span><em>${LEVELS[s.lang][l.niveau] ?? ''}</em></li>`)
          .join('')}</ul></section>`
      : '';
  const interestsHtml = sec.loisirs && has(s.loisirs) ? `<section class="blk"><h2>${L.interests}</h2><p>${esc(s.loisirs)}</p></section>` : '';
  const extraTitle = has(s.extraTitre) ? esc(s.extraTitre) : s.lang === 'en' ? 'Additional information' : 'Informations complémentaires';
  const extraLines = (s.extraTexte || '').split('\n').filter((l) => l.trim());
  const extra =
    sec.extra && extraLines.length
      ? `<section class="blk"><h2>${extraTitle}</h2>${extraLines.length > 1 ? bullets(s.extraTexte) : `<p>${esc(extraLines[0])}</p>`}</section>`
      : '';
  const exp = sec.experiences ? experienceBlock(s.experiences, L) : '';
  const edu = sec.formations ? educationBlock(s.formations, L) : '';

  if (s.template === 'moderne' || s.template === 'lateral') {
    return `<div class="side">
        ${photo}
        ${contact.length ? `<section class="blk"><h2>${L.contact}</h2><div class="contact">${contact.join('')}</div></section>` : ''}
        ${skillsHtml}${langsHtml}${interestsHtml}
      </div>
      <div class="main">
        <header><h1>${name}</h1><p class="title">${title}</p></header>
        ${profile}${exp}${edu}${extra}
      </div>`;
  }

  if (s.template === 'duo') {
    return `<header class="head">
        ${photo}
        <div><h1>${name}</h1><p class="title">${title}</p>${contact.length ? `<div class="contactline">${contact.join('')}</div>` : ''}</div>
      </header>
      <div class="cols">
        <div class="colA">${profile}${exp}${edu}${extra}</div>
        <aside class="colB">${skillsHtml}${langsHtml}${interestsHtml}</aside>
      </div>`;
  }

  return `<header class="head">
      ${photo}
      <div>
        <h1>${name}</h1>
        <p class="title">${title}</p>
        ${contact.length ? `<div class="contactline">${contact.join('')}</div>` : ''}
      </div>
    </header>
    ${profile}${exp}${edu}${extra}${skillsHtml}${langsHtml}${interestsHtml}`;
}
