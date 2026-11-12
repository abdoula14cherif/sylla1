// Réglages de style partagés (CV, factures, documents)
export const PALETTE = ['#14213D', '#0B7A4B', '#B42318', '#6B3FA0', '#1F2933', '#0F766E', '#B7791F', '#2563EB', '#BE185D', '#C2410C', '#475569', '#0E7490'];

export const FONTS = [
  { id: 'auto', nom: 'Auto' },
  { id: 'sans', nom: 'Sans' },
  { id: 'serif', nom: 'Serif' },
  { id: 'humaniste', nom: 'Humaniste' },
];
export const FONT_STACKS = {
  sans: "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
  serif: "Georgia,'Times New Roman','Noto Serif',serif",
  humaniste: "'Trebuchet MS','Segoe UI','Noto Sans',Verdana,sans-serif",
};

export const SIZES = [
  { id: 'compact', nom: 'Compact', px: 12 },
  { id: 'normal', nom: 'Normal', px: 13 },
  { id: 'grand', nom: 'Grand', px: 14.5 },
];

// Formats de page : taille écran (px à 96 dpi) et taille PDF (points)
export const PAGES = {
  A4: { id: 'A4', nom: 'A4', w: 794, h: 1123, ptW: 595.276, ptH: 841.89, mm: [210, 297] },
  Letter: { id: 'Letter', nom: 'Letter', w: 816, h: 1056, ptW: 612, ptH: 792, mm: [215.9, 279.4] },
  A5: { id: 'A5', nom: 'A5', w: 559, h: 794, ptW: 419.528, ptH: 595.276, mm: [148, 210] },
};

export const isHex = (s) => /^#[0-9a-f]{6}$/i.test(String(s || '').trim());
