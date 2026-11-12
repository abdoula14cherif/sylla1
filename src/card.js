import { esc } from './cv.js';
import { locked, showPremium, toast } from './premium.js';
import { copyText, shareText, shareFiles, saveFile, isNative } from './native.js';
import { CARD_DESIGNS, CARD_COLORS, blankCard, isEmpty, withDemo, renderCard, loadImage, vcard, cardText, W, H } from './card-core.js';

const KEY = 'digiform.card.v1';
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

const slug = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const toBlob = (canvas, type = 'image/png') => new Promise((res) => canvas.toBlob(res, type));

export function createCardRoom({ getIdentity, onBack }) {
  let state = { ...blankCard(), ...(load() || {}) };
  let img = null;
  let face = 'recto';
  let raf = 0;
  let thumbTimer = 0;

  const el = document.createElement('div');
  el.className = 'overlay';
  el.id = 'room-carte';
  el.hidden = true;
  const input = (label, key, extra = '') => `<label class="f"><span>${label}</span><input data-f="${key}" ${extra}></label>`;
  el.innerHTML = `
    <div class="ov-top"><button type="button" class="ghost" data-act="back">← Accueil</button><strong>Carte de visite</strong></div>
    <div class="ov-body">
      <div class="cd-stage">
        <canvas class="cd-canvas" width="${W}" height="${H}" data-r="canvas"></canvas>
        <div class="cd-bar"><div class="seg"><button type="button" data-face="recto">Recto</button><button type="button" data-face="verso">Verso</button></div></div>
        <span class="cd-demo" data-r="demo" hidden>Exemple : remplissez vos informations ci-dessous</span>
      </div>

      <div class="card">
        <h2>Modèle</h2>
        <div class="cd-designs" data-r="designs"></div>
        <p class="hint">Couleur</p>
        <div class="cd-colors" data-r="colors"></div>
      </div>

      <div class="card">
        <h2>Vous</h2>
        <button type="button" class="link-btn" data-act="cv">Reprendre mes infos du CV</button>
        ${input('Nom complet', 'nom', 'autocomplete="name" placeholder="Nadège Mballa"')}
        ${input('Métier ou titre', 'titre', 'placeholder="Directrice commerciale"')}
        ${input('Entreprise', 'entreprise', 'autocomplete="organization" placeholder="Atlantique Services"')}
        ${input('Slogan (facultatif)', 'slogan', 'placeholder="Votre réussite, notre métier"')}
      </div>

      <div class="card">
        <h2>Contact</h2>
        <div class="grid2">
          ${input('Téléphone', 'tel', 'type="tel" autocomplete="tel" placeholder="+237 6 00 00 00 00"')}
          ${input('WhatsApp (si différent)', 'whatsapp', 'type="tel" placeholder="+237 6 00 00 00 00"')}
        </div>
        ${input('Email', 'email', 'type="email" autocomplete="email" placeholder="nom@email.com"')}
        ${input('Site web', 'site', 'placeholder="www.monsite.com"')}
        ${input('Adresse', 'adresse', 'autocomplete="street-address" placeholder="Akwa, Douala"')}
        ${input('Réseau social', 'reseau', 'placeholder="@monpseudo"')}
      </div>

      <div class="card">
        <h2>Photo ou logo</h2>
        <div class="photo-row">
          <div class="photo-prev" data-r="prev"></div>
          <div>
            <label class="link-btn" for="card-photo">Ajouter une image</label>
            <button type="button" class="link-btn danger" data-act="rmimg" hidden>Retirer</button>
            <input type="file" id="card-photo" accept="image/*" hidden>
          </div>
        </div>
        <p class="hint">Forme</p>
        <div class="seg"><button type="button" data-forme="rond">Rond</button><button type="button" data-forme="carre">Carré</button><button type="button" data-forme="logo">Logo</button></div>
      </div>

      <div class="card">
        <h2>Verso et QR code</h2>
        <p class="hint">Que fait le QR code quand on le scanne ?</p>
        <div class="seg wrap"><button type="button" data-qr="contact">Ajoute mon contact</button><button type="button" data-qr="whatsapp">Ouvre WhatsApp</button><button type="button" data-qr="site">Ouvre mon site</button></div>
        <label class="f gap-top"><span>Message au verso (remplace le slogan)</span><textarea rows="2" data-f="versoTexte" placeholder="Merci de votre confiance."></textarea></label>
      </div>

      <div class="card">
        <h2>Exporter</h2>
        <div class="cd-actions">
          <button type="button" class="btn2" data-act="png-recto">Image recto</button>
          <button type="button" class="btn2" data-act="png-verso">Image verso</button>
          <button type="button" class="btn2" data-act="vcf">Fichier contact</button>
          <button type="button" class="btn2" data-act="text">Partager le texte</button>
          <button type="button" class="btn2" data-act="copy">Copier le texte</button>
          <button type="button" class="btn2" data-act="print"${isNative ? ' hidden' : ''}>Planche A4 (PDF)</button>
        </div>
        <p class="hint">La planche A4 contient 10 cartes recto et 10 cartes verso, prêtes à découper (89 x 51 mm environ) ou à donner à l'imprimeur.</p>
      </div>

      <div class="card"><button type="button" class="btn2 wide" data-act="new">Effacer et recommencer</button></div>
    </div>
    <div class="inv-bar">
      <div><small>Modèle</small><strong data-r="dname"></strong></div>
      <button type="button" class="primary" data-act="share">Partager ma carte</button>
    </div>`;
  document.body.appendChild(el);

  const sheet = document.createElement('div');
  sheet.className = 'card-sheet';
  document.body.appendChild(sheet);

  const q = (r) => el.querySelector(`[data-r="${r}"]`);
  const canvas = q('canvas');

  const shown = () => withDemo(state);

  /* ---------- Rendu ---------- */
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      renderCard(canvas, shown(), img, face);
      q('demo').hidden = !isEmpty(state);
    });
  }

  function drawThumbs() {
    const d = shown();
    el.querySelectorAll('[data-design] canvas').forEach((cv) => {
      renderCard(cv, { ...d, design: cv.parentElement.dataset.design }, img, 'recto');
    });
  }
  function schedThumbs() {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(drawThumbs, 140);
  }

  function renderDesigns() {
    q('designs').innerHTML = CARD_DESIGNS.map(
      (s) =>
        `<button type="button" class="cd-design${state.design === s.id ? ' on' : ''}" data-design="${s.id}"><canvas width="264" height="151"></canvas><span>${esc(s.nom)}${locked(s.id) ? ' 🔒' : ''}</span></button>`
    ).join('');
    drawThumbs();
  }

  function renderColors() {
    const known = CARD_COLORS.some((x) => x.c.toLowerCase() === state.accent.toLowerCase());
    q('colors').innerHTML =
      CARD_COLORS.map(
        (x) => `<button type="button" data-accent="${x.c}" style="background:${x.c}" aria-label="${esc(x.nom)}"${x.c.toLowerCase() === state.accent.toLowerCase() ? ' class="on"' : ''}></button>`
      ).join('') + `<label class="cd-custom${known ? '' : ' on'}" aria-label="Autre couleur"><input type="color" data-f="accent" value="${state.accent.toLowerCase()}"></label>`;
  }

  function syncSimple() {
    el.querySelectorAll('[data-f]').forEach((n) => {
      if (n.type !== 'color') n.value = state[n.dataset.f] ?? '';
    });
    el.querySelectorAll('[data-face]').forEach((b) => b.classList.toggle('on', b.dataset.face === face));
    el.querySelectorAll('[data-forme]').forEach((b) => b.classList.toggle('on', b.dataset.forme === state.forme));
    el.querySelectorAll('[data-qr]').forEach((b) => b.classList.toggle('on', b.dataset.qr === state.qr));
    q('prev').style.backgroundImage = state.image ? `url(${state.image})` : '';
    el.querySelector('[data-act="rmimg"]').hidden = !state.image;
    const d = CARD_DESIGNS.find((x) => x.id === state.design);
    q('dname').textContent = d ? d.nom : '';
  }

  const persist = () => save(state);

  function syncAll() {
    syncSimple();
    renderDesigns();
    renderColors();
    draw();
  }

  async function setImage(src) {
    state.image = src;
    img = await loadImage(src);
  }

  /* ---------- Photo : réduite pour rester légère ---------- */
  function readImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = async () => {
        const max = 520;
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(im.width * k);
        cv.height = Math.round(im.height * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        const png = /png|webp|svg|gif/i.test(file.type);
        await setImage(cv.toDataURL(png ? 'image/png' : 'image/jpeg', 0.88));
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
  const faceCanvas = (f) => {
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    renderCard(cv, state, img, f);
    return cv;
  };
  const filename = (suffix) => `carte-${slug(state.nom || state.entreprise) || 'visite'}${suffix}`;

  function gate() {
    if (!(state.nom.trim() || state.entreprise.trim())) {
      toast('Ajoutez d’abord votre nom ou votre entreprise');
      return false;
    }
    if (locked(state.design)) {
      const s = CARD_DESIGNS.find((x) => x.id === state.design);
      showPremium(`Carte : modèle ${s ? s.nom : ''}`);
      return false;
    }
    return true;
  }
  const report = (r, done) => {
    if (r === 'shared' || r === 'downloaded') toast(done);
    if (r === 'failed') toast('Opération impossible');
  };

  async function printSheet() {
    const [r, v] = await Promise.all([toBlob(faceCanvas('recto')), toBlob(faceCanvas('verso'))]);
    const urls = [URL.createObjectURL(r), URL.createObjectURL(v)];
    const page = (u) => `<div class="pg">${Array.from({ length: 10 }, () => `<img src="${u}" alt="">`).join('')}</div>`;
    sheet.innerHTML = urls.map(page).join('');
    await Promise.all([...sheet.querySelectorAll('img')].map((i) => i.decode().catch(() => {})));
    const prev = document.title;
    document.title = `Cartes-${slug(state.nom || state.entreprise) || 'visite'}`;
    sheet.classList.add('printing');
    document.body.dataset.print = '1';
    const done = () => {
      sheet.classList.remove('printing');
      delete document.body.dataset.print;
      document.title = prev;
      urls.forEach((u) => URL.revokeObjectURL(u));
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  }

  /* ---------- Événements ---------- */
  el.addEventListener('input', (e) => {
    const k = e.target.dataset.f;
    if (!k) return;
    state[k] = e.target.value;
    persist();
    if (k === 'accent') {
      renderColors();
    }
    draw();
    schedThumbs();
  });

  el.addEventListener('change', (e) => {
    if (e.target.id === 'card-photo') {
      const f = e.target.files && e.target.files[0];
      if (f) readImage(f);
      e.target.value = '';
    }
  });

  el.addEventListener('click', async (e) => {
    const t = e.target;
    const fc = t.closest('[data-face]');
    if (fc) {
      face = fc.dataset.face;
      syncSimple();
      return draw();
    }
    const ds = t.closest('[data-design]');
    if (ds) {
      state.design = ds.dataset.design;
      persist();
      el.querySelectorAll('.cd-design').forEach((b) => b.classList.toggle('on', b === ds));
      syncSimple();
      return draw();
    }
    const ac = t.closest('button[data-accent]');
    if (ac) {
      state.accent = ac.dataset.accent;
      persist();
      renderColors();
      draw();
      return schedThumbs();
    }
    const fm = t.closest('[data-forme]');
    if (fm) {
      state.forme = fm.dataset.forme;
      persist();
      syncSimple();
      draw();
      return schedThumbs();
    }
    const qr = t.closest('[data-qr]');
    if (qr) {
      state.qr = qr.dataset.qr;
      persist();
      syncSimple();
      face = 'verso';
      syncSimple();
      return draw();
    }
    const act = t.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;

    if (a === 'back') return onBack();
    if (a === 'cv') {
      const id = getIdentity();
      const map = { nom: id.nom, titre: id.titre, tel: id.tel, email: id.email, adresse: id.ville, site: id.lien };
      let n = 0;
      Object.entries(map).forEach(([k, v]) => {
        if ((v || '').trim() && !state[k].trim()) {
          state[k] = v.trim();
          n += 1;
        }
      });
      persist();
      syncAll();
      return toast(n ? 'Infos du CV reprises' : 'Rien de nouveau à reprendre');
    }
    if (a === 'rmimg') {
      await setImage('');
      persist();
      syncSimple();
      draw();
      return schedThumbs();
    }
    if (a === 'new') {
      if (!confirm('Effacer cette carte et recommencer ?')) return;
      state = blankCard();
      img = null;
      face = 'recto';
      persist();
      syncAll();
      return toast('Carte effacée');
    }

    if (!gate()) return;

    if (a === 'png-recto' || a === 'png-verso') {
      const f = a === 'png-recto' ? 'recto' : 'verso';
      const r = await saveFile('Ma carte de visite', await toBlob(faceCanvas(f)), filename(`-${f}.png`));
      return report(r, 'Image enregistrée');
    }
    if (a === 'vcf') {
      const blob = new Blob([vcard(state, true)], { type: 'text/vcard' });
      const r = await saveFile('Mon contact', blob, filename('.vcf'));
      return report(r, 'Fichier contact prêt');
    }
    if (a === 'share') {
      const files = [
        { blob: await toBlob(faceCanvas('recto')), name: filename('-recto.png') },
        { blob: await toBlob(faceCanvas('verso')), name: filename('-verso.png') },
      ];
      const r = await shareFiles('Ma carte de visite', files, cardText(state));
      return report(r, 'Images enregistrées');
    }
    if (a === 'text') {
      const r = await shareText('Ma carte de visite', cardText(state));
      if (r === 'copied') toast('Texte copié');
      if (r === 'failed') toast('Partage impossible');
      return;
    }
    if (a === 'copy') return toast((await copyText(cardText(state))) ? 'Texte copié' : 'Copie impossible');
    if (a === 'print') return printSheet();
  });

  /* Les polices se chargent en différé : on redessine quand elles sont prêtes */
  if (document.fonts && document.fonts.load) {
    Promise.all(['400', '500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 24px "Plus Jakarta Sans"`)))
      .then(() => {
        draw();
        schedThumbs();
      })
      .catch(() => {});
  }

  loadImage(state.image).then((im) => {
    img = im;
    draw();
    schedThumbs();
  });
  syncAll();

  return {
    el,
    onShow: () => {
      face = 'recto';
      if (isEmpty(state)) {
        const id = getIdentity();
        const map = { nom: id.nom, titre: id.titre, tel: id.tel, email: id.email, adresse: id.ville, site: id.lien };
        let n = 0;
        Object.entries(map).forEach(([k, v]) => {
          if ((v || '').trim()) {
            state[k] = v.trim();
            n += 1;
          }
        });
        if (n) {
          persist();
          toast('Infos reprises de votre CV');
        }
      }
      syncAll();
      el.querySelector('.ov-body').scrollTop = 0;
    },
    refresh: renderDesigns,
    hint: () => (state.nom.trim() ? `Carte de ${state.nom.trim()}` : null),
  };
}
