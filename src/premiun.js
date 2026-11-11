import { CONFIG } from './config.js';
import { esc } from './cv.js';

let premium = new Set(); // par défaut : TOUT est gratuit
let unlockAll = CONFIG.unlockAll;
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

export const locked = (id) => !unlockAll && premium.has(id);
export const getPremiumIds = () => [...premium];
export const getUnlockAll = () => unlockAll;
export const onPremiumChange = (fn) => subs.add(fn);
export const waLink = (text) => `https://wa.me/${CONFIG.adminWhatsapp}?text=${encodeURIComponent(text)}`;

// Lit premium.json (modifié par l'admin sur GitHub). Sans internet : tout reste gratuit.
export async function loadRemote() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${CONFIG.premiumUrl}?t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.premium)) premium = new Set(data.premium.filter((x) => typeof x === 'string'));
    unlockAll = CONFIG.unlockAll || data.unlockAll === true;
    emit();
  } catch {
    /* hors ligne ou fichier absent */
  }
}

export function toast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

function modal(html) {
  let m = document.querySelector('#app-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'app-modal';
    m.className = 'modal';
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target.closest('[data-close]')) m.hidden = true;
    });
    document.body.appendChild(m);
  }
  m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}<button type="button" class="link-btn" data-close>Fermer</button></div>`;
  m.hidden = false;
}

export function showPremium(label) {
  modal(`<h3>Contenu premium</h3>
    <p>« ${esc(label)} » est réservé aux membres premium. Contactez l'administrateur pour l'activer.</p>
    <a class="primary" href="${waLink(`Bonjour, je veux débloquer « ${label} » sur Digiform.`)}" target="_blank" rel="noopener">Demander sur WhatsApp</a>`);
}

export function showSoon(label, desc) {
  modal(`<h3>Bientôt disponible</h3>
    <p>« ${esc(label)} » arrive dans une prochaine version. ${esc(desc)}</p>
    <a class="primary" href="${waLink(`Bonjour, je veux être prévenu(e) quand « ${label} » sera disponible sur Digiform.`)}" target="_blank" rel="noopener">Me prévenir sur WhatsApp</a>`);
}
