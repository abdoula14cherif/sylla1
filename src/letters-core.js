import { esc } from './cv.js';

export const PH = /\[([^\]]+)\]/g;
export const SENDER = ['Prénom NOM', 'Téléphone', 'Email', 'Ville', 'Date'];

// Liste des champs à remplir dans un modèle (sans doublons, dans l'ordre)
export function labelsOf(letter) {
  const out = [];
  for (const m of `${letter.objet}\n${letter.corps}`.matchAll(PH)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

// Valeurs proposées d'office à partir des infos du CV
export function defaults(identite = {}, now = new Date()) {
  return {
    'Prénom NOM': identite.nom || '',
    Téléphone: identite.tel || '',
    Email: identite.email || '',
    Ville: (identite.ville || '').split(',')[0].trim(),
    Date: now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

// Remplace les [champs] par leur valeur. En HTML, un champ vide est surligné.
export function fillText(text, vals, html) {
  return text
    .split(/(\[[^\]]+\])/)
    .map((part, i) => {
      if (i % 2 === 0) return html ? esc(part) : part;
      const key = part.slice(1, -1);
      const v = (vals[key] || '').trim();
      if (v) return html ? esc(v) : v;
      return html ? `<mark>${esc(part)}</mark>` : part;
    })
    .join('');
}

// Document complet : coordonnées, ville et date, objet, texte
export function buildDoc(letter, vals, html) {
  const f = (t) => fillText(t, vals, html);
  const has = (k) => (vals[k] || '').trim().length > 0;
  const lines = [f('[Prénom NOM]')];
  const contact = ['Téléphone', 'Email'].filter(has).map((k) => f(`[${k}]`));
  if (contact.length) lines.push(contact.join(' – '));
  lines.push('');
  lines.push(`${has('Ville') ? `${f('[Ville]')}, le ` : 'Le '}${f('[Date]')}`);
  lines.push('');
  lines.push(f(`Objet : ${letter.objet}`));
  lines.push('');
  lines.push(f(letter.corps));
  return lines.join('\n');
}