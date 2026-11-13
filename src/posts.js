import { esc } from './cv.js';
import { CONFIG } from './config.js';
import { locked, showPremium, toast } from './premium.js';
import { copyText, shareText } from './native.js';
import { todayISO } from './invoice-core.js';
import { SECTEURS, TONS, PLATEFORMES, OBJECTIFS, blankBrief, buildPlan, buildPost, normalizePosts, jourLabel, postText, planText } from './posts-core.js';

const KEY = 'digiform.posts.v1';
const QUOTA_KEY = 'digiform.posts.quota.v1';
const read = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k) || 'null');
  } catch {
    return null;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* stockage plein */
  }
};

const aiConfigured = () => !!CONFIG.aiUrl;
const dailyLimit = () => CONFIG.aiDailyLimit || 5;
function quotaLeft() {
  const q = read(QUOTA_KEY);
  const used = q && q.date === todayISO() ? q.n : 0;
  return Math.max(0, dailyLimit() - used);
}
function useQuota() {
  const q = read(QUOTA_KEY);
  const n = q && q.date === todayISO() ? q.n + 1 : 1;
  write(QUOTA_KEY, { date: todayISO(), n });
}

async function askAI(brief) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 50000);
  try {
    const sec = SECTEURS.find((s) => s.id === brief.secteur);
    const res = await fetch(CONFIG.aiUrl, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', ...(CONFIG.aiToken ? { 'x-app-token': CONFIG.aiToken } : {}) },
      body: JSON.stringify({ brief: { ...brief, secteurNom: sec ? sec.nom : brief.secteur } }),
    });
    if (!res.ok) throw new Error(String(res.status));
    return normalizePosts(await res.json(), brief);
  } finally {
    clearTimeout(timer);
  }
}

export function createPostsRoom({ getIdentity, onBack }) {
  const saved = read(KEY);
  let brief = { ...blankBrief(), ...((saved && saved.brief) || {}) };
  let posts = (saved && saved.posts) || [];
  let source = (saved && saved.source) || 'modeles';
  let mode = aiConfigured() && !locked('posts-ia') ? 'ia' : 'modeles';
  let view = posts.length ? 'plan' : 'form';
  let busy = false;
  let timer = null;

  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = 'room-posts';
  el.hidden = true;
  el.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>Posts avec IA</strong></div>
    <div class="ov-body">
      <section data-v="form">
        <div class="card">
          <h2>Votre activité</h2>
          <label class="f"><span>Nom de l'entreprise</span><input data-b="nom" placeholder="Boutique Soleil"></label>
          <label class="f"><span>Domaine</span><select data-b="secteur">${SECTEURS.map((s) => `<option value="${s.id}">${esc(s.nom)}</option>`).join('')}</select></label>
          <label class="f"><span>Produits ou services</span><textarea rows="2" data-b="produit" placeholder="Robes, pagnes, chemises"></textarea></label>
          <div class="grid2">
            <label class="f"><span>Ville ou quartier</span><input data-b="ville" placeholder="Douala"></label>
            <label class="f"><span>WhatsApp</span><input data-b="contact" type="tel" placeholder="+237 6 00 00 00 00"></label>
          </div>
          <label class="f"><span>Offre du moment (facultatif)</span><input data-b="offre" placeholder="-20 % jusqu'à samedi"></label>
        </div>
        <div class="card">
          <h2>Style des posts</h2>
          <p class="hint">Ton</p><div class="chips-row" data-r="ton"></div>
          <p class="hint">Où publier</p><div class="chips-row" data-r="plateforme"></div>
          <p class="hint">Objectif</p><div class="chips-row" data-r="objectif"></div>
          <p class="hint">Nombre de jours</p><div class="chips-row" data-r="jours"></div>
          <label class="f"><span>Premier jour</span><input type="date" data-b="debut"></label>
        </div>
        <div class="card" data-r="mode-card">
          <h2>Écriture</h2>
          <div class="seg" data-r="mode"></div>
          <p class="mode-note" data-r="mode-note"></p>
        </div>
        <button type="button" class="primary" data-act="gen">Générer mes posts</button>
      </section>

      <section data-v="plan" hidden>
        <div class="plan-head"><strong data-r="plan-title"></strong></div>
        <div class="ltr-actions">
          <button type="button" class="primary" data-act="all-copy">Tout copier</button>
          <button type="button" class="btn2" data-act="all-share">Partager la semaine</button>
          <button type="button" class="btn2" data-act="edit">Modifier la fiche</button>
        </div>
        <div data-r="posts"></div>
      </section>
    </div>`;
  document.body.appendChild(el);
  const q = (r) => el.querySelector(`[data-r="${r}"]`);
  const back = el.querySelector('[data-act="back"]');

  function prefill() {
    const inv = read('digiform.inv.v1');
    const card = read('digiform.card.v1') || {};
    const e = (inv && inv.doc && inv.doc.emetteur) || {};
    const id = getIdentity() || {};
    if (!brief.nom.trim()) brief.nom = e.nom || card.entreprise || '';
    if (!brief.contact.trim()) brief.contact = card.whatsapp || card.tel || e.tel || id.tel || '';
    if (!brief.ville.trim()) brief.ville = (id.ville || '').split(',')[0].trim();
    if (!brief.debut) brief.debut = todayISO();
  }

  const flush = () => {
    clearTimeout(timer);
    write(KEY, { brief, posts, source });
  };
  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(flush, 300);
  };
  // on enregistre aussi dès qu'on quitte un champ ou que l'application passe en arrière-plan
  el.addEventListener('focusout', flush);
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => document.hidden && flush());

  function renderChips() {
    const row = (key, list) => {
      q(key).innerHTML = list.map((x) => `<button type="button" class="chip${String(brief[key]) === String(x.id) ? ' on' : ''}" data-pick="${key}:${x.id}">${esc(x.nom)}</button>`).join('');
    };
    row('ton', TONS);
    row('plateforme', PLATEFORMES);
    row('objectif', OBJECTIFS);
    row('jours', [3, 7, 14].map((n) => ({ id: n, nom: `${n} jours` })));
  }

  function renderMode() {
    const on = aiConfigured();
    q('mode').innerHTML =
      (on ? `<button type="button" data-mode="ia"${mode === 'ia' ? ' class="on"' : ''}>IA${locked('posts-ia') ? ' 🔒' : ''}</button>` : '') +
      `<button type="button" data-mode="modeles"${mode === 'modeles' ? ' class="on"' : ''}>Modèles</button>`;
    q('mode-note').textContent = !on
      ? 'Mode modèles : des textes prêts à personnaliser, sans IA ni connexion. L’IA se branche avec un serveur (voir le dossier worker).'
      : mode === 'ia'
        ? `L’IA écrit vos posts à partir de cette fiche, qui est envoyée à un serveur pour cela. Il vous reste ${quotaLeft()} génération(s) aujourd’hui.`
        : 'Modèles : des textes prêts à personnaliser, sans envoyer vos informations.';
  }

  function syncForm() {
    el.querySelectorAll('[data-b]').forEach((n) => (n.value = brief[n.dataset.b] ?? ''));
    renderChips();
    renderMode();
  }

  function renderPosts() {
    q('plan-title').textContent = `${posts.length} publications · ${source === 'ia' ? 'écrites par l’IA' : source === 'mixte' ? 'IA et modèles' : 'modèles (sans IA)'}`;
    q('posts').innerHTML = posts
      .map(
        (p, i) => `<article class="post-card" style="--i:${i}">
          <div class="post-top"><strong>${esc(p.date ? jourLabel(p.date) : `Jour ${i + 1}`)}</strong><span class="pill soon">${esc(p.titre)}</span></div>
          <textarea class="post-text" rows="7" data-post="${i}" data-k="legende">${esc(p.legende)}</textarea>
          <input class="post-tags" data-post="${i}" data-k="tags" value="${esc((p.hashtags || []).join(' '))}" placeholder="#hashtags" ${(p.hashtags || []).length || brief.plateforme !== 'whatsapp' ? '' : 'hidden'}>
          <p class="post-visu">🖼️ ${esc(p.visuel)}</p>
          <p class="post-time">Créneau suggéré : ${esc(p.heure)}</p>
          <div class="post-actions">
            <button type="button" class="btn2" data-act="copy" data-i="${i}">Copier</button>
            <button type="button" class="btn2" data-act="share" data-i="${i}">Partager</button>
            <button type="button" class="btn2" data-act="again" data-i="${i}">Autre version</button>
          </div>
        </article>`
      )
      .join('');
  }

  function setView(v) {
    view = v;
    el.querySelector('[data-v="form"]').hidden = v !== 'form';
    el.querySelector('[data-v="plan"]').hidden = v !== 'plan';
    back.textContent = v === 'plan' ? '← Fiche' : '← Accueil';
    if (v === 'form') syncForm();
    if (v === 'plan') renderPosts();
    el.querySelector('.ov-body').scrollTop = 0;
  }

  async function generate() {
    if (busy) return;
    if (!brief.nom.trim() && !brief.produit.trim()) return toast('Indiquez au moins le nom ou vos produits');
    busy = true;
    const btn = el.querySelector('[data-act="gen"]');
    btn.disabled = true;
    btn.textContent = mode === 'ia' ? 'L’IA écrit vos posts…' : 'Création…';
    let list = null;
    source = 'modeles';
    try {
      if (mode === 'ia') {
        if (locked('posts-ia')) showPremium('Posts : écriture par IA');
        else if (!quotaLeft()) toast('Limite du jour atteinte : version modèles utilisée');
        else {
          try {
            list = await askAI(brief);
            if (list.length) {
              useQuota();
              source = 'ia';
            } else list = null;
          } catch {
            toast('IA indisponible : version modèles utilisée');
          }
        }
      }
      if (!list) list = buildPlan(brief);
      else if (list.length < brief.jours) {
        const rest = buildPlan(brief).slice(list.length);
        list = [...list, ...rest];
        source = 'mixte';
      }
      posts = list;
      write(KEY, { brief, posts, source });
      setView('plan');
    } finally {
      busy = false;
      btn.disabled = false;
      btn.textContent = 'Générer mes posts';
    }
  }

  el.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.b) {
      brief[t.dataset.b] = t.value;
    } else if (t.dataset.post !== undefined) {
      const p = posts[Number(t.dataset.post)];
      if (t.dataset.k === 'legende') p.legende = t.value;
      else p.hashtags = t.value.split(/\s+/).filter(Boolean);
    } else return;
    persist();
  });

  el.addEventListener('click', async (e) => {
    const pick = e.target.closest('[data-pick]');
    if (pick) {
      const [k, v] = pick.dataset.pick.split(':');
      brief[k] = k === 'jours' ? Number(v) : v;
      renderChips();
      return persist();
    }
    const md = e.target.closest('[data-mode]');
    if (md) {
      if (md.dataset.mode === 'ia' && locked('posts-ia')) return showPremium('Posts : écriture par IA');
      mode = md.dataset.mode;
      return renderMode();
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    const i = Number(act.dataset.i);
    if (a === 'back') return view === 'plan' ? setView('form') : onBack();
    if (a === 'gen') return generate();
    if (a === 'edit') return setView('form');
    if (a === 'copy') return toast((await copyText(postText(posts[i]))) ? 'Post copié' : 'Copie impossible');
    if (a === 'share') {
      const r = await shareText(posts[i].titre, postText(posts[i]));
      if (r === 'copied') toast('Texte copié');
      if (r === 'failed') toast('Partage impossible');
      return;
    }
    if (a === 'again') {
      const old = posts[i];
      posts[i] = { ...buildPost(brief, i, (old.seed || 0) + 1), date: old.date };
      persist();
      renderPosts();
      return toast('Nouvelle version');
    }
    if (a === 'all-copy') return toast((await copyText(planText(posts))) ? 'Tous les posts copiés' : 'Copie impossible');
    if (a === 'all-share') {
      const r = await shareText('Mes posts de la semaine', planText(posts));
      if (r === 'copied') toast('Texte copié');
      if (r === 'failed') toast('Partage impossible');
    }
  });

  prefill();
  syncForm();

  return {
    el,
    onShow: () => {
      prefill();
      mode = aiConfigured() && !locked('posts-ia') ? mode : 'modeles';
      setView(posts.length ? 'plan' : 'form');
    },
    refresh: () => {
      renderMode();
    },
    hint: () => (posts.length ? `${posts.length} posts prêts, à publier` : null),
  };
}
