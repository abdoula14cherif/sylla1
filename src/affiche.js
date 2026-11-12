import { esc } from './cv.js';
import { locked, showPremium, toast } from './premium.js';
import { copyText, shareText, shareFiles, saveFile, isNative } from './native.js';
import { loadImage } from './card-core.js';
import { FORMATS, formatOf, AFFICHE_DESIGNS, AFFICHE_COLORS, THEMES, blankAffiche, isEmptyAff, withDemoAff, renderAffiche, afficheText } from './affiche-core.js';

const KEY = 'digiform.affiche.v1';
const CARD_KEY = 'digiform.card.v1';
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
const readCard = () => {
  try {
    return JSON.parse(localStorage.getItem(CARD_KEY) || 'null');
  } catch {
    return null;
  }
};

const slug = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
const toBlob = (canvas) => new Promise((res) => canvas.toBlob(res, 'image/png'));

export function createAfficheRoom({ onBack }) {
  let state = { ...blankAffiche(), ...(load() || {}) };
  let imgs = { photo: null, logo: null };
  let raf = 0;
  let thumbTimer = 0;

  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = 'room-affiches';
  el.hidden = true;
  const input = (label, key, extra = '') => `<label class="f"><span>${label}</span><input data-f="${key}" ${extra}></label>`;
  el.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>Affiches</strong></div>
    <div class="ov-body">
      <div class="cd-stage">
        <canvas class="af-canvas" data-r="canvas"></canvas>
        <div class="cd-bar"><div class="seg" data-r="formats"></div></div>
        <span class="cd-demo" data-r="demo" hidden>Exemple : modifiez les textes ci-dessous</span>
      </div>

      <div class="card">
        <h2>Pour quel usage ?</h2>
        <div class="chips-row" data-r="themes"></div>
        <p class="hint">Un thème remplit des textes d'exemple que vous modifiez ensuite.</p>
      </div>

      <div class="card">
        <h2>Modèle</h2>
        <div class="cd-designs" data-r="designs"></div>
        <p class="hint">Couleur</p>
        <div class="cd-colors" data-r="colors"></div>
      </div>

      <div class="card">
        <h2>Message</h2>
        ${input('Accroche (petite étiquette)', 'accroche', 'placeholder="Promotion"')}
        ${input('Titre', 'titre', 'placeholder="Jusqu’à *-50%* sur toute la boutique"')}
        <p class="hint">Astuce : mettez un mot entre étoiles, comme *-50%*, pour le faire ressortir en surbrillance.</p>
        ${input('Sous-titre', 'sousTitre', 'placeholder="Une semaine pour faire de bonnes affaires"')}
        <label class="f"><span>Points forts (un par ligne, 6 maximum)</span><textarea rows="4" data-f="points" placeholder="Livraison gratuite&#10;Paiement MoMo et Orange Money"></textarea></label>
      </div>

      <div class="card">
        <h2>Prix, date et lieu</h2>
        <div class="grid2">
          ${input('Texte avant le prix', 'prixLabel', 'placeholder="À partir de"')}
          ${input('Prix', 'prix', 'placeholder="5 000 FCFA"')}
        </div>
        ${input('Quand', 'quand', 'placeholder="Samedi 21 novembre à 10h"')}
        ${input('Où', 'lieu', 'placeholder="Akwa, Douala"')}
      </div>

      <div class="card">
        <h2>Bouton et autocollant</h2>
        ${input('Bouton d’action', 'bouton', 'placeholder="Commander maintenant"')}
        ${input('Lien affiché (site, WhatsApp…)', 'lien', 'placeholder="www.monsite.com"')}
        ${input('Autocollant en étoile', 'sticker', 'placeholder="-50% ou Livraison gratuite"')}
        <p class="hint">Chacun est facultatif : laissez vide pour ne pas l’afficher.</p>
      </div>

      <div class="card">
        <h2>Images</h2>
        <div class="af-imgs">
          <div class="af-img">
            <div class="photo-prev af-prev" data-r="prevPhoto"></div>
            <label class="link-btn" for="af-photo">Photo principale</label>
            <button type="button" class="link-btn danger" data-act="rm-photo" hidden>Retirer</button>
            <input type="file" id="af-photo" accept="image/*" hidden>
          </div>
          <div class="af-img">
            <div class="photo-prev af-prev" data-r="prevLogo"></div>
            <label class="link-btn" for="af-logo">Logo</label>
            <button type="button" class="link-btn danger" data-act="rm-logo" hidden>Retirer</button>
            <input type="file" id="af-logo" accept="image/*" hidden>
          </div>
        </div>
        <p class="hint">Dans le format Carré, la photo s'affiche seulement si le texte est assez court pour lui laisser de la place.</p>
      </div>

      <div class="card">
        <h2>Vos coordonnées</h2>
        <button type="button" class="link-btn" data-act="fromcard" hidden>Reprendre depuis ma carte de visite</button>
        ${input('Entreprise', 'entreprise', 'autocomplete="organization" placeholder="Atlantique Services"')}
        <div class="grid2">
          ${input('Téléphone', 'tel', 'type="tel" placeholder="+237 6 00 00 00 00"')}
          ${input('WhatsApp (si différent)', 'whatsapp', 'type="tel"')}
        </div>
        ${input('Email', 'email', 'type="email" placeholder="contact@entreprise.com"')}
        ${input('Site web', 'site', 'placeholder="www.monsite.com"')}
        ${input('Réseau social', 'reseau', 'placeholder="@monpseudo"')}
      </div>

      <div class="card">
        <h2>Exporter</h2>
        <div class="cd-actions">
          <button type="button" class="btn2" data-act="png">Image (PNG)</button>
          <button type="button" class="btn2" data-act="print"${isNative ? ' hidden' : ''}>Imprimer ou PDF</button>
          <button type="button" class="btn2" data-act="text">Partager le texte</button>
          <button type="button" class="btn2" data-act="copy">Copier le texte</button>
        </div>
        <p class="hint">Le même contenu s'adapte aux trois formats : changez de format en haut, rien à retaper.</p>
      </div>

      <div class="card"><button type="button" class="btn2 wide" data-act="new">Effacer et recommencer</button></div>
    </div>
    <div class="inv-bar">
      <div><small>Format</small><strong data-r="fname"></strong></div>
      <button type="button" class="primary" data-act="share">Partager l'affiche</button>
    </div>`;
  document.body.appendChild(el);

  const sheet = document.createElement('div');
  sheet.className = 'card-sheet aff-sheet';
  document.body.appendChild(sheet);

  const q = (r) => el.querySelector(`[data-r="${r}"]`);
  const canvas = q('canvas');
  const shown = () => withDemoAff(state);
  const demoImgs = () => (isEmptyAff(state) ? { photo: null, logo: imgs.logo } : imgs);
  const dims = (f, width) => ({ width, height: Math.round((width * f.h) / f.w) });

  /* ---------- Rendu ---------- */
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const f = formatOf(state.format);
      const { width, height } = dims(f, 640);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      renderAffiche(canvas, shown(), demoImgs(), state.format);
      q('demo').hidden = !isEmptyAff(state);
    });
  }

  function drawThumbs() {
    const d = shown();
    const im = demoImgs();
    el.querySelectorAll('[data-design]').forEach((b) => {
      const cv = b.querySelector('canvas');
      const sg = AFFICHE_DESIGNS.find((x) => x.id === b.dataset.design);
      renderAffiche(cv, { ...d, design: b.dataset.design, accent: state.accentTouched || !sg ? d.accent : sg.suggest }, im, state.format);
    });
  }
  function schedThumbs() {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(drawThumbs, 180);
  }

  function renderDesigns() {
    const f = formatOf(state.format);
    const h = 300;
    const w = Math.round((h * f.w) / f.h);
    q('designs').innerHTML = AFFICHE_DESIGNS.map(
      (s) =>
        `<button type="button" class="cd-design af-design${state.design === s.id ? ' on' : ''}" data-design="${s.id}"><canvas width="${w}" height="${h}" style="aspect-ratio:${f.w}/${f.h}"></canvas><span>${esc(s.nom)}${locked(s.id) ? ' 🔒' : ''}</span></button>`
    ).join('');
    drawThumbs();
  }

  function renderColors() {
    const known = AFFICHE_COLORS.some((x) => x.c.toLowerCase() === state.accent.toLowerCase());
    q('colors').innerHTML =
      AFFICHE_COLORS.map((x) => `<button type="button" data-accent="${x.c}" style="background:${x.c}" aria-label="${esc(x.nom)}"${x.c.toLowerCase() === state.accent.toLowerCase() ? ' class="on"' : ''}></button>`).join('') +
      `<label class="cd-custom${known ? '' : ' on'}" aria-label="Autre couleur"><input type="color" data-f="accent" value="${state.accent.toLowerCase()}"></label>`;
  }

  function renderThemes() {
    q('themes').innerHTML = THEMES.map((t) => `<button type="button" class="chip${state.theme === t.id ? ' on' : ''}" data-theme="${t.id}">${esc(t.nom)}</button>`).join('');
  }

  function renderFormats() {
    q('formats').innerHTML = FORMATS.map((f) => `<button type="button" data-format="${f.id}"${state.format === f.id ? ' class="on"' : ''}>${esc(f.court)}</button>`).join('');
    q('fname').textContent = formatOf(state.format).nom;
  }

  function syncSimple() {
    el.querySelectorAll('[data-f]').forEach((n) => {
      if (n.type !== 'color') n.value = state[n.dataset.f] ?? '';
    });
    q('prevPhoto').style.backgroundImage = state.photo ? `url(${state.photo})` : '';
    q('prevLogo').style.backgroundImage = state.logo ? `url(${state.logo})` : '';
    el.querySelector('[data-act="rm-photo"]').hidden = !state.photo;
    el.querySelector('[data-act="rm-logo"]').hidden = !state.logo;
    const card = readCard();
    el.querySelector('[data-act="fromcard"]').hidden = !(card && (card.entreprise || card.tel || card.email));
    renderFormats();
    renderThemes();
  }

  const persist = () => save(state);
  function syncAll() {
    syncSimple();
    renderDesigns();
    renderColors();
    draw();
  }

  async function setImg(kind, src) {
    state[kind] = src;
    imgs[kind] = await loadImage(src);
  }

  function readImage(file, kind) {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = async () => {
        const max = kind === 'photo' ? 1400 : 420;
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(im.width * k);
        cv.height = Math.round(im.height * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        const png = kind === 'logo' || /png|webp|svg|gif/i.test(file.type);
        await setImg(kind, cv.toDataURL(png ? 'image/png' : 'image/jpeg', 0.86));
        persist();
        syncSimple();
        draw();
        schedThumbs();
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Export ---------- */
  const exportCanvas = () => {
    const f = formatOf(state.format);
    const cv = document.createElement('canvas');
    const { width, height } = dims(f, f.px);
    cv.width = width;
    cv.height = height;
    renderAffiche(cv, state, imgs, state.format);
    return cv;
  };
  const filename = () => `affiche-${slug(state.titre || state.entreprise) || 'visuel'}-${state.format}.png`;

  function gate() {
    if (!state.titre.trim()) {
      toast('Ajoutez d’abord un titre');
      return false;
    }
    if (locked(state.design)) {
      const s = AFFICHE_DESIGNS.find((x) => x.id === state.design);
      showPremium(`Affiche : modèle ${s ? s.nom : ''}`);
      return false;
    }
    return true;
  }
  const report = (r, done) => {
    if (r === 'shared' || r === 'downloaded') toast(done);
    if (r === 'failed') toast('Opération impossible');
  };

  async function printSheet() {
    const blob = await toBlob(exportCanvas());
    const url = URL.createObjectURL(blob);
    const f = formatOf(state.format);
    sheet.innerHTML = `<div class="pg"><img src="${url}" alt="" class="${f.print ? 'full' : ''}"></div>`;
    await sheet.querySelector('img').decode().catch(() => {});
    const prev = document.title;
    document.title = `Affiche-${slug(state.titre || state.entreprise) || 'visuel'}`;
    sheet.classList.add('printing');
    document.body.dataset.print = '1';
    const done = () => {
      sheet.classList.remove('printing');
      delete document.body.dataset.print;
      document.title = prev;
      URL.revokeObjectURL(url);
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  }

  function importCard(silent) {
    const card = readCard();
    if (!card) return 0;
    let n = 0;
    ['entreprise', 'tel', 'whatsapp', 'email', 'site', 'reseau'].forEach((k) => {
      if ((card[k] || '').trim() && !state[k].trim()) {
        state[k] = card[k].trim();
        n += 1;
      }
    });
    return n;
  }

  /* ---------- Événements ---------- */
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.f;
    if (!k) return;
    state[k] = e.target.value;
    if (k === 'accent') state.accentTouched = true;
    persist();
    if (k === 'accent') renderColors();
    draw();
    schedThumbs();
  });

  el.addEventListener('change', async (e) => {
    const id = e.target.id;
    if (id === 'af-photo' || id === 'af-logo') {
      const f = e.target.files && e.target.files[0];
      if (f) readImage(f, id === 'af-photo' ? 'photo' : 'logo');
      e.target.value = '';
    }
  });

  el.addEventListener('click', async (e) => {
    const t = e.target;
    const fm = t.closest('[data-format]');
    if (fm) {
      state.format = fm.dataset.format;
      persist();
      syncSimple();
      renderDesigns();
      return draw();
    }
    const ds = t.closest('[data-design]');
    if (ds) {
      state.design = ds.dataset.design;
      const sg = AFFICHE_DESIGNS.find((x) => x.id === state.design);
      if (!state.accentTouched && sg) {
        state.accent = sg.suggest;
        renderColors();
      }
      persist();
      el.querySelectorAll('.af-design').forEach((b) => b.classList.toggle('on', b === ds));
      return draw();
    }
    const ac = t.closest('button[data-accent]');
    if (ac) {
      state.accent = ac.dataset.accent;
      state.accentTouched = true;
      persist();
      renderColors();
      draw();
      return schedThumbs();
    }
    const th = t.closest('[data-theme]');
    if (th) {
      const theme = THEMES.find((x) => x.id === th.dataset.theme);
      if (!isEmptyAff(state) && !confirm('Remplacer vos textes par ceux de ce thème ?')) return;
      Object.assign(state, { bouton: '', lien: '', sticker: '' }, theme.data, { design: theme.design, accent: theme.accent, accentTouched: false, theme: theme.id });
      persist();
      syncAll();
      return toast(`Thème « ${theme.nom} » appliqué`);
    }
    const act = t.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'back') return onBack();
    if (a === 'fromcard') {
      const n = importCard();
      const card = readCard();
      if (card && card.image && !state.logo) {
        await setImg('logo', card.image);
      }
      persist();
      syncAll();
      return toast(n ? 'Coordonnées reprises de votre carte' : 'Rien de nouveau à reprendre');
    }
    if (a === 'rm-photo' || a === 'rm-logo') {
      await setImg(a === 'rm-photo' ? 'photo' : 'logo', '');
      persist();
      syncSimple();
      draw();
      return schedThumbs();
    }
    if (a === 'new') {
      if (!confirm('Effacer cette affiche et recommencer ?')) return;
      const keep = { format: state.format };
      state = { ...blankAffiche(), ...keep };
      imgs = { photo: null, logo: null };
      persist();
      syncAll();
      return toast('Affiche effacée');
    }

    if (!gate()) return;

    if (a === 'png') {
      const r = await saveFile('Mon affiche', await toBlob(exportCanvas()), filename());
      return report(r, 'Image enregistrée');
    }
    if (a === 'share') {
      const r = await shareFiles('Mon affiche', [{ blob: await toBlob(exportCanvas()), name: filename() }], afficheText(state));
      return report(r, 'Image enregistrée');
    }
    if (a === 'text') {
      const r = await shareText('Mon affiche', afficheText(state));
      if (r === 'copied') toast('Texte copié');
      if (r === 'failed') toast('Partage impossible');
      return;
    }
    if (a === 'copy') return toast((await copyText(afficheText(state))) ? 'Texte copié' : 'Copie impossible');
    if (a === 'print') return printSheet();
  });

  if (document.fonts && document.fonts.load) {
    Promise.all(['400', '500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 24px "Plus Jakarta Sans"`)))
      .then(() => {
        draw();
        schedThumbs();
      })
      .catch(() => {});
  }

  Promise.all([loadImage(state.photo), loadImage(state.logo)]).then(([photo, logo]) => {
    imgs = { photo, logo };
    draw();
    schedThumbs();
  });
  syncAll();

  return {
    el,
    onShow: () => {
      if (!state.entreprise.trim() && !state.tel.trim() && importCard()) {
        persist();
        toast('Coordonnées reprises de votre carte de visite');
      }
      syncAll();
      el.querySelector('.ov-body').scrollTop = 0;
    },
    refresh: renderDesigns,
    hint: () => (state.titre.trim() ? `Affiche : ${state.titre.trim().slice(0, 28)}` : null),
  };
}
