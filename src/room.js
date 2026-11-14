import { esc } from './cv.js';
import { SENDER, labelsOf, defaults, buildDoc, fillText } from './letters-core.js';
import { locked, showPremium, toast } from './premium.js';
import { copyText, isNative } from './native.js';
import { exportDocument, printPage } from './pdf.js';
import { PAGES } from './design.js';
import { getAssets, onAssets } from './assets.js';
import { defaultObj } from './invoice-core.js';

const build = (it, vals, html) => (it.format === 'doc' ? fillText(it.corps, vals, html) : buildDoc(it, vals, html));

export function createTemplateRoom({ id, title, items, cats, note = '', sender = true, getIdentity, onBack }) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = `room-${id}`;
  el.hidden = true;
  el.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>${esc(title)}</strong></div>
    <div class="ov-body">
      <div data-r="list"></div>
      <div data-r="detail" hidden>
        <div class="card"><h2 data-r="name"></h2><div data-r="fields"></div></div>
        ${note ? `<p class="doc-note">${esc(note)}</p>` : ''}
        <p class="hint">Format de page</p>
        <div class="seg" data-r="formats"></div>
        <div class="card" data-r="seal">
          <h2>Cachet et signature</h2>
          <label class="chk"><input type="checkbox" data-obj-on="cachet"> Apposer mon cachet <small data-r="no-cachet" hidden>(aucun cachet : <a href="#/cachet">le créer</a>)</small></label>
          <label class="chk"><input type="checkbox" data-obj-on="signature"> Apposer ma signature <small data-r="no-signature" hidden>(aucune signature : <a href="#/cachet">l'ajouter</a>)</small></label>
          <div data-r="placer" hidden>
            <div class="seg gap-top"><button type="button" data-place="cachet">Placer le cachet</button><button type="button" data-place="signature">Placer la signature</button></div>
            <p class="hint">Touchez le document à l'endroit voulu.</p>
            <label class="rng"><span>Taille</span><input type="range" min="8" max="45" data-rng="size"></label>
            <label class="rng"><span>Rotation</span><input type="range" min="-45" max="45" data-rng="rot"></label>
            <button type="button" class="btn2 wide" data-act="done-place">Terminé</button>
          </div>
        </div>
        <div class="ltr-actions">
          <button type="button" class="primary" data-act="pdf">${isNative ? 'Partager le PDF' : 'Télécharger le PDF'}</button>
          <button type="button" class="btn2" data-act="copy">Copier le texte</button>
          <button type="button" class="btn2" data-act="print"${isNative ? ' hidden' : ''}>Imprimer</button>
        </div>
        <div class="letter-paper" data-r="paper"></div>
      </div>
    </div>`;
  document.body.appendChild(el);
  const q = (r) => el.querySelector(`[data-r="${r}"]`);
  const back = el.querySelector('[data-act="back"]');

  let cat = 'all';
  let cur = null;
  let vals = {};
  let fmt = 'A4';
  let busy = false;
  let placing = null;
  const SEAL_KEY = `digiform.seal.${id}`;
  let seal = (() => {
    const base = { cachet: defaultObj('cachet'), signature: defaultObj('signature') };
    try {
      const sv = JSON.parse(localStorage.getItem(SEAL_KEY) || 'null') || {};
      return { cachet: { ...base.cachet, ...sv.cachet }, signature: { ...base.signature, ...sv.signature } };
    } catch {
      return base;
    }
  })();
  const saveSeal = () => {
    try {
      localStorage.setItem(SEAL_KEY, JSON.stringify(seal));
    } catch {
      /* stockage plein */
    }
  };
  const objsHTML = () => {
    const A = getAssets();
    return ['cachet', 'signature']
      .map((k) => {
        const o = seal[k];
        return o.on && A[k]
          ? `<img class="ov-obj" data-obj="${k}" alt="" src="${A[k]}" style="left:${o.x}%;top:${o.y}%;width:${o.size}%;transform:translate(-50%,-50%) rotate(${o.rot}deg)">`
          : '';
      })
      .join('');
  };
  function renderSeal() {
    const A = getAssets();
    ['cachet', 'signature'].forEach((k) => {
      const cb = el.querySelector(`[data-obj-on="${k}"]`);
      cb.disabled = !A[k];
      cb.checked = !!(A[k] && seal[k].on);
      q(`no-${k}`).hidden = !!A[k];
    });
    const any = ['cachet', 'signature'].some((k) => A[k] && seal[k].on);
    q('placer').hidden = !any;
    if (any) {
      if (!placing || !(A[placing] && seal[placing].on)) placing = ['cachet', 'signature'].find((k) => A[k] && seal[k].on);
      el.querySelectorAll('[data-place]').forEach((b) => {
        b.classList.toggle('on', b.dataset.place === placing);
        b.hidden = !(A[b.dataset.place] && seal[b.dataset.place].on);
      });
      el.querySelector('[data-rng="size"]').value = seal[placing].size;
      el.querySelector('[data-rng="rot"]').value = seal[placing].rot;
    } else placing = null;
    q('paper').classList.toggle('placing', !!placing);
  }

  const renderFormats = () => {
    q('formats').innerHTML = ['A4', 'A5', 'Letter'].map((f) => `<button type="button" data-format="${f}"${fmt === f ? ' class="on"' : ''}>${PAGES[f].nom}</button>`).join('');
  };

  function renderList() {
    const chips = [{ id: 'all', nom: 'Tous' }, ...cats]
      .map((c) => `<button type="button" class="chip${cat === c.id ? ' on' : ''}" data-cat="${c.id}">${esc(c.nom)}</button>`)
      .join('');
    const rows = items
      .filter((it) => cat === 'all' || it.cat === cat)
      .map(
        (it, i) =>
          `<button type="button" class="ltr-item" style="--i:${i}" data-id="${it.id}"><span>${esc(it.titre)}</span>${
            locked(it.id) ? '<em class="lockmark">Premium</em>' : '<em>›</em>'
          }</button>`
      )
      .join('');
    q('list').innerHTML = `<div class="chips-row">${chips}</div><div class="ltr-items">${rows}</div>`;
  }

  const renderPaper = () => (q('paper').innerHTML = build(cur, vals, true) + objsHTML());

  function openItem(it) {
    cur = it;
    const d = defaults(getIdentity());
    SENDER.forEach((k) => {
      if (!(vals[k] || '').trim()) vals[k] = d[k];
    });
    const content = labelsOf(it).filter((k) => !(sender && SENDER.includes(k)));
    const field = (k, long) =>
      long
        ? `<label class="f"><span>${esc(k)}</span><textarea rows="2" data-ph="${esc(k)}">${esc(vals[k] || '')}</textarea></label>`
        : `<label class="f"><span>${esc(k)}</span><input data-ph="${esc(k)}" value="${esc(vals[k] || '')}"></label>`;
    q('name').textContent = it.titre;
    q('fields').innerHTML =
      (sender ? `<p class="hint"><strong>Vos coordonnées</strong></p>${SENDER.map((k) => field(k, false)).join('')}` : '') +
      (content.length
        ? `${sender ? '<p class="hint"><strong>Le contenu</strong></p>' : ''}${content.map((k) => field(k, !SENDER.includes(k))).join('')}`
        : '');
    q('list').hidden = true;
    q('detail').hidden = false;
    back.textContent = '← Liste';
    renderFormats();
    renderSeal();
    renderPaper();
    el.querySelector('.ov-body').scrollTop = 0;
  }

  function toList() {
    cur = null;
    q('detail').hidden = true;
    q('list').hidden = false;
    back.textContent = '← Accueil';
    renderList();
  }

  const gate = () => {
    if (cur && locked(cur.id)) {
      showPremium(cur.titre);
      return false;
    }
    return !!cur;
  };

  async function exportPDF() {
    if (busy || !gate()) return;
    busy = true;
    toast('Création du PDF…');
    try {
      const r = await exportDocument({
        fmt,
        filename: `${cur.titre}.pdf`.replace(/[^\w.-]+/g, '-'),
        title: cur.titre,
        build: (stage, page) => {
          const d = document.createElement('div');
          d.className = 'letter-paper pdf';
          d.style.cssText = `width:${page.w}px;min-height:${page.h}px;padding:${Math.round(page.w * 0.1)}px ${Math.round(page.w * 0.09)}px;box-sizing:border-box;box-shadow:none;border-radius:0;position:relative`;
          d.innerHTML = build(cur, vals, true) + objsHTML();
          stage.appendChild(d);
          return d;
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

  el.addEventListener('change', (e) => {
    const k = e.target.dataset.objOn;
    if (!k) return;
    seal[k].on = e.target.checked;
    if (e.target.checked) placing = k;
    saveSeal();
    renderSeal();
    renderPaper();
  });

  // Toucher le document = poser le cachet ou la signature à cet endroit
  q('paper').addEventListener('click', (e) => {
    if (!placing || !cur) return;
    const r = q('paper').getBoundingClientRect();
    seal[placing].x = Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)) * 10) / 10;
    seal[placing].y = Math.round(Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) * 10) / 10;
    saveSeal();
    renderPaper();
  });

  el.addEventListener('click', async (e) => {
    const pl = e.target.closest('[data-place]');
    if (pl) {
      placing = pl.dataset.place;
      return renderSeal();
    }
    const c = e.target.closest('[data-cat]');
    if (c) {
      cat = c.dataset.cat;
      renderList();
      return;
    }
    const it = e.target.closest('[data-id]');
    if (it) return openItem(items.find((x) => x.id === it.dataset.id));
    const fm = e.target.closest('[data-format]');
    if (fm) {
      fmt = fm.dataset.format;
      return renderFormats();
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'back') return cur ? toList() : onBack();
    if (a === 'done-place') {
      placing = null;
      q('placer').hidden = true;
      q('paper').classList.remove('placing');
      return;
    }
    if (a === 'pdf') return exportPDF();
    if (!gate()) return;
    if (a === 'copy') toast((await copyText(build(cur, vals, false))) ? 'Texte copié' : 'Copie impossible');
    if (a === 'print') {
      el.classList.add('printing');
      document.body.dataset.print = '1';
      printPage(fmt);
    }
  });

  el.addEventListener('input', (e) => {
    const r = e.target.dataset.rng;
    if (r && placing) {
      seal[placing][r] = Number(e.target.value);
      saveSeal();
      return renderPaper();
    }
    const k = e.target.dataset.ph;
    if (k === undefined || !cur) return;
    vals[k] = e.target.value;
    renderPaper();
  });

  window.addEventListener('afterprint', () => {
    el.classList.remove('printing');
    delete document.body.dataset.print;
  });

  onAssets(() => {
    if (!cur) return;
    renderSeal();
    renderPaper();
  });

  return { el, onShow: toList, refresh: () => !cur && renderList() };
}
