import { esc } from './cv.js';
import { isHex } from './design.js';
import { getAssets, setAsset, clearAsset } from './assets.js';
import { toast } from './premium.js';

export const STAMP_COLORS = ['#1D4ED8', '#B91C1C', '#14213D', '#111827', '#6B3FA0', '#0B7A4B'];
export const SHAPES = [
  { id: 'rond', nom: 'Rond' },
  { id: 'rect', nom: 'Rectangle' },
  { id: 'ovale', nom: 'Ovale' },
];
export const defaultSpec = () => ({ shape: 'rond', l1: '', l2: '', l3: '', l4: '', color: '#1D4ED8', trait: 'normal', encre: true, angle: 0 });

// Texte d'exemple affiché tant que le client n'a rien saisi
export const DEMO_STAMP = { l1: 'Boutique Soleil', l2: 'Direction', l3: 'Douala, Cameroun', l4: '+237 6 00 00 00 00' };
export const isBlank = (sp) => !((sp.l1 || '').trim() || (sp.l2 || '').trim() || (sp.l3 || '').trim() || (sp.l4 || '').trim());

const today = () => new Date().toLocaleDateString('fr-FR');
// Modèles prêts à l'emploi (la ligne du haut garde le nom de l'entreprise déjà saisi)
export const PRESETS = [
  { id: 'entreprise', nom: 'Entreprise', make: () => ({ shape: 'rond', l2: '', l3: '', l4: '', color: '#1D4ED8', trait: 'normal', angle: -6 }), keep: true },
  { id: 'paye', nom: 'Payé', make: () => ({ shape: 'rect', l2: 'PAYÉ', l3: `Le ${today()}`, l4: '', color: '#B91C1C', trait: 'epais', angle: -9 }) },
  { id: 'recu', nom: 'Reçu', make: () => ({ shape: 'rect', l2: 'REÇU', l3: `Le ${today()}`, l4: '', color: '#0B7A4B', trait: 'epais', angle: -7 }) },
  { id: 'acquit', nom: 'Pour acquit', make: () => ({ shape: 'ovale', l2: 'POUR ACQUIT', l3: `Le ${today()}`, l4: '', color: '#1D4ED8', trait: 'normal', angle: -5 }) },
  { id: 'conforme', nom: 'Copie conforme', make: () => ({ shape: 'rect', l2: 'COPIE CERTIFIÉE', l3: 'CONFORME À L’ORIGINAL', l4: '', color: '#14213D', trait: 'normal', angle: -4 }) },
];

// Taille réelle du dessin (une inclinaison demande un peu de marge pour ne pas rogner les coins)
export function stampSize(spec) {
  if (spec.shape === 'rond') return [300, 300];
  return Math.abs(spec.angle || 0) > 0.5 ? [400, 260] : [360, 220];
}

const WIDTH = { fin: 3, normal: 5, epais: 8 };
const fit = (txt, base, maxW) => Math.max(9, Math.min(base, maxW / Math.max(1, txt.length * 0.62)));

/* ---------- Dessin vectoriel du cachet ---------- */
export function stampSVG(spec) {
  const c = isHex(spec.color) ? spec.color : '#1D4ED8';
  const w = WIDTH[spec.trait] || 5;
  const up = (t) => esc((t || '').trim().toUpperCase());
  const l1 = (spec.l1 || '').trim().toUpperCase();
  const l2 = (spec.l2 || '').trim();
  const l3 = (spec.l3 || '').trim();
  const l4 = (spec.l4 || '').trim().toUpperCase();
  const filter = spec.encre
    ? `<filter id="ink" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>`
    : '';
  const ang = Math.max(-25, Math.min(25, Number(spec.angle) || 0));
  const open = (vb, wd, ht, cx, cy) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${wd}" height="${ht}"><defs>${filter}</defs><g${spec.encre ? ' filter="url(#ink)"' : ''} fill="${c}" stroke="none" font-family="Arial,Helvetica,sans-serif" font-weight="700" text-anchor="middle"><g transform="rotate(${ang} ${cx} ${cy})">`;
  const T = (x, y, size, t) => (t ? `<text x="${x}" y="${y}" font-size="${size.toFixed(1)}">${esc(t)}</text>` : '');

  if (spec.shape === 'rect' || spec.shape === 'ovale') {
    const oval = spec.shape === 'ovale';
    const mw = oval ? 230 : 290;
    const frame = oval
      ? `<ellipse cx="180" cy="110" rx="172" ry="104" fill="none" stroke="${c}" stroke-width="${w}"/><ellipse cx="180" cy="110" rx="${172 - w - 7}" ry="${104 - w - 7}" fill="none" stroke="${c}" stroke-width="${(w * 0.55).toFixed(1)}"/>`
      : `<rect x="6" y="6" width="348" height="208" rx="16" fill="none" stroke="${c}" stroke-width="${w}"/><rect x="${6 + w + 6}" y="${6 + w + 6}" width="${348 - 2 * (w + 6)}" height="${208 - 2 * (w + 6)}" rx="8" fill="none" stroke="${c}" stroke-width="${(w * 0.55).toFixed(1)}"/>`;
    return (
      open(Math.abs(ang) > 0.5 ? '-20 -20 400 260' : '0 0 360 220', ...stampSize(spec), 180, 110) +
      frame +
      T(180, oval ? 64 : 62, fit(l1, 26, mw), l1) +
      T(180, 108, fit(l2, 38, mw), l2) +
      T(180, 146, fit(l3, 22, mw), l3) +
      T(180, oval ? 178 : 182, fit(l4, 19, mw), l4) +
      '</g></g></svg>'
    );
  }

  const star = (x) => `<text x="${x}" y="158" font-size="15">★</text>`;
  return (
    open('0 0 300 300', 300, 300, 150, 150) +
    `<circle cx="150" cy="150" r="140" fill="none" stroke="${c}" stroke-width="${w}"/><circle cx="150" cy="150" r="${98}" fill="none" stroke="${c}" stroke-width="${(w * 0.55).toFixed(1)}"/>` +
    `<defs><path id="pt" d="M42 150A108 108 0 0 1 258 150"/><path id="pb" d="M24 150A126 126 0 0 0 276 150"/></defs>` +
    (l1 ? `<text font-size="${fit(l1, 22, 300).toFixed(1)}"><textPath href="#pt" startOffset="50%">${esc(l1)}</textPath></text>` : '') +
    (l4 ? `<text font-size="${fit(l4, 19, 300).toFixed(1)}"><textPath href="#pb" startOffset="50%">${esc(l4)}</textPath></text>` : '') +
    T(150, 148, fit(l2, 32, 176), l2) +
    T(150, 178, fit(l3, 19, 170), l3) +
    star(30) +
    star(270) +
    '</g></g></svg>'
  );
}

export function svgToPNG(svg, w, h, scale = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = w * scale;
      c.height = h * scale;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Dessin impossible'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

// Recadre une image transparente sur son contenu
function trim(canvas, pad = 10) {
  const g = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const d = g.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) if (d[(y * W + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext('2d').drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

const INKS = ['#111827', '#1D4ED8', '#14213D'];

/* ---------- Salle « Cachet et signature » ---------- */
export function createStampRoom({ onBack }) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = 'room-cachet';
  el.hidden = true;
  const swatches = (attr, list) => list.map((c) => `<button type="button" ${attr}="${c}" style="background:${c}" aria-label="${c}"></button>`).join('');
  el.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>Cachet et signature</strong></div>
    <div class="ov-body">
      <div class="seg tabs2"><button type="button" data-tab="cachet" class="on">Cachet</button><button type="button" data-tab="signature">Signature</button></div>

      <section data-pane="cachet">
        <div class="stamp-preview" data-r="preview"></div>
        <p class="hint stamp-demo" data-r="demo" hidden>Exemple : saisissez vos informations ci-dessous.</p>
        <div class="card">
          <h2>Type de cachet</h2>
          <div class="seg wrap" data-r="presets">${PRESETS.map((x) => `<button type="button" data-preset="${x.id}">${x.nom}</button>`).join('')}</div>
        </div>
        <div class="card">
          <h2>Texte du cachet</h2>
          <label class="f"><span>Ligne du haut (nom de l'entreprise)</span><input data-s="l1" maxlength="40" placeholder="${DEMO_STAMP.l1}"></label>
          <label class="f"><span>Texte principal (grand)</span><input data-s="l2" maxlength="28" placeholder="${DEMO_STAMP.l2}"></label>
          <label class="f"><span>Texte secondaire</span><input data-s="l3" maxlength="32" placeholder="${DEMO_STAMP.l3}"></label>
          <label class="f"><span>Ligne du bas (ville, téléphone, NIU)</span><input data-s="l4" maxlength="40" placeholder="${DEMO_STAMP.l4}"></label>
        </div>
        <div class="card">
          <h2>Forme</h2>
          <div class="seg" data-r="shapes">${SHAPES.map((s) => `<button type="button" data-shape="${s.id}">${s.nom}</button>`).join('')}</div>
          <h2 class="gap-top">Couleur</h2>
          <div class="sw sw-big" data-r="colors">${swatches('data-color', STAMP_COLORS)}<label class="color-custom" title="Couleur personnalisée"><input type="color" data-s-color value="#1D4ED8"></label></div>
          <h2 class="gap-top">Trait</h2>
          <div class="seg" data-r="traits"><button type="button" data-trait="fin">Fin</button><button type="button" data-trait="normal">Normal</button><button type="button" data-trait="epais">Épais</button></div>
          <label class="f gap-top"><span>Inclinaison : <b data-r="angle-val">0°</b> (un vrai tampon n'est jamais parfaitement droit)</span><input type="range" min="-20" max="20" step="1" data-s-angle></label>
          <label class="chk gap-top"><input type="checkbox" data-s-encre> Effet tampon encré</label>
        </div>
        <div class="card">
          <h2>Aperçu sur un document</h2>
          <div class="paper" data-r="paper"></div>
        </div>
        <div class="card">
          <button type="button" class="primary" data-act="save-stamp">Enregistrer mon cachet</button>
          <button type="button" class="btn2 wide gap-top" data-act="del-stamp">Supprimer le cachet</button>
          <p class="hint" data-r="stamp-status"></p>
        </div>
      </section>

      <section data-pane="signature" hidden>
        <div class="card">
          <h2>Dessinez votre signature</h2>
          <p class="hint">Signez avec le doigt, sur la ligne.</p>
          <canvas class="sig-pad" width="640" height="240" data-r="pad"></canvas>
          <div class="sw sw-big gap-top" data-r="inks">${swatches('data-ink', INKS)}</div>
          <div class="grid2 gap-top">
            <button type="button" class="btn2" data-act="clear-pad">Effacer</button>
            <button type="button" class="primary nomar" data-act="save-sig">Enregistrer</button>
          </div>
          <label class="link-btn gap-top" for="sig-file">Ou importer une photo de ma signature</label>
          <input type="file" id="sig-file" accept="image/*" hidden>
        </div>
        <div class="card">
          <h2>Signature enregistrée</h2>
          <div class="sig-saved" data-r="sig-saved"></div>
          <button type="button" class="btn2 wide gap-top" data-act="del-sig">Supprimer la signature</button>
        </div>
      </section>
    </div>`;
  document.body.appendChild(el);
  const q = (r) => el.querySelector(`[data-r="${r}"]`);

  let spec = (() => {
    const saved = getAssets().cachetSpec;
    return { ...defaultSpec(), ...(saved || {}) };
  })();
  let ink = INKS[0];

  /* ----- Cachet ----- */
  function prefill() {
    if (spec.l1 || spec.l2) return;
    try {
      const inv = JSON.parse(localStorage.getItem('digiform.inv.v1') || 'null');
      const e = inv && inv.doc && inv.doc.emetteur;
      if (e) {
        spec.l1 = (e.nom || '').slice(0, 40);
        spec.l4 = (e.tel || '').slice(0, 40);
      }
    } catch {
      /* rien */
    }
  }
  const shownSpec = () => (isBlank(spec) ? { ...spec, ...DEMO_STAMP } : spec);
  function drawPaper() {
    const sig = getAssets().signature;
    const bar = (w) => `<i style="width:${w}%"></i>`;
    q('paper').innerHTML = `<div class="paper-lines">${bar(46)}${bar(92)}${bar(88)}${bar(94)}${bar(60)}</div>
      <div class="paper-foot"><span>Fait à Douala, le ${today()}</span><div class="paper-sign">${sig ? `<img alt="" class="p-sig" src="${sig}">` : '<svg class="p-sig" viewBox="0 0 160 60"><path d="M6 40c14-30 22-34 26-20s-10 28 4 22 18-30 30-22-6 24 6 20 20-14 34-12" fill="none" stroke="#1D4ED8" stroke-width="3" stroke-linecap="round"/></svg>'}<div class="p-stamp">${stampSVG(shownSpec())}</div></div></div>`;
  }
  function drawStamp() {
    q('demo').hidden = !isBlank(spec);
    q('preview').innerHTML = stampSVG(shownSpec());
    q('angle-val').textContent = `${spec.angle || 0}°`;
    el.querySelector('[data-s-angle]').value = spec.angle || 0;
    drawPaper();
    if (document.activeElement && document.activeElement.dataset && document.activeElement.dataset.s) {
      /* on ne réécrit pas le champ en cours de saisie */
    } else el.querySelectorAll('[data-s]').forEach((n) => (n.value = spec[n.dataset.s] || ''));
    el.querySelector('[data-s-encre]').checked = !!spec.encre;
    el.querySelector('[data-s-color]').value = isHex(spec.color) ? spec.color : '#1D4ED8';
    el.querySelectorAll('[data-shape]').forEach((b) => b.classList.toggle('on', b.dataset.shape === spec.shape));
    el.querySelectorAll('[data-preset]').forEach((b) => b.classList.toggle('on', b.dataset.preset === spec.preset));
    el.querySelectorAll('[data-trait]').forEach((b) => b.classList.toggle('on', b.dataset.trait === spec.trait));
    el.querySelectorAll('[data-color]').forEach((b) => b.classList.toggle('on', b.dataset.color.toLowerCase() === String(spec.color).toLowerCase()));
    q('stamp-status').textContent = getAssets().cachet ? 'Cachet enregistré : vous pouvez l’apposer sur vos factures.' : 'Pas encore de cachet enregistré.';
  }

  /* ----- Signature ----- */
  const pad = q('pad');
  const g = pad.getContext('2d');
  g.lineCap = 'round';
  g.lineJoin = 'round';
  let drawing = false;
  let last = null;
  const pos = (e) => {
    const r = pad.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * pad.width) / r.width, y: ((e.clientY - r.top) * pad.height) / r.height };
  };
  pad.addEventListener('pointerdown', (e) => {
    drawing = true;
    last = pos(e);
    pad.setPointerCapture(e.pointerId);
    g.strokeStyle = ink;
    g.lineWidth = 7;
    g.beginPath();
    g.arc(last.x, last.y, 3, 0, Math.PI * 2);
    g.fillStyle = ink;
    g.fill();
    e.preventDefault();
  });
  pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    g.strokeStyle = ink;
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(last.x, last.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    last = p;
  });
  ['pointerup', 'pointercancel'].forEach((t) => pad.addEventListener(t, () => (drawing = false)));
  const clearPad = () => g.clearRect(0, 0, pad.width, pad.height);

  function drawSaved() {
    const s = getAssets().signature;
    q('sig-saved').innerHTML = s ? `<img alt="Signature" src="${s}">` : '<p class="hint">Pas encore de signature enregistrée.</p>';
    el.querySelectorAll('[data-ink]').forEach((b) => b.classList.toggle('on', b.dataset.ink === ink));
  }

  function saveSignatureCanvas(canvas) {
    const t = trim(canvas);
    if (!t) return toast('Dessinez d’abord votre signature');
    const max = 560;
    const k = Math.min(1, max / t.width);
    const out = document.createElement('canvas');
    out.width = Math.round(t.width * k);
    out.height = Math.round(t.height * k);
    out.getContext('2d').drawImage(t, 0, 0, out.width, out.height);
    setAsset('signature', out.toDataURL('image/png'));
    drawSaved();
    drawPaper();
    toast('Signature enregistrée');
  }

  el.querySelector('#sig-file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 700 / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        const cg = c.getContext('2d');
        cg.drawImage(img, 0, 0, c.width, c.height);
        const im = cg.getImageData(0, 0, c.width, c.height);
        const rgb = [parseInt(ink.slice(1, 3), 16), parseInt(ink.slice(3, 5), 16), parseInt(ink.slice(5, 7), 16)];
        for (let i = 0; i < im.data.length; i += 4) {
          const lum = 0.299 * im.data[i] + 0.587 * im.data[i + 1] + 0.114 * im.data[i + 2];
          const a = Math.max(0, Math.min(255, ((215 - lum) / 95) * 255));
          im.data[i] = rgb[0];
          im.data[i + 1] = rgb[1];
          im.data[i + 2] = rgb[2];
          im.data[i + 3] = a;
        }
        cg.putImageData(im, 0, 0);
        saveSignatureCanvas(c);
      };
      img.src = r.result;
    };
    r.readAsDataURL(f);
  });

  /* ----- Événements ----- */
  el.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.s) spec[t.dataset.s] = t.value;
    else if ('sColor' in t.dataset) spec.color = t.value;
    else if ('sEncre' in t.dataset) spec.encre = t.checked;
    else if ('sAngle' in t.dataset) spec.angle = Number(t.value);
    else return;
    drawStamp();
  });

  el.addEventListener('click', async (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) {
      el.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b === tab));
      el.querySelector('[data-pane="cachet"]').hidden = tab.dataset.tab !== 'cachet';
      el.querySelector('[data-pane="signature"]').hidden = tab.dataset.tab !== 'signature';
      return;
    }
    const sh = e.target.closest('[data-shape]');
    if (sh) { spec.shape = sh.dataset.shape; return drawStamp(); }
    const pr = e.target.closest('[data-preset]');
    if (pr) {
      const pre = PRESETS.find((x) => x.id === pr.dataset.preset);
      const keepL1 = spec.l1;
      Object.assign(spec, defaultSpec(), pre.make(), { preset: pre.id, l1: keepL1 });
      if (pre.keep) Object.assign(spec, { l2: spec.l2, l3: spec.l3, l4: spec.l4 });
      return drawStamp();
    }
    const tr = e.target.closest('[data-trait]');
    if (tr) { spec.trait = tr.dataset.trait; return drawStamp(); }
    const co = e.target.closest('[data-color]');
    if (co) { spec.color = co.dataset.color; return drawStamp(); }
    const ik = e.target.closest('[data-ink]');
    if (ik) { ink = ik.dataset.ink; return drawSaved(); }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'back') return onBack();
    if (a === 'clear-pad') return clearPad();
    if (a === 'save-sig') return saveSignatureCanvas(pad);
    if (a === 'del-sig') { clearAsset('signature'); drawSaved(); drawPaper(); return toast('Signature supprimée'); }
    if (a === 'del-stamp') { clearAsset('cachet', 'cachetSpec'); drawStamp(); return toast('Cachet supprimé'); }
    if (a === 'save-stamp') {
      if (isBlank(spec)) return toast('Ajoutez d’abord le texte de votre cachet');
      const vb = stampSize(spec);
      try {
        const png = await svgToPNG(stampSVG(spec), vb[0], vb[1], 2);
        setAsset('cachetSpec', { ...spec });
        setAsset('cachet', png);
        drawStamp();
        toast('Cachet enregistré');
      } catch {
        toast('Enregistrement impossible');
      }
    }
  });

  prefill();
  drawStamp();
  drawSaved();

  return {
    el,
    onShow: () => {
      prefill();
      drawStamp();
      drawSaved();
    },
    refresh: () => {},
    hint: () => (getAssets().cachet || getAssets().signature ? 'Votre cachet et signature sont prêts' : null),
  };
}
