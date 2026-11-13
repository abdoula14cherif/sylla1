// Posts : fiche d'activité -> plan de publications. Générateur « modèles » (hors ligne) + lecture des réponses de l'IA.

export const SECTEURS = [
  { id: 'mode', nom: 'Mode et vêtements', tags: ['#mode', '#style', '#tenue', '#modeafricaine'], tips: ["lavez vos vêtements foncés à l'envers et à l'eau froide pour garder les couleurs", 'repassez les tissus fragiles à basse température', 'essayez toujours une tenue avant de l’acheter pour être sûr de la taille'] },
  { id: 'resto', nom: 'Restaurant, traiteur', tags: ['#cuisine', '#miam', '#traiteur', '#foodcameroun'], tips: ['pour une fête ou une réunion, commandez vos plats à l’avance', 'indiquez à l’avance les allergies ou régimes de vos invités', 'conservez vos restes au frais et consommez-les rapidement'] },
  { id: 'beaute', nom: 'Coiffure, beauté', tags: ['#coiffure', '#beaute', '#soins', '#hairstyle'], tips: ['hydratez régulièrement vos cheveux et protégez-les la nuit', 'prenez rendez-vous à l’avance pour éviter l’attente', 'n’attendez pas que vos cheveux soient abîmés pour les soigner'] },
  { id: 'boutique', nom: 'Boutique, commerce général', tags: ['#boutique', '#shopping', '#bonplan', '#achatlocal'], tips: ['comparez toujours le prix et la qualité avant d’acheter', 'gardez votre reçu pour tout échange ou garantie', 'achetez local : vous aidez les commerçants de votre quartier'] },
  { id: 'tech', nom: 'Téléphones, informatique', tags: ['#tech', '#smartphone', '#informatique', '#accessoires'], tips: ['faites des sauvegardes régulières de vos photos et contacts', 'utilisez un chargeur de bonne qualité pour protéger la batterie', 'installez les mises à jour de sécurité de votre téléphone'] },
  { id: 'immo', nom: 'Immobilier, location', tags: ['#immobilier', '#location', '#logement', '#maison'], tips: ['visitez toujours le logement avant de verser un acompte', 'demandez un reçu pour chaque paiement', 'lisez le contrat avant de le signer'] },
  { id: 'formation', nom: 'Formation, cours', tags: ['#formation', '#apprendre', '#education', '#competences'], tips: ['étudiez par petites séances régulières plutôt qu’en une longue révision', 'notez vos questions et posez-les au prochain cours', 'fixez-vous un objectif simple pour chaque semaine'] },
  { id: 'agri', nom: 'Agriculture, vivres frais', tags: ['#vivres', '#frais', '#agriculture', '#produitslocaux'], tips: ['conservez les légumes feuilles au frais et consommez-les vite', 'lavez les fruits et légumes avant de les manger', 'achetez de saison : c’est meilleur et souvent moins cher'] },
  { id: 'patisserie', nom: 'Pâtisserie, boissons', tags: ['#patisserie', '#gateau', '#douceur', '#fetes'], tips: ['commandez vos gâteaux plusieurs jours avant l’événement', 'précisez le nombre de personnes pour choisir la bonne taille', 'conservez les gâteaux à la crème au frais'] },
  { id: 'services', nom: 'Autres services', tags: ['#services', '#pro', '#entrepreneur', '#qualite'], tips: ['demandez toujours un devis écrit avant de commencer un travail', 'précisez vos délais et votre budget dès le début', 'gardez une trace écrite de ce qui a été convenu'] },
];

export const TONS = [
  { id: 'amical', nom: 'Amical' },
  { id: 'pro', nom: 'Professionnel' },
  { id: 'fun', nom: 'Fun' },
  { id: 'urgent', nom: 'Urgent' },
];
export const PLATEFORMES = [
  { id: 'whatsapp', nom: 'Statut WhatsApp', tags: 0, cta: 'Répondez à ce statut ou écrivez-nous' },
  { id: 'facebook', nom: 'Facebook', tags: 3, cta: 'Commentez ou écrivez-nous en message privé' },
  { id: 'instagram', nom: 'Instagram', tags: 8, cta: 'Écrivez-nous en message privé' },
  { id: 'tiktok', nom: 'TikTok', tags: 5, cta: 'Dites-nous en commentaire ce que vous voulez voir' },
];
export const OBJECTIFS = [
  { id: 'vendre', nom: 'Vendre' },
  { id: 'promo', nom: 'Promotion' },
  { id: 'notoriete', nom: 'Se faire connaître' },
  { id: 'fideliser', nom: 'Fidéliser' },
];

export const ANGLES = [
  { id: 'produit', nom: 'Produit vedette', visuel: 'Une photo nette du produit sur fond simple, en lumière du jour.', heure: '19h' },
  { id: 'astuce', nom: 'Astuce utile', visuel: 'Un visuel texte : l’astuce en une phrase sur un fond de votre couleur.', heure: '12h30' },
  { id: 'coulisses', nom: 'Coulisses', visuel: 'Une courte vidéo ou photo de votre atelier, comptoir ou cuisine.', heure: '18h30' },
  { id: 'offre', nom: 'Offre du moment', visuel: 'Une affiche avec le prix et la date limite (créez-la dans Affiches).', heure: '7h30' },
  { id: 'engagement', nom: 'Question à la communauté', visuel: 'Un sondage dans le statut ou une image avec la question en grand.', heure: '20h' },
  { id: 'preuve', nom: 'Avis client', visuel: 'Une capture d’un message client, avec son accord, ou une photo de client satisfait.', heure: '12h' },
  { id: 'commande', nom: 'Comment commander', visuel: 'Un visuel en 3 étapes : choisir, écrire sur WhatsApp, recevoir.', heure: '19h30' },
];

const TON_SET = {
  amical: { hi: ['Bonjour la famille', 'Coucou tout le monde', 'Salut les amis'], cta: ['on vous répond vite', 'on s’occupe de tout'], em: ['😊', '🙌', '✨', '🛍️'] },
  pro: { hi: ['Bonjour', 'Chers clients', 'Bonjour à tous'], cta: ['contactez-nous pour plus d’informations', 'contactez-nous pour passer commande'], em: ['✅', '📌', '🔹', '📍'] },
  fun: { hi: ['Hello la team', 'Alors, on se fait plaisir', 'Ça va ou bien'], cta: ['un petit message et c’est réglé', 'faites-nous signe, on gère le reste'], em: ['🔥', '😍', '🎉', '💥'] },
  urgent: { hi: ['⏰ Ne tardez pas', 'Attention', 'C’est maintenant'], cta: ['écrivez-nous dès aujourd’hui', 'réservez sans attendre'], em: ['⏰', '🔥', '⚠️', '📲'] },
};

const slug = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const blankBrief = () => ({
  nom: '', secteur: 'boutique', activite: '', produit: '', ville: '', offre: '', contact: '',
  ton: 'amical', plateforme: 'whatsapp', objectif: 'vendre', jours: 7, debut: '',
});

export function addDaysISO(iso, n) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function jourLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? '' : cap(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
}

export function hashtagsFor(b) {
  const pf = PLATEFORMES.find((x) => x.id === b.plateforme) || PLATEFORMES[0];
  if (!pf.tags) return [];
  const sec = SECTEURS.find((s) => s.id === b.secteur) || SECTEURS[3];
  const list = [];
  if (slug(b.nom)) list.push(`#${slug(b.nom)}`);
  if (slug(b.ville)) list.push(`#${slug(b.ville)}`);
  list.push(...sec.tags, '#cameroun', '#237');
  return [...new Set(list)].slice(0, pf.tags);
}

// Un post pour un jour donné. `seed` change la variante (bouton « Régénérer »).
export function buildPost(b, dayIndex, seed = 0) {
  const angle = ANGLES[dayIndex % ANGLES.length];
  const turn = Math.floor(dayIndex / ANGLES.length) + seed;
  const t = TON_SET[b.ton] || TON_SET.amical;
  const pf = PLATEFORMES.find((x) => x.id === b.plateforme) || PLATEFORMES[0];
  const sec = SECTEURS.find((s) => s.id === b.secteur) || SECTEURS[3];
  const nom = b.nom.trim() || '[Nom de votre entreprise]';
  const produit = b.produit.trim() || (b.activite.trim() ? b.activite.trim() : '[vos produits ou services]');
  const ou = b.ville.trim() ? ` à ${b.ville.trim()}` : '';
  const contact = b.contact.trim() || '[Votre numéro WhatsApp]';
  const offre = b.offre.trim();
  const e = (k) => pick(t.em, k + turn);
  let body;
  switch (angle.id) {
    case 'produit':
      body = pick([
        `${e(0)} Focus du jour : ${produit}. Qualité, bon prix et service soigné chez ${nom}${ou}.`,
        `${e(1)} Vous cherchiez ${produit} ? ${nom} vous ${b.produit.trim() ? 'les ' : ''}propose${ou}. Dites-nous ce qu’il vous faut.`,
        `${e(2)} ${nom}${ou} : ${produit}. Venez voir, comparez et choisissez ce qui vous plaît.`,
      ], turn);
      break;
    case 'astuce':
      body = `${e(0)} Astuce : ${pick(sec.tips, turn)}.\nPlus de conseils chez ${nom}.`;
      break;
    case 'coulisses':
      body = pick([
        `${e(0)} Dans les coulisses de ${nom} : chaque commande est préparée avec soin avant de vous être remise.`,
        `${e(1)} Une journée chez ${nom}${ou}. Merci à tous ceux qui nous font confiance.`,
        `${e(2)} Derrière ${nom}, il y a une équipe qui aime son travail. Voici un aperçu de notre quotidien.`,
      ], turn);
      break;
    case 'offre':
      body = offre
        ? pick([`${e(0)} Offre du moment : ${offre}.\nProfitez-en chez ${nom}.`, `${e(1)} Bonne nouvelle chez ${nom} : ${offre}.`, `${e(2)} ${cap(offre)}. Une occasion à ne pas laisser passer chez ${nom}.`], turn)
        : `${e(0)} Offre du moment chez ${nom} : [décrivez votre offre : prix, réduction, date limite].`;
      break;
    case 'engagement':
      body = pick([
        `${e(0)} Question du jour : quel produit ou service aimeriez-vous voir chez ${nom} ? Répondez-nous !`,
        `${e(1)} Qu’est-ce qui compte le plus pour vous : le prix, la qualité ou la rapidité ? Dites-le-nous.`,
        `${e(2)} Vote : quel jour préférez-vous passer chez ${nom} ? En semaine ou le week-end ?`,
      ], turn);
      break;
    case 'preuve':
      body = pick([
        `${e(0)} Merci à nos clients pour leur confiance ! [Prénom du client] nous a écrit : « [son message] ».`,
        `${e(1)} Votre avis compte : si vous avez acheté chez ${nom}, dites-nous ce que vous en pensez.`,
        `${e(2)} Chaque retour nous aide à nous améliorer. Merci à ceux qui nous recommandent à leurs proches.`,
      ], turn);
      break;
    default:
      body = `${e(0)} Comment commander chez ${nom} ?\n1️⃣ Choisissez ce qui vous plaît\n2️⃣ Écrivez-nous sur WhatsApp\n3️⃣ Recevez ou venez récupérer votre commande${ou}.`;
  }
  const opener = pick(t.hi, dayIndex + turn);
  const callTo = `${cap(pf.cta)}, ${pick(t.cta, dayIndex + turn)}.`;
  const legende = `${opener} !\n\n${body}\n\n${callTo}\n📲 WhatsApp : ${contact}`;
  return { angle: angle.id, titre: angle.nom, legende, hashtags: hashtagsFor(b), visuel: angle.visuel, heure: angle.heure, seed };
}

export function buildPlan(b) {
  const start = b.debut || '';
  return Array.from({ length: Math.max(1, Math.min(14, b.jours || 7)) }, (_, i) => ({
    date: start ? addDaysISO(start, i) : '',
    ...buildPost(b, i, 0),
  }));
}

/* ---------- Réponse de l'IA -> posts propres ---------- */
export function normalizePosts(data, b) {
  const raw = data && Array.isArray(data.posts) ? data.posts : [];
  const cleanTag = (t) => `#${String(t).replace(/^#+/, '').replace(/[^\p{L}\p{N}_]/gu, '')}`;
  return raw
    .filter((p) => p && typeof p.legende === 'string' && p.legende.trim())
    .slice(0, 14)
    .map((p, i) => {
      const base = ANGLES[i % ANGLES.length];
      return {
        date: b.debut ? addDaysISO(b.debut, i) : '',
        angle: ANGLES.some((a) => a.id === p.angle) ? p.angle : base.id,
        titre: String(p.titre || (ANGLES.find((a) => a.id === p.angle) || base).nom).slice(0, 60),
        legende: p.legende.trim().slice(0, 1500),
        hashtags: (Array.isArray(p.hashtags) ? p.hashtags : []).map(cleanTag).filter((t) => t.length > 1).slice(0, 12),
        visuel: String(p.visuel || base.visuel).slice(0, 220),
        heure: String(p.heure || base.heure).slice(0, 12),
        seed: 0,
        ia: true,
      };
    });
}

export const postText = (p) => `${p.legende.trim()}${p.hashtags && p.hashtags.length ? `\n\n${p.hashtags.join(' ')}` : ''}`;

export function planText(posts) {
  return posts
    .map((p, i) => `${p.date ? jourLabel(p.date) : `Jour ${i + 1}`} : ${p.titre}\nCréneau suggéré : ${p.heure}\n\n${postText(p)}\n\nIdée de visuel : ${p.visuel}`)
    .join('\n\n————————\n\n');
}
