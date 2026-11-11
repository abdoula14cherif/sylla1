import { esc } from './cv.js';
import { SENDER, labelsOf, defaults, buildDoc, fillText } from './letters-core.js';
import { locked, showPremium, toast } from './premium.js';
import { shareText, copyText, isNative } from './native.js';

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
        <div class="ltr-actions">
          <button type="button" class="primary" data-act="copy">Copier le texte</button>
          <button type="button" class="btn2" data-act="share">Partager</button>
          <button type="button" class="btn2" data-act="print"${isNative ? ' hidden' : ''}>Imprimer ou PDF</button>
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

  const renderPaper = () => (q('paper').innerHTML = build(cur, vals, true));

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

  el.addEventListener('click', async (e) => {
    const c = e.target.closest('[data-cat]');
    if (c) {
      cat = c.dataset.cat;
      renderList();
      return;
    }
    const it = e.target.closest('[data-id]');
    if (it) return openItem(items.find((x) => x.id === it.dataset.id));
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'back') return cur ? toList() : onBack();
    if (!gate()) return;
    const text = build(cur, vals, false);
    if (a === 'copy') toast((await copyText(text)) ? 'Texte copié' : 'Copie impossible');
    if (a === 'share') {
      const r = await shareText(cur.titre, text);
      if (r === 'copied') toast('Texte copié');
      if (r === 'failed') toast('Partage impossible');
    }
    if (a === 'print') {
      el.classList.add('printing');
      document.body.dataset.print = '1';
      window.print();
    }
  });

  el.addEventListener('input', (e) => {
    const k = e.target.dataset.ph;
    if (k === undefined || !cur) return;
    vals[k] = e.target.value;
    renderPaper();
  });

  window.addEventListener('afterprint', () => {
    el.classList.remove('printing');
    delete document.body.dataset.print;
  });

  return { el, onShow: toList, refresh: () => !cur && renderList() };
}
