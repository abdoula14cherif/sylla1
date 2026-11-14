import { esc } from './cv.js';
import { locked, showPremium, toast } from './premium.js';
import { copyText, isNative } from './native.js';
import { exportDocument, printPage } from './pdf.js';
import { PAGES, PALETTE, isHex } from './design.js';
import { getAssets, setAsset, clearAsset, onAssets } from './assets.js';
import { INVOICE_STYLES, DOC_TYPES, PAYS, MODELES, DEVISES, blankDoc, invoiceHTML, invoiceText, totals, fmtMoney, num, defaultObj } from './invoice-core.js';

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
function tween(node, from, to, devise) {
  cancelAnimationFrame(node._raf);
  const t0 = performance.now();
  const sym = (DEVISES[devise] || DEVISES.FCFA).sym;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 280);
    node.textContent = `${fmtMoney(from + (to - from) * (1 - Math.pow(1 - k, 3)), devise)} ${sym}`;
    if (k < 1) node._raf = requestAnimationFrame(step);
  };
  node._raf = requestAnimationFrame(step);
}

// Réduit un logo importé (garde la transparence)
function fileToLogo(file, cb) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 420 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/png'));
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

export function createInvoiceRoom({ onBack, goStamp }) {
  const saved = load();
  let counters = (saved && saved.counters) || { facture: 1 };
  const TV = (v) => String(v).replace('.', ',');
  const base = blankDoc((saved && saved.doc && saved.doc.type) || 'facture', 1);
  const sd = (saved && saved.doc) || {};
  let doc = {
    ...base,
    ...sd,
    emetteur: { ...base.emetteur, ...sd.emetteur },
    client: { ...base.client, ...sd.client },
    cachet: { ...base.cachet, ...sd.cachet },
    signature: { ...base.signature, ...sd.signature },
  };
  if (!Array.isArray(doc.lignes) || !doc.lignes.length) doc.lignes = [{ desc: '', qte: '1', pu: '' }];
  let view = 'form';
  let zoom = 'fit';
  let placing = null;
  let busy = false;
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
          <div class="seg wrap">${Object.entries(DOC_TYPES).map(([k, v]) => `<button type="button" data-type="${k}">${v.nom}</button>`).join('')}</div>
          <p class="hint">Pays (adapte la devise, la TVA et les identifiants)</p>
          <label class="f"><select data-f="pays">${Object.entries(PAYS).map(([k, v]) => `<option value="${k}">${v.drap} ${v.nom}</option>`).join('')}</select></label>
          <p class="hint" data-r="pays-note"></p>
          <button type="button" class="link-btn" data-act="apply-tva" hidden></button>
          <p class="hint">Modèle d'activité (lignes d'exemple à modifier)</p>
          <div class="seg wrap" data-r="modeles">${MODELES.map((m) => `<button type="button" data-modele="${m.id}">${esc(m.nom)}</button>`).join('')}</div>
          <p class="hint">Style</p>
          <div class="seg wrap" data-r="styles"></div>
          <p class="hint">Couleur</p>
          <div class="sw sw-big" data-r="colors"></div>
          <p class="hint">Format de page</p>
          <div class="seg" data-r="formats"></div>
          <div class="grid2 gap-top">${input('Numéro', 'numero')}${input('Date', 'date', 'type="date"')}</div>
          <label class="f"><span data-r="lim">Échéance de paiement</span><input type="date" data-f="echeance"></label>
        </div>
        <div class="card">
          <h2>Votre entreprise</h2>
          <div class="photo-row">
            <div class="logo-prev" data-r="logo-prev"></div>
            <div><label class="link-btn" for="inv-logo">Ajouter mon logo</label><button type="button" class="link-btn danger" data-act="del-logo" hidden>Retirer</button><input type="file" id="inv-logo" accept="image/*" hidden></div>
          </div>
          ${input('Nom', 'emetteur.nom', 'autocomplete="organization"')}
          ${input('Adresse', 'emetteur.adresse')}
          <div class="grid2">${input('Téléphone', 'emetteur.tel', 'type="tel"')}${input('Email', 'emetteur.email', 'type="email"')}</div>
          ${input('Forme juridique et capital (ex. SARL au capital de 1 000 000 FCFA)', 'emetteur.forme')}
          <div class="grid2"><label class="f"><span data-r="id1">NIU</span><input data-f="emetteur.niu"></label><label class="f"><span data-r="id2">RCCM</span><input data-f="emetteur.rccm"></label></div>
          ${input('Compte bancaire / IBAN (facultatif)', 'emetteur.compte')}
        </div>
        <div class="card">
          <h2>Client</h2>
          ${input('Nom', 'client.nom')}
          ${input('Adresse', 'client.adresse')}
          ${input('Téléphone', 'client.tel', 'type="tel"')}
          ${input('NIU du client (facultatif, utile pour les entreprises)', 'client.niu')}
          ${input('Objet du document (facultatif)', 'objet')}
        </div>
        <div class="card">
          <h2>Lignes</h2>
          <div data-r="lines"></div>
          <button type="button" class="link-btn" data-act="add">Ajouter une ligne</button>
        </div>
        <div class="card">
          <h2>Montants et paiement</h2>
          <div class="grid2">${input('TVA en %', 'tva', 'inputmode="decimal"')}${input('Remise en %', 'remise', 'inputmode="decimal"')}</div>
          <div class="grid2">${input('Acompte déjà versé', 'acompte', 'inputmode="decimal"')}
            <label class="f"><span>Devise</span><select data-f="devise">${Object.entries(DEVISES).map(([k, v]) => `<option value="${k}">${v.nom}</option>`).join('')}</select></label></div>
          <label class="f"><span>Paiement (MoMo, Orange Money, banque…)</span><textarea rows="2" data-f="paiement"></textarea></label>
          <label class="f"><span>Conditions et mentions (garantie, délai, pénalités…)</span><textarea rows="3" data-f="conditions"></textarea></label>
          <label class="f"><span>Notes</span><textarea rows="2" data-f="notes"></textarea></label>
        </div>
        <div class="card"><button type="button" class="btn2 wide" data-act="new">Nouveau document</button></div>
      </section>

      <section data-view="preview" hidden>
        <div class="ltr-actions">
          <button type="button" class="primary" data-act="pdf">${isNative ? 'Partager le PDF' : 'Télécharger le PDF'}</button>
          <button type="button" class="btn2" data-act="copy">Copier le texte</button>
          <button type="button" class="btn2" data-act="print"${isNative ? ' hidden' : ''}>Imprimer</button>
        </div>
        <div class="card" data-r="seal">
          <h2>Cachet et signature</h2>
          <label class="chk"><input type="checkbox" data-obj-on="cachet"> Apposer mon cachet <small data-r="no-cachet" hidden>(aucun cachet : <a href="#/cachet" data-act="goto-stamp">le créer</a>)</small></label>
          <label class="chk"><input type="checkbox" data-obj-on="signature"> Apposer ma signature <small data-r="no-signature" hidden>(aucune signature : <a href="#/cachet" data-act="goto-stamp">l'ajouter</a>)</small></label>
          <div data-r="placer" hidden>
            <div class="seg gap-top"><button type="button" data-place="cachet">Placer le cachet</button><button type="button" data-place="signature">Placer la signature</button></div>
            <p class="hint" data-r="place-hint">Touchez la facture à l'endroit voulu.</p>
            <label class="rng"><span>Taille</span><input type="range" min="8" max="45" data-rng="size"></label>
            <label class="rng"><span>Rotation</span><input type="range" min="-45" max="45" data-rng="rot"></label>
            <button type="button" class="btn2 wide" data-act="done-place">Terminé</button>
          </div>
        </div>
        <div class="seg zoom" data-r="zoom"><button type="button" data-zoom="fit" class="on">Ajusté</button><button type="button" data-zoom="full">100 %</button></div>
        <div class="paper-scroll" data-r="scroll"><div class="paper-wrap" data-r="paper"></div></div>
      </section>
    </div>
    <div class="inv-bar">
      <div><small>Total</small><strong data-r="total">0 FCFA</strong></div>
      <button type="button" class="primary" data-act="toggle">Aperçu</button>
    </div>`;
  document.body.appendChild(el);
  const q = (r) => el.querySelector(`[data-r="${r}"]`);
  const pageOf = () => PAGES[doc.format] || PAGES.A4;

  /* ----- Rendu des contrôles ----- */
  function renderPays() {
    const P = PAYS[doc.pays] || PAYS.CM;
    q('id1').textContent = `${P.id1} (numéro de contribuable)`;
    q('id2').textContent = P.id2;
    const b = el.querySelector('[data-act="apply-tva"]');
    const diff = String(num(doc.tva)) !== String(num(P.tva));
    q('pays-note').textContent = P.tvaNote || 'TVA : renseignez le taux applicable dans votre pays.';
    b.hidden = !(diff && num(P.tva) > 0);
    b.textContent = `Appliquer la TVA ${TV(P.tva)} %`;
  }
  function renderStyles() {
    q('styles').innerHTML = INVOICE_STYLES.map((s) => `<button type="button" data-style="${s.id}"${doc.style === s.id ? ' class="on"' : ''}>${esc(s.nom)}${locked(s.id) ? ' 🔒' : ''}</button>`).join('');
  }
  function renderColors() {
    q('colors').innerHTML =
      PALETTE.map((c) => `<button type="button" data-color="${c}" style="background:${c}"${c.toLowerCase() === String(doc.couleur).toLowerCase() ? ' class="on"' : ''} aria-label="${c}"></button>`).join('') +
      `<label class="color-custom" title="Couleur personnalisée"><input type="color" data-f-color value="${isHex(doc.couleur) ? doc.couleur : '#14213D'}"></label>`;
  }
  function renderFormats() {
    q('formats').innerHTML = ['A4', 'A5', 'Letter'].map((f) => `<button type="button" data-format="${f}"${doc.format === f ? ' class="on"' : ''}>${PAGES[f].nom}</button>`).join('');
  }
  function renderLogo() {
    const l = getAssets().logo;
    q('logo-prev').style.backgroundImage = l ? `url(${l})` : '';
    el.querySelector('[data-act="del-logo"]').hidden = !l;
  }
  function renderLines() {
    q('lines').innerHTML = doc.lignes
      .map(
        (l, i) => `<div class="item-card">
          <label class="f"><span>Désignation</span><input data-line="${i}" data-k="desc" value="${esc(l.desc)}" placeholder="Sac de riz 25 kg"></label>
          <div class="grid2">
            <label class="f"><span>Quantité</span><input data-line="${i}" data-k="qte" value="${esc(l.qte)}" inputmode="decimal"></label>
            <label class="f"><span>Prix unitaire</span><input data-line="${i}" data-k="pu" value="${esc(l.pu)}" inputmode="decimal" placeholder="17500"></label>
          </div>
          <div class="line-foot"><small>Total ligne : <b data-lt="${i}"></b></small><button type="button" class="link-btn danger" data-remove="${i}">Supprimer</button></div>
        </div>`
      )
      .join('');
  }
  function renderSeal() {
    const A = getAssets();
    ['cachet', 'signature'].forEach((k) => {
      const cb = el.querySelector(`[data-obj-on="${k}"]`);
      cb.disabled = !A[k];
      cb.checked = !!(A[k] && doc[k].on);
      q(`no-${k}`).hidden = !!A[k];
    });
    const any = ['cachet', 'signature'].some((k) => A[k] && doc[k].on);
    q('placer').hidden = !any;
    if (any) {
      if (!placing || !(A[placing] && doc[placing].on)) placing = ['cachet', 'signature'].find((k) => A[k] && doc[k].on);
      el.querySelectorAll('[data-place]').forEach((b) => {
        b.classList.toggle('on', b.dataset.place === placing);
        b.hidden = !(A[b.dataset.place] && doc[b.dataset.place].on);
      });
      el.querySelector('[data-rng="size"]').value = doc[placing].size;
      el.querySelector('[data-rng="rot"]').value = doc[placing].rot;
    } else {
      placing = null;
    }
    q('paper').classList.toggle('placing', !!placing);
  }
  function fitPaper() {
    const holder = q('paper');
    const paper = holder.firstElementChild;
    const avail = q('scroll').clientWidth;
    if (!paper || !avail) return;
    const s = zoom === 'fit' ? Math.min(1, avail / pageOf().w) : 1;
    paper.style.transform = `scale(${s})`;
    holder.style.width = `${pageOf().w * s}px`;
    holder.style.height = `${paper.offsetHeight * s}px`;
  }
  function renderPaper() {
    q('paper').innerHTML = invoiceHTML(doc, getAssets(), pageOf());
    fitPaper();
  }

  function update(animate = true) {
    const t = totals(doc);
    t.lines.forEach((l, i) => {
      const n = el.querySelector(`[data-lt="${i}"]`);
      if (n) n.textContent = fmtMoney(l.total, doc.devise);
    });
    const node = q('total');
    if (animate) tween(node, shown, t.total, doc.devise);
    else node.textContent = `${fmtMoney(t.total, doc.devise)} ${(DEVISES[doc.devise] || DEVISES.FCFA).sym}`;
    shown = t.total;
    if (view === 'preview') renderPaper();
    save({ doc, counters });
  }

  function syncForm() {
    el.querySelectorAll('[data-f]').forEach((n) => (n.value = getPath(doc, n.dataset.f) ?? ''));
    el.querySelectorAll('[data-type]').forEach((b) => b.classList.toggle('on', b.dataset.type === doc.type));
    q('lim').textContent = doc.type === 'devis' || doc.type === 'proforma' ? "Valable jusqu'au" : 'Échéance de paiement';
    renderPays();
    el.querySelectorAll('[data-modele]').forEach((m) => m.classList.remove('on'));
    renderStyles();
    renderColors();
    renderFormats();
    renderLogo();
    renderLines();
    renderSeal();
    update(false);
  }

  function setView(v) {
    view = v;
    el.querySelector('[data-view="form"]').hidden = v !== 'form';
    el.querySelector('[data-view="preview"]').hidden = v !== 'preview';
    el.querySelector('[data-act="toggle"]').textContent = v === 'form' ? 'Aperçu' : 'Modifier';
    if (v === 'preview') {
      renderSeal();
      renderPaper();
    }
    el.querySelector('.ov-body').scrollTop = 0;
  }

  const gate = () => {
    if (locked(doc.style)) {
      const s = INVOICE_STYLES.find((x) => x.id === doc.style);
      showPremium(`Facture : style ${s ? s.nom : ''}`);
      return false;
    }
    return true;
  };

  async function exportPDF() {
    if (busy || !gate()) return;
    busy = true;
    toast('Création du PDF…');
    const name = DOC_TYPES[doc.type].court;
    try {
      const r = await exportDocument({
        fmt: doc.format,
        filename: `${name}-${doc.numero}.pdf`.replace(/[^\w.-]+/g, '-'),
        title: `${name} ${doc.numero}`,
        build: (stage, page) => {
          stage.innerHTML = invoiceHTML(doc, getAssets(), page, { pdf: true });
          const n = stage.firstElementChild;
          n.style.position = 'relative';
          n.style.transform = 'none';
          n.style.boxShadow = 'none';
          n.style.borderRadius = '0';
          return n;
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

  function applyPays() {
    const P = PAYS[doc.pays] || PAYS.CM;
    doc.devise = P.devise;
    if (!doc.paiement.trim()) doc.paiement = P.paiement;
    if (!doc.conditions.trim()) doc.conditions = P.conditions;
    syncForm();
  }

  /* ----- Événements ----- */
  el.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.f) setPath(doc, t.dataset.f, t.value);
    else if ('fColor' in t.dataset) {
      doc.couleur = t.value;
      renderColors();
    } else if (t.dataset.line !== undefined) doc.lignes[Number(t.dataset.line)][t.dataset.k] = t.value;
    else if (t.dataset.rng && placing) doc[placing][t.dataset.rng] = Number(t.value);
    else return;
    if (t.dataset.f === 'pays') applyPays();
    if (t.dataset.f === 'tva') renderPays();
    update(!t.dataset.rng);
  });

  el.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.objOn) {
      const k = t.dataset.objOn;
      doc[k].on = t.checked;
      if (t.checked) placing = k;
      renderSeal();
      update(false);
    }
    if (t.id === 'inv-logo' && t.files && t.files[0]) {
      fileToLogo(t.files[0], (png) => {
        setAsset('logo', png);
        toast('Logo ajouté');
      });
      t.value = '';
    }
  });

  // Toucher la facture = placer le cachet ou la signature à cet endroit
  q('paper').addEventListener('click', (e) => {
    if (!placing) return;
    const paper = q('paper').firstElementChild;
    if (!paper) return;
    const r = paper.getBoundingClientRect();
    doc[placing].x = Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)) * 10) / 10;
    doc[placing].y = Math.round(Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) * 10) / 10;
    doc[placing].on = true;
    update(false);
    renderSeal();
  });

  el.addEventListener('click', async (e) => {
    const ty = e.target.closest('[data-type]');
    if (ty) {
      doc.type = ty.dataset.type;
      if (/^[A-Z]{1,2}-\d+$/.test(doc.numero)) doc.numero = `${DOC_TYPES[doc.type].p}-${String(counters[doc.type] || 1).padStart(4, '0')}`;
      return syncForm();
    }
    const mo = e.target.closest('[data-modele]');
    if (mo) {
      const m = MODELES.find((x) => x.id === mo.dataset.modele);
      const filled = doc.lignes.some((l) => l.desc.trim() || num(l.pu));
      if (filled && !confirm('Remplacer vos lignes actuelles par ce modèle d’exemple ?')) return;
      doc.lignes = m.lignes.map(([desc, qte, pu]) => ({ desc, qte, pu }));
      doc.objet = m.objet;
      doc.conditions = m.conditions;
      syncForm();
      el.querySelectorAll('[data-modele]').forEach((b) => b.classList.toggle('on', b === mo));
      return toast('Modèle appliqué : modifiez les lignes');
    }
    const st = e.target.closest('[data-style]');
    if (st) { doc.style = st.dataset.style; renderStyles(); return update(false); }
    const co = e.target.closest('[data-color]');
    if (co) { doc.couleur = co.dataset.color; renderColors(); return update(false); }
    const fm = e.target.closest('[data-format]');
    if (fm) { doc.format = fm.dataset.format; renderFormats(); return update(false); }
    const pl = e.target.closest('[data-place]');
    if (pl) { placing = pl.dataset.place; return renderSeal(); }
    const zm = e.target.closest('[data-zoom]');
    if (zm) {
      zoom = zm.dataset.zoom;
      el.querySelectorAll('[data-zoom]').forEach((b) => b.classList.toggle('on', b === zm));
      return fitPaper();
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
    if (a === 'apply-tva') { doc.tva = (PAYS[doc.pays] || PAYS.CM).tva; syncForm(); return toast('TVA appliquée'); }
    if (a === 'goto-stamp') { e.preventDefault(); return goStamp(); }
    if (a === 'back') return view === 'preview' ? setView('form') : onBack();
    if (a === 'add') {
      doc.lignes.push({ desc: '', qte: '1', pu: '' });
      renderLines();
      update();
      const last = el.querySelectorAll('[data-line][data-k="desc"]');
      return last[last.length - 1].focus();
    }
    if (a === 'toggle') return setView(view === 'form' ? 'preview' : 'form');
    if (a === 'done-place') { placing = null; el.querySelector('[data-r="placer"]').hidden = true; q('paper').classList.remove('placing'); return; }
    if (a === 'del-logo') { clearAsset('logo'); return toast('Logo retiré'); }
    if (a === 'new') {
      if (!confirm('Commencer un nouveau document ? Votre entreprise, votre logo et votre cachet sont conservés.')) return;
      counters[doc.type] = (counters[doc.type] || 1) + 1;
      doc = blankDoc(doc.type, counters[doc.type], doc);
      syncForm();
      setView('form');
      return toast('Nouveau document prêt');
    }
    if (a === 'pdf') return exportPDF();
    if (a === 'copy') {
      if (!gate()) return;
      return toast((await copyText(invoiceText(doc))) ? 'Texte copié' : 'Copie impossible');
    }
    if (a === 'print') {
      if (!gate()) return;
      el.classList.add('printing');
      document.body.dataset.print = '1';
      printPage(doc.format);
    }
  });

  window.addEventListener('afterprint', () => {
    el.classList.remove('printing');
    delete document.body.dataset.print;
  });
  window.addEventListener('resize', fitPaper);
  onAssets(() => {
    renderLogo();
    renderSeal();
    if (view === 'preview') renderPaper();
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
