import { esc } from './cv.js';
import { locked, showPremium, toast } from './premium.js';
import { shareText, copyText, isNative } from './native.js';
import { INVOICE_STYLES, blankDoc, invoiceHTML, invoiceText, totals, fmt, num } from './invoice-core.js';

const KEY = 'digiform.inv.v1';
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
};
const save = (s) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage plein */
  }
};

const getPath = (o, p) => p.split('.').reduce((a, k) => (a ? a[k] : ''), o);
const setPath = (o, p, v) => {
  const ks = p.split('.');
  const last = ks.pop();
  ks.reduce((a, k) => a[k], o)[last] = v;
};

// Le total « roule » vers sa nouvelle valeur
function tween(node, from, to) {
  cancelAnimationFrame(node._raf);
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 280);
    node.textContent = `${fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)))} FCFA`;
    if (k < 1) node._raf = requestAnimationFrame(step);
  };
  node._raf = requestAnimationFrame(step);
}

export function createInvoiceRoom({ onBack }) {
  const saved = load();
  let counters = (saved && saved.counters) || { facture: 1 };
  const base = blankDoc((saved && saved.doc && saved.doc.type) || 'facture', 1);
  let doc = saved && saved.doc ? { ...base, ...saved.doc, emetteur: { ...base.emetteur, ...saved.doc.emetteur }, client: { ...base.client, ...saved.doc.client } } : base;
  if (!Array.isArray(doc.lignes) || !doc.lignes.length) doc.lignes = [{ desc: '', qte: '1', pu: '' }];
  let view = 'form';
  let shown = 0;

  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = 'room-factures';
  el.hidden = true;
  const input = (label, path, extra = '') => `<label class="f"><span>${label}</span><input data-f="${path}" ${extra}></label>`;
  el.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>Factures et devis</strong></div>
    <div class="ov-body">
      <section data-view="form">
        <div class="card">
          <h2>Document</h2>
          <div class="seg"><button type="button" data-type="facture">Facture</button><button type="button" data-type="devis">Devis</button></div>
          <p class="hint">Style</p>
          <div class="seg wrap" data-r="styles"></div>
          <div class="grid2 gap-top">
            ${input('Numéro', 'numero')}
            ${input('Date', 'date', 'type="date"')}
          </div>
          <label class="f"><span data-r="lim">Échéance de paiement</span><input type="date" data-f="echeance"></label>
        </div>
        <div class="card">
          <h2>Votre entreprise</h2>
          ${input('Nom', 'emetteur.nom', 'autocomplete="organization"')}
          ${input('Adresse', 'emetteur.adresse')}
          <div class="grid2">${input('Téléphone', 'emetteur.tel', 'type="tel"')}${input('Email', 'emetteur.email', 'type="email"')}</div>
          ${input('NIU ou numéro de contribuable', 'emetteur.niu')}
        </div>
        <div class="card">
          <h2>Client</h2>
          ${input('Nom', 'client.nom')}
          ${input('Adresse', 'client.adresse')}
          ${input('Téléphone', 'client.tel', 'type="tel"')}
        </div>
        <div class="card">
          <h2>Lignes</h2>
          <div data-r="lines"></div>
          <button type="button" class="link-btn" data-act="add">Ajouter une ligne</button>
        </div>
        <div class="card">
          <h2>Total et paiement</h2>
          ${input('TVA en % (0 si sans TVA)', 'tva', 'inputmode="decimal"')}
          <label class="f"><span>Paiement (MoMo, Orange Money, banque…)</span><textarea rows="2" data-f="paiement"></textarea></label>
          <label class="f"><span>Notes</span><textarea rows="2" data-f="notes"></textarea></label>
        </div>
        <div class="card"><button type="button" class="btn2 wide" data-act="new">Nouveau document</button></div>
      </section>
      <section data-view="preview" hidden>
        <div class="ltr-actions">
          <button type="button" class="primary" data-act="copy">Copier le texte</button>
          <button type="button" class="btn2" data-act="share">Partager sur WhatsApp ou ailleurs</button>
          <button type="button" class="btn2" data-act="print"${isNative ? ' hidden' : ''}>Imprimer ou PDF</button>
        </div>
        <div data-r="paper"></div>
      </section>
    </div>
    <div class="inv-bar">
      <div><small>Total</small><strong data-r="total">0 FCFA</strong></div>
      <button type="button" class="primary" data-act="toggle">Aperçu</button>
    </div>`;
  document.body.appendChild(el);
  const q = (r) => el.querySelector(`[data-r="${r}"]`);

  function renderStyles() {
    q('styles').innerHTML = INVOICE_STYLES.map(
      (s) => `<button type="button" data-style="${s.id}"${doc.style === s.id ? ' class="on"' : ''}>${esc(s.nom)}${locked(s.id) ? ' 🔒' : ''}</button>`
    ).join('');
  }

  function renderLines() {
    q('lines').innerHTML = doc.lignes
      .map(
        (l, i) => `<div class="item-card">
          <label class="f"><span>Désignation</span><input data-line="${i}" data-k="desc" value="${esc(l.desc)}" placeholder="Sac de riz 25 kg"></label>
          <div class="grid2">
            <label class="f"><span>Quantité</span><input data-line="${i}" data-k="qte" value="${esc(l.qte)}" inputmode="decimal"></label>
            <label class="f"><span>Prix unitaire (FCFA)</span><input data-line="${i}" data-k="pu" value="${esc(l.pu)}" inputmode="decimal" placeholder="17500"></label>
          </div>
          <div class="line-foot"><small>Total ligne : <b data-lt="${i}"></b></small><button type="button" class="link-btn danger" data-remove="${i}">Supprimer</button></div>
        </div>`
      )
      .join('');
  }

  function update(animate = true) {
    const t = totals(doc);
    t.lines.forEach((l, i) => {
      const n = el.querySelector(`[data-lt="${i}"]`);
      if (n) n.textContent = `${fmt(l.total)} FCFA`;
    });
    const node = q('total');
    if (animate) tween(node, shown, t.total);
    else node.textContent = `${fmt(t.total)} FCFA`;
    shown = t.total;
    if (view === 'preview') q('paper').innerHTML = invoiceHTML(doc);
    save({ doc, counters });
  }

  function syncForm() {
    el.querySelectorAll('[data-f]').forEach((n) => (n.value = getPath(doc, n.dataset.f) ?? ''));
    el.querySelectorAll('[data-type]').forEach((b) => b.classList.toggle('on', b.dataset.type === doc.type));
    q('lim').textContent = doc.type === 'devis' ? "Valable jusqu'au" : 'Échéance de paiement';
    renderStyles();
    renderLines();
    update(false);
  }

  function setView(v) {
    view = v;
    el.querySelector('[data-view="form"]').hidden = v !== 'form';
    el.querySelector('[data-view="preview"]').hidden = v !== 'preview';
    el.querySelector('[data-act="toggle"]').textContent = v === 'form' ? 'Aperçu' : 'Modifier';
    if (v === 'preview') q('paper').innerHTML = invoiceHTML(doc);
    el.querySelector('.ov-body').scrollTop = 0;
  }

  const gate = () => {
    const s = INVOICE_STYLES.find((x) => x.id === doc.style);
    if (locked(doc.style)) {
      showPremium(`Facture : style ${s ? s.nom : ''}`);
      return false;
    }
    return true;
  };

  el.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.f) setPath(doc, t.dataset.f, t.value);
    else if (t.dataset.line !== undefined) doc.lignes[Number(t.dataset.line)][t.dataset.k] = t.value;
    else return;
    update();
  });

  el.addEventListener('click', async (e) => {
    const ty = e.target.closest('[data-type]');
    if (ty) {
      doc.type = ty.dataset.type;
      if (/^[FD]-\d+$/.test(doc.numero)) doc.numero = (doc.type === 'devis' ? 'D' : 'F') + doc.numero.slice(1);
      return syncForm();
    }
    const st = e.target.closest('[data-style]');
    if (st) {
      doc.style = st.dataset.style;
      renderStyles();
      update(false);
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      doc.lignes.splice(Number(rm.dataset.remove), 1);
      if (!doc.lignes.length) doc.lignes.push({ desc: '', qte: '1', pu: '' });
      renderLines();
      return update();
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'back') return view === 'preview' ? setView('form') : onBack();
    if (a === 'add') {
      doc.lignes.push({ desc: '', qte: '1', pu: '' });
      renderLines();
      update();
      const last = el.querySelectorAll('[data-line][data-k="desc"]');
      return last[last.length - 1].focus();
    }
    if (a === 'toggle') return setView(view === 'form' ? 'preview' : 'form');
    if (a === 'new') {
      if (!confirm('Commencer un nouveau document ? Votre entreprise est conservée.')) return;
      counters[doc.type] = (counters[doc.type] || 0) + 1;
      doc = blankDoc(doc.type, counters[doc.type], doc);
      syncForm();
      setView('form');
      return toast('Nouveau document prêt');
    }
    if (!gate()) return;
    const text = invoiceText(doc);
    if (a === 'copy') toast((await copyText(text)) ? 'Texte copié' : 'Copie impossible');
    if (a === 'share') {
      const r = await shareText(`${doc.type === 'devis' ? 'Devis' : 'Facture'} ${doc.numero}`, text);
      if (r === 'copied') toast('Texte copié');
      if (r === 'failed') toast('Partage impossible');
    }
    if (a === 'print') {
      el.classList.add('printing');
      document.body.dataset.print = '1';
      window.print();
    }
  });

  window.addEventListener('afterprint', () => {
    el.classList.remove('printing');
    delete document.body.dataset.print;
  });

  syncForm();

  return {
    el,
    onShow: () => {
      setView('form');
      syncForm();
    },
    refresh: renderStyles,
    hint: () => (doc.client.nom.trim() || num(doc.lignes[0].pu) ? `En cours : ${doc.numero}${doc.client.nom.trim() ? ` · ${doc.client.nom.trim()}` : ''}` : null),
  };
}
