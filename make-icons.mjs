// Génère l'icône Digiform et l'écran de démarrage Android à partir du logo (100 % texte, aucune image à envoyer).
// Utilisé par le workflow GitHub après « cap add android ». Usage : node scripts/make-icons.mjs [dossier res]
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RES = process.argv[2] || 'android/app/src/main/res';
const NAVY = '#14213D';
const PAGE = `<path d="M20 13h17l11 11v27a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4z" fill="#fff"/><path d="M37 13v9a2 2 0 0 0 2 2h9z" fill="#F2A900"/><path d="M25.5 30v16h5.2a8 8 0 0 0 0-16z" fill="none" stroke="${NAVY}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>`;
const full = `<rect width="64" height="64" rx="16" fill="${NAVY}"/><path d="M16 0h32L0 48V16A16 16 0 0 1 16 0z" fill="#fff" opacity=".06"/>${PAGE}`;
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const centered = (n, k) => `<g transform="translate(${n / 2} ${n / 2}) scale(${(k * n) / 64}) translate(-32 -34)">${PAGE}</g>`;
const fg = (n) => svg(n, n, centered(n, 0.7));
const square = (n) => svg(n, n, `<g transform="scale(${n / 64})">${full}</g>`);
const round = (n) => svg(n, n, `<circle cx="${n / 2}" cy="${n / 2}" r="${n / 2}" fill="${NAVY}"/>${centered(n, 0.72)}`);
const splash = (w, h) => {
  const l = Math.min(w, h) * 0.3;
  return svg(w, h, `<rect width="${w}" height="${h}" fill="${NAVY}"/><g transform="translate(${(w - l) / 2} ${(h - l) / 2}) scale(${l / 64})"><rect width="64" height="64" rx="16" fill="#1d2f57"/>${PAGE}</g>`);
};

const write = async (rel, s) => {
  const f = path.join(RES, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  await sharp(Buffer.from(s)).png().toFile(f);
};
const text = (rel, content) => {
  const f = path.join(RES, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};

const D = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(D)) {
  await write(`mipmap-${d}/ic_launcher.png`, square(48 * k));
  await write(`mipmap-${d}/ic_launcher_round.png`, round(48 * k));
  await write(`mipmap-${d}/ic_launcher_foreground.png`, fg(108 * k));
}
const P = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] };
await write('drawable/splash.png', splash(480, 320));
for (const [d, [w, h]] of Object.entries(P)) {
  await write(`drawable-port-${d}/splash.png`, splash(w, h));
  await write(`drawable-land-${d}/splash.png`, splash(h, w));
}
text('values/ic_launcher_background.xml', `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${NAVY}</color>\n</resources>\n`);
const adaptive = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`;
text('mipmap-anydpi-v26/ic_launcher.xml', adaptive);
text('mipmap-anydpi-v26/ic_launcher_round.xml', adaptive);
console.log('Icône et écran de démarrage Digiform générés dans', RES);
