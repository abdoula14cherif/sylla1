import { CONFIG, FREE_BUILD } from './config.js';
import { esc } from './cv.js';

const CACHE = 'digiform.remote.v1';
const CODE = 'digiform.code.v1';
const DEFAULT_PAY = { lien: '', prix: '', libelle: '', whatsapp: CONFIG.adminWhatsapp };

let premium = new Set(); // par défaut : TOUT est gratuit
let unlockAll = CONFIG.unlockAll;
let pay = { ...DEFAULT_PAY };
let codes = new Set(); // empreintes (SHA-256) des codes d'activation valides
let codeOk = false;
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

const lsGet = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* stockage plein */
  }
};

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const safeLink = (u) => (/^https:\/\/[^\s]+$/i.test(String(u || '').trim()) ? String(u).trim() : '');
const digits = (n) => String(n || '').replace(/\D/g, '');

export const locked = (id) => !FREE_BUILD && !unlockAll && !codeOk && premium.has(id);
export const getPremiumIds = () => [...premium];
export const getUnlockAll = () => unlockAll;
export const getPay = () => ({ ...pay });
export const getCodeHashes = () => [...codes];
export const hasCode = () => codeOk;
export const onPremiumChange = (fn) => subs.add(fn);
export const waLink = (text) => `https://wa.me/${digits(pay.whatsapp) || CONFIG.adminWhatsapp}?text=${encodeURIComponent(text)}`;

async function checkCode() {
  const c = normCode(lsGet(CODE));
  try {
    codeOk = !!c && codes.has(await sha256(c));
  } catch {
    codeOk = false;
  }
}

function applyRemote(data) {
  if (Array.isArray(data.premium)) premium = new Set(data.premium.filter((x) => typeof x === 'string'));
  unlockAll = CONFIG.unlockAll || data.unlockAll === true;
  const p = data.paiement || {};
  pay = {
    lien: safeLink(p.lien),
    prix: String(p.prix || '').slice(0, 60),
    libelle: String(p.libelle || '').slice(0, 60),
    whatsapp: digits(p.whatsapp) || CONFIG.adminWhatsapp,
  };
  codes = new Set((Array.isArray(data.codes) ? data.codes : []).filter((x) => typeof x === 'string' && /^[0-9a-f]{64}$/.test(x)));
}

// Derniers réglages reçus : l'app les garde hors ligne
if (!FREE_BUILD) {
  try {
    const cached = JSON.parse(lsGet(CACHE) || 'null');
    if (cached) applyRemote(cached);
  } catch {
    /* cache illisible */
  }
  checkCode().then(emit);
}

// Lit premium.json (modifié par l'admin sur GitHub). Sans internet : derniers réglages connus.
export async function loadRemote() {
  if (FREE_BUILD) return;
  for (const url of CONFIG.premiumUrls) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const data = await res.json();
      applyRemote(data);
      lsSet(CACHE, JSON.stringify(data));
      await checkCode();
      emit();
      return;
    } catch {
      /* hors ligne ou fichier absent : on essaie l'adresse suivante */
    }
  }
}

export async function activateCode(raw) {
  const c = normCode(raw);
  if (c.length < 6) return false;
  let ok = false;
  try {
    ok = codes.has(await sha256(c));
  } catch {
    ok = false;
  }
  if (ok) {
    lsSet(CODE, c);
    codeOk = true;
    emit();
  }
  return ok;
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
    m.addEventListener('submit', async (e) => {
      const f = e.target.closest('[data-code-form]');
      if (!f) return;
      e.preventDefault();
      if (await activateCode(f.querySelector('[data-code-input]').value)) {
        m.hidden = true;
        toast('Premium activé sur ce téléphone');
      } else {
        toast('Code invalide');
      }
    });
    document.body.appendChild(m);
  }
  m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}<button type="button" class="link-btn" data-close>Fermer</button></div>`;
  m.hidden = false;
}

export function showPremium(label) {
  const hasLink = !!pay.lien;
  modal(`<h3>Contenu premium</h3>
    <p>« ${esc(label)} » est réservé aux membres premium.${hasLink ? ' Payez en ligne, puis activez avec votre code.' : " Contactez l'administrateur pour l'activer."}</p>
    ${pay.prix ? `<p class="pay-price">${esc(pay.prix)}</p>` : ''}
    ${hasLink ? `<a class="primary" href="${esc(pay.lien)}" target="_blank" rel="noopener">${esc(pay.libelle || 'Payer maintenant')}</a>` : ''}
    <a class="${hasLink ? 'btn2 linkbtn' : 'primary'}" href="${waLink(`Bonjour, je veux débloquer « ${label} » sur Digiform.${hasLink ? ' Voici ma preuve de paiement.' : ''}`)}" target="_blank" rel="noopener">${hasLink ? 'J’ai payé : envoyer la preuve' : 'Demander sur WhatsApp'}</a>
    <form class="code-row" data-code-form>
      <input type="text" inputmode="text" autocomplete="off" autocapitalize="characters" placeholder="Code d’activation" data-code-input aria-label="Code d’activation">
      <button type="submit" class="btn2">Activer</button>
    </form>`);
}

export function showSoon(label, desc) {
  modal(`<h3>Bientôt disponible</h3>
    <p>« ${esc(label)} » arrive dans une prochaine version. ${esc(desc)}</p>
    <a class="primary" href="${waLink(`Bonjour, je veux être prévenu(e) quand « ${label} » sera disponible sur Digiform.`)}" target="_blank" rel="noopener">Me prévenir sur WhatsApp</a>`);
}
