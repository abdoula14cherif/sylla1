import { esc } from './cv.js';
import { toast } from './premium.js';
import { copyText, shareText, openLink } from './native.js';
import { intl } from './card-core.js';
import { todayISO, dateFR } from './invoice-core.js';
import {
  STATUTS,
  MESSAGES,
  statutOf,
  blankApp,
  setStatut,
  dueState,
  dueLabel,
  isDue,
  stats,
  sortApps,
  agoLabel,
  buildMessage,
  defaultMessage,
  summaryText,
  hasRelance,
  addDays,
} from './suivi-core.js';

const KEY = 'digiform.suivi.v1';
const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const save = (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* stockage plein */
  }
};

export function createTrackerRoom({ getIdentity, onBack }) {
  let apps = load().map((a) => ({ ...blankApp(), ...a }));
  let view = 'list';
  let filter = 'all';
  let search = '';
  let curId = null;
  let kind = 'relance';
  let msgEdited = false;

  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = 'room-suivi';
  el.hidden = true;
  const input = (label, key, extra = '') => `<label class="f"><span>${label}</span><input data-f="${key}" ${extra}></label>`;
  el.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>Suivi des candidatures</strong></div>
    <div class="ov-body">
      <section data-view="list">
        <div class="sv-stats" data-r="stats"></div>
        <button type="button" class="sv-alert" data-act="due" data-r="alert" hidden></button>
        <label class="f"><input type="search" data-r="search" placeholder="Rechercher une entreprise ou un poste"></label>
        <div class="chips-row" data-r="chips"></div>
        <div class="sv-list" data-r="list"></div>
      </section>
      <section data-view="form" hidden>
        <div class="card">
          <h2>Candidature</h2>
          ${input('Entreprise', 'entreprise', 'placeholder="Orange Cameroun" autocomplete="organization"')}
          ${input('Poste', 'poste', 'placeholder="Chargé de clientèle"')}
          <div class="grid2">
            ${input('Envoyée le', 'date', 'type="date"')}
            ${input('Lien de l’offre', 'lien', 'placeholder="https://…"')}
          </div>
        </div>
        <div class="card">
          <h2>Où en êtes-vous ?</h2>
          <div class="seg wrap" data-r="statuts"></div>
          <label class="f gap-top"><span>Prochaine relance</span><input type="date" data-f="relance"></label>
          <p class="hint" data-r="duehint"></p>
          <div class="sv-histo" data-r="histo"></div>
        </div>
        <div class="card" data-r="msgcard">
          <h2>Message prêt à envoyer</h2>
          <div class="chips-row" data-r="kinds"></div>
          <label class="f"><textarea rows="9" data-r="msg"></textarea></label>
          <div class="ltr-actions">
            <button type="button" class="primary" data-act="wa">Envoyer sur WhatsApp</button>
            <button type="button" class="btn2" data-act="mail">Envoyer par email</button>
            <button type="button" class="btn2" data-act="copy">Copier le message</button>
          </div>
        </div>
        <div class="card">
          <h2>Contact chez l’employeur</h2>
          ${input('Nom du recruteur', 'contact', 'placeholder="Mme Ngono" autocomplete="off"')}
          <div class="grid2">
            ${input('Téléphone / WhatsApp', 'tel', 'type="tel" placeholder="+237 6 00 00 00 00"')}
            ${input('Email', 'email', 'type="email" placeholder="rh@entreprise.com"')}
          </div>
        </div>
        <div class="card">
          <h2>Notes</h2>
          <label class="f"><textarea rows="4" data-f="notes" placeholder="Questions posées, salaire évoqué, prochaine étape…"></textarea></label>
        </div>
      </section>
    </div>
    <div class="inv-bar" data-r="bar"></div>`;
  document.body.appendChild(el);
  const q = (r) => el.querySelector(`[data-r="${r}"]`);
  const persist = () => save(apps);
  const cur = () => apps.find((a) => a.id === curId) || null;
  const me = () => {
    const id = getIdentity() || {};
    return { nom: id.nom || '', tel: id.tel || '' };
  };

  /* ---------- Liste ---------- */
  function renderStats() {
    const s = stats(apps);
    q('stats').innerHTML = `
      <div class="sv-tile"><b>${s.total}</b><span>Candidatures</span></div>
      <div class="sv-tile${s.due ? ' warn' : ''}"><b>${s.due}</b><span>À relancer</span></div>
      <div class="sv-tile"><b>${s.entretiens}</b><span>Entretiens</span></div>
      <div class="sv-tile ok"><b>${s.offres}</b><span>Offres</span></div>`;
    const al = q('alert');
    al.hidden = !s.due;
    if (s.due) al.textContent = `${s.due} relance${s.due > 1 ? 's' : ''} à faire aujourd'hui : voir la liste`;
  }

  function renderChips() {
    const s = stats(apps);
    const chips = [{ id: 'all', nom: `Toutes (${s.total})` }];
    if (s.due) chips.push({ id: 'due', nom: `À relancer (${s.due})` });
    STATUTS.forEach((st) => chips.push({ id: st.id, nom: `${st.nom} (${s.count(st.id)})` }));
    q('chips').innerHTML = chips.map((c) => `<button type="button" class="chip${filter === c.id ? ' on' : ''}" data-filter="${c.id}">${esc(c.nom)}</button>`).join('');
  }

  function renderList() {
    const t = todayISO();
    const needle = search.trim().toLowerCase();
    const rows = sortApps(apps, t).filter((a) => {
      if (filter === 'due' && !isDue(a, t)) return false;
      if (filter !== 'all' && filter !== 'due' && a.statut !== filter) return false;
      return !needle || `${a.entreprise} ${a.poste} ${a.contact}`.toLowerCase().includes(needle);
    });
    if (!apps.length) {
      q('list').innerHTML = `<div class="sv-empty"><strong>Aucune candidature pour l'instant</strong><p>Ajoutez chaque candidature envoyée. Digiform vous rappelle quand relancer et prépare le message.</p></div>`;
      return;
    }
    if (!rows.length) {
      q('list').innerHTML = `<div class="sv-empty"><p>Aucun résultat.</p></div>`;
      return;
    }
    q('list').innerHTML = rows
      .map((a, i) => {
        const st = statutOf(a.statut);
        const due = dueState(a, t);
        return `<div class="sv-item" role="button" tabindex="0" style="--i:${i}" data-id="${a.id}">
          <span class="sv-top"><strong>${esc(a.entreprise.trim() || 'Entreprise')}</strong><em class="sv-pill" style="color:${st.tone};background:${st.bg}">${esc(st.nom)}</em></span>
          <span class="sv-poste">${esc(a.poste.trim() || 'Poste à préciser')}</span>
          <span class="sv-meta"><span>${a.date ? `Envoyée ${esc(agoLabel(a.date, t))}` : ''}</span>${due ? `<span class="sv-due ${due.kind}">${esc(dueLabel(due))}</span>` : ''}</span>
          ${due && (due.kind === 'late' || due.kind === 'today') ? `<button type="button" class="sv-quick" data-quick="${a.id}">Relancer maintenant</button>` : ''}
        </div>`;
      })
      .join('');
  }

  function renderBar() {
    q('bar').innerHTML =
      view === 'list'
        ? `<button type="button" class="btn2 sv-share" data-act="recap"${apps.length ? '' : ' disabled'}>Partager le récap</button><button type="button" class="primary" data-act="add">Ajouter</button>`
        : `<button type="button" class="btn2 sv-share danger-btn" data-act="del">Supprimer</button><button type="button" class="primary" data-act="done">Terminé</button>`;
  }

  function renderAll() {
    renderStats();
    renderChips();
    renderList();
  }

  /* ---------- Fiche ---------- */
  function renderStatuts() {
    const a = cur();
    if (!a) return;
    q('statuts').innerHTML = STATUTS.map((s) => `<button type="button" data-statut="${s.id}"${a.statut === s.id ? ' class="on"' : ''}>${esc(s.nom)}</button>`).join('');
    const due = dueState(a);
    q('duehint').textContent = hasRelance(a.statut)
      ? due
        ? `${dueLabel(due)} (${dateFR(a.relance)})`
        : 'Choisissez une date pour être rappelé'
      : 'Pas de relance prévue à ce stade.';
    q('histo').innerHTML = (a.histo || [])
      .slice()
      .reverse()
      .map((h) => `<div><span>${esc(dateFR(h.date))}</span><b style="color:${statutOf(h.statut).tone}">${esc(statutOf(h.statut).nom)}</b></div>`)
      .join('');
  }

  function renderKinds() {
    q('kinds').innerHTML = MESSAGES.map((m) => `<button type="button" class="chip${kind === m.id ? ' on' : ''}" data-kind="${m.id}">${esc(m.nom)}</button>`).join('');
  }

  function regenMessage(force = false) {
    const a = cur();
    if (!a || (msgEdited && !force)) return;
    q('msg').value = buildMessage(a, kind, me()).body;
    msgEdited = false;
  }

  function syncForm() {
    const a = cur();
    if (!a) return;
    el.querySelectorAll('[data-f]').forEach((n) => (n.value = a[n.dataset.f] ?? ''));
    renderStatuts();
    renderKinds();
    regenMessage(true);
  }

  function setView(v) {
    view = v;
    el.querySelector('[data-view="list"]').hidden = v !== 'list';
    el.querySelector('[data-view="form"]').hidden = v !== 'form';
    el.querySelector('[data-act="back"]').textContent = v === 'list' ? '← Accueil' : '← Liste';
    renderBar();
    el.querySelector('.ov-body').scrollTop = 0;
  }

  function openApp(id, toMessage = false) {
    curId = id;
    const a = cur();
    kind = defaultMessage(a.statut);
    msgEdited = false;
    syncForm();
    setView('form');
    if (toMessage) {
      q('msgcard').scrollIntoView({ block: 'start' });
    }
  }

  function toList() {
    curId = null;
    persist();
    renderAll();
    setView('list');
  }

  // Après l'envoi d'une relance : on décale automatiquement la prochaine relance
  function markRelanced() {
    const a = cur();
    if (!a || kind !== 'relance' || !['envoyee', 'relancee'].includes(a.statut)) return;
    const t = todayISO();
    if (a.statut === 'envoyee') setStatut(a, 'relancee', t);
    else {
      // déjà relancée : on garde le statut, on note la nouvelle relance et on repousse la date
      a.histo = [...(a.histo || []), { date: t, statut: 'relancee' }];
      a.relance = addDays(t, 7);
    }
    persist();
    el.querySelector('[data-f="relance"]').value = a.relance;
    renderStatuts();
    toast('Marquée comme relancée, prochaine relance dans 7 jours');
  }

  /* ---------- Événements ---------- */
  el.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.r === 'search') {
      search = t.value;
      return renderList();
    }
    if (t.dataset.r === 'msg') {
      msgEdited = true;
      return;
    }
    const a = cur();
    if (!a || !t.dataset.f) return;
    a[t.dataset.f] = t.value;
    persist();
    if (t.dataset.f === 'relance') renderStatuts();
    else regenMessage();
  });

  el.addEventListener('click', async (e) => {
    const t = e.target;
    const quick = t.closest('[data-quick]');
    if (quick) return openApp(quick.dataset.quick, true);
    const item = t.closest('.sv-item');
    if (item) return openApp(item.dataset.id);
    const fl = t.closest('[data-filter]');
    if (fl) {
      filter = fl.dataset.filter;
      renderChips();
      return renderList();
    }
    const st = t.closest('[data-statut]');
    if (st) {
      const a = cur();
      setStatut(a, st.dataset.statut);
      kind = defaultMessage(a.statut);
      persist();
      syncForm();
      return;
    }
    const kd = t.closest('[data-kind]');
    if (kd) {
      kind = kd.dataset.kind;
      msgEdited = false;
      renderKinds();
      return regenMessage(true);
    }
    const act = t.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'back') return view === 'form' ? toList() : onBack();
    if (a === 'due') {
      filter = 'due';
      renderChips();
      return renderList();
    }
    if (a === 'add') {
      const n = blankApp();
      apps.unshift(n);
      filter = 'all';
      search = '';
      q('search').value = '';
      persist();
      openApp(n.id);
      return el.querySelector('[data-f="entreprise"]').focus();
    }
    if (a === 'done') return toList();
    if (a === 'del') {
      if (!confirm('Supprimer cette candidature ?')) return;
      apps = apps.filter((x) => x.id !== curId);
      toList();
      return toast('Candidature supprimée');
    }
    if (a === 'recap') {
      const r = await shareText('Mes candidatures', summaryText(apps));
      if (r === 'copied') toast('Récapitulatif copié');
      if (r === 'failed') toast('Partage impossible');
      return;
    }
    const app = cur();
    if (!app) return;
    const text = q('msg').value;
    if (a === 'copy') return toast((await copyText(text)) ? 'Message copié' : 'Copie impossible');
    if (a === 'wa') {
      const n = intl(app.tel);
      if (n) openLink(`https://wa.me/${n}?text=${encodeURIComponent(text)}`);
      else {
        const r = await shareText('Ma candidature', text);
        if (r === 'copied') toast('Message copié');
        if (r === 'failed' || r === 'cancelled') return;
      }
      return markRelanced();
    }
    if (a === 'mail') {
      const { subject } = buildMessage(app, kind, me());
      openLink(`mailto:${encodeURI(app.email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`);
      return markRelanced();
    }
  });

  el.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('sv-item')) {
      e.preventDefault();
      openApp(e.target.dataset.id);
    }
  });

  renderAll();
  renderBar();

  return {
    el,
    onShow: () => {
      filter = 'all';
      search = '';
      q('search').value = '';
      toList();
    },
    refresh: () => {},
    hint: () => {
      if (!apps.length) return null;
      const due = apps.filter((a) => isDue(a)).length;
      return due ? `${due} candidature${due > 1 ? 's' : ''} à relancer` : `${apps.length} candidature${apps.length > 1 ? 's' : ''} suivie${apps.length > 1 ? 's' : ''}`;
    },
  };
}
