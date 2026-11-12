// Tous les modèles de Digiform. premium: true = verrouillé par défaut.
// L'admin peut changer cela sans recompiler via le fichier premium.json (voir config.js).

export const LAYOUTS = [
  { id: 'classique', nom: 'Classique', premium: false },
  { id: 'moderne', nom: 'Moderne', premium: false },
  { id: 'sobre', nom: 'Sobre', premium: false },
  { id: 'bandeau', nom: 'Bandeau', premium: true },
  { id: 'chrono', nom: 'Chrono', premium: true },
  { id: 'lateral', nom: 'Latéral', premium: false },
  { id: 'duo', nom: 'Duo', premium: false },
  { id: 'elegant', nom: 'Élégant', premium: false },
  { id: 'creatif', nom: 'Créatif', premium: false },
];

const exp = (poste, entreprise, desc) => ({ poste, entreprise, debut: '[Début]', fin: '', desc });
const form = (diplome) => ({ diplome, ecole: '[Établissement, ville]', debut: '[Année]', fin: '[Année]' });

export const PROFILES = [
  {
    id: 'profil-sans-experience', nom: 'Sans expérience', premium: false,
    template: 'classique', accent: '#14213D', titre: '[Poste visé]',
    resume: "Motivé(e) et sérieux(se), je souhaite débuter comme [Poste visé]. J'apprends vite et j'aime le travail bien fait.",
    competences: 'Ponctualité, Travail en équipe, Informatique de base, [Langue parlée]',
    experiences: [exp('[Activité : aide familiale, vente, association, petits services]', '[Lieu ou organisation]', '[Ce que vous avez fait]\n[Ce que vous avez appris]')],
    formations: [form('[Diplôme ou formation]')],
  },
  {
    id: 'profil-jeune-diplome', nom: 'Jeune diplômé', premium: false,
    template: 'moderne', accent: '#0B7A4B', titre: '[Poste visé]',
    resume: "Diplômé(e) en [Filière], j'ai effectué [Nombre] stage(s) en [Domaine]. Je cherche un premier poste de [Poste visé] pour mettre mes acquis en pratique.",
    competences: '[Compétence technique 1], [Compétence technique 2], Excel, Anglais',
    experiences: [exp('Stagiaire – [Service]', '[Structure, ville]', '[Mission principale]\n[Résultat obtenu]')],
    formations: [form('[Diplôme]')],
  },
  {
    id: 'profil-commerce', nom: 'Commerce et vente', premium: true,
    template: 'bandeau', accent: '#B42318', titre: 'Commercial(e)',
    resume: "Commercial(e) avec [X] ans d'expérience en [Secteur]. Je prospecte, négocie et fidélise, avec [Résultat chiffré] à mon actif.",
    competences: 'Prospection, Négociation, Suivi client, Gestion de caisse, [Logiciel]',
    experiences: [exp('Commercial(e)', '[Entreprise, ville]', "[Résultat : chiffre d'affaires, nombre de clients, % de croissance]\nSuivi d'un portefeuille de [Nombre] clients\nNégociation et conclusion des contrats")],
    formations: [form('[Diplôme]')],
  },
  {
    id: 'profil-comptabilite', nom: 'Comptabilité et gestion', premium: true,
    template: 'classique', accent: '#1F2933', titre: 'Comptable',
    resume: "Comptable rigoureux(se) avec [X] ans d'expérience en [Secteur]. Je tiens les comptes à jour et respecte les délais.",
    competences: 'Saisie comptable, Rapprochements bancaires, Déclarations, Budgets, Excel, [Logiciel comptable]',
    experiences: [exp('Comptable', '[Entreprise, ville]', 'Tenue des journaux et du grand livre\nRapprochements bancaires mensuels\nÉtablissement des déclarations [à préciser]')],
    formations: [form('[Diplôme]')],
  },
  {
    id: 'profil-informatique', nom: 'Informatique et numérique', premium: true,
    template: 'chrono', accent: '#6B3FA0', titre: '[Développeur, Technicien ou Designer]',
    resume: "[Métier] spécialisé(e) en [Domaine]. J'ai conçu [Projet] qui [Résultat]. Portfolio : [Lien].",
    competences: '[Langage ou outil 1], [Langage ou outil 2], Git, Gestion de projet',
    experiences: [exp('[Poste]', '[Entreprise ou client]', '[Projet réalisé et technologie utilisée]\n[Résultat mesurable]')],
    formations: [form('[Diplôme ou certification]')],
  },
  {
    id: 'profil-enseignement', nom: 'Enseignement et formation', premium: true,
    template: 'sobre', accent: '#14213D', titre: 'Enseignant(e) de [Matière]',
    resume: "Enseignant(e) de [Matière] avec [X] ans d'expérience en classe de [Niveau]. J'accorde une attention particulière aux élèves en difficulté.",
    competences: 'Préparation de cours, Évaluation, Gestion de classe, Outils numériques',
    experiences: [exp('Enseignant(e) de [Matière]', '[Établissement, ville]', 'Classes de [Niveau] ([Effectif] élèves)\n[Résultats aux examens]\nSuivi individuel des élèves en difficulté')],
    formations: [form('[Diplôme ou école normale]')],
  },
  {
    id: 'profil-sante', nom: 'Santé et social', premium: true,
    template: 'moderne', accent: '#0B7A4B', titre: '[Infirmier(ère), Aide-soignant(e) ou Assistant(e) social(e)]',
    resume: "Professionnel(le) attentif(ve) et rigoureux(se), [X] ans d'expérience en [Service ou structure].",
    competences: 'Accueil des patients, Suivi des soins, Hygiène et sécurité, Écoute',
    experiences: [exp('[Poste]', '[Structure, ville]', '[Service et type de patients]\n[Missions principales]\nRespect des protocoles d\'hygiène')],
    formations: [form('[Diplôme]')],
  },
  {
    id: 'profil-btp', nom: 'BTP et métiers techniques', premium: true,
    template: 'classique', accent: '#B42318', titre: '[Maçon, Électricien, Plombier ou Mécanicien]',
    resume: "[Métier] avec [X] ans d'expérience sur des chantiers de [Type de travaux]. Sérieux(se) et attentif(ve) à la sécurité.",
    competences: 'Lecture de plans, Sécurité sur chantier, [Outils et machines], Travail en équipe',
    experiences: [exp('[Métier]', '[Entreprise, ville]', '[Type de chantiers ou de travaux]\n[Durée et taille des projets]\nRespect des consignes de sécurité')],
    formations: [form('[CAP, BEP ou formation]')],
  },
  {
    id: 'profil-secretariat', nom: 'Secrétariat et assistanat', premium: true,
    template: 'bandeau', accent: '#14213D', titre: 'Assistant(e) [de direction ou administratif(ve)]',
    resume: "Assistant(e) organisé(e) et discret(ète), [X] ans d'expérience. Je gère l'agenda, le courrier et les dossiers avec rigueur.",
    competences: "Accueil, Gestion d'agenda, Rédaction de courriers, Classement, Word, Excel",
    experiences: [exp('Assistant(e)', '[Structure, ville]', "Gestion de l'agenda et du courrier\nAccueil des visiteurs et des appels\nClassement et suivi des dossiers")],
    formations: [form('[Diplôme]')],
  },
  {
    id: 'profil-reconversion', nom: 'Reconversion', premium: true,
    template: 'chrono', accent: '#0B7A4B', titre: '[Nouveau métier visé]',
    resume: "Après [X] ans comme [Ancien métier], je me reconvertis comme [Nouveau métier]. Mes compétences en [Compétence transférable] sont directement utiles.",
    competences: '[Compétence transférable 1], [Compétence transférable 2], [Nouvelle compétence acquise]',
    experiences: [exp('[Ancien poste]', '[Entreprise, ville]', '[Réalisation en lien avec le nouveau métier]\n[Compétence utile au nouveau poste]')],
    formations: [form('[Nouvelle formation]')],
  },
];

export const LETTER_CATS = [
  { id: 'candidature', nom: 'Candidatures' },
  { id: 'spontanee', nom: 'Spontanées' },
  { id: 'demande', nom: 'Demandes' },
  { id: 'depart', nom: 'Départ' },
  { id: 'email', nom: 'Emails' },
];

export const LETTERS = [
  /* ---------- Candidatures ---------- */
  { id: 'candidature-standard', cat: 'candidature', premium: false, titre: 'Candidature à une offre',
    objet: 'Candidature au poste de [Poste visé]',
    corps: `Madame, Monsieur,

J'ai lu avec intérêt votre offre pour le poste de [Poste visé], publiée le [Date de l'annonce]. [Nom de l'entreprise] correspond à ce que je recherche et je pense pouvoir vous apporter une aide réelle.

Titulaire de [Diplôme], j'ai travaillé [Durée] comme [Ancien poste], où j'ai [Réalisation principale]. Cette expérience m'a appris à [Compétence clé], ce qui répond à votre besoin.

Je serais heureux(se) de vous rencontrer pour détailler mon parcours. Mon CV est joint à cette lettre.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Prénom NOM]` },
  { id: 'candidature-debutant', cat: 'candidature', premium: false, titre: 'Candidature sans expérience',
    objet: 'Candidature au poste de [Poste visé]',
    corps: `Madame, Monsieur,

Je viens de terminer ma formation en [Filière] à [Établissement] et je souhaite débuter ma carrière comme [Poste visé] chez [Nom de l'entreprise].

Je n'ai pas encore beaucoup d'expérience, mais j'ai déjà [Stage ou projet marquant], où j'ai appris à [Ce que vous avez appris]. Je suis ponctuel(le), sérieux(se) et je progresse vite quand on me forme.

Je suis disponible dès le [Date de disponibilité] et serais ravi(e) de passer un entretien ou un test.

Dans l'attente de votre réponse, recevez mes salutations respectueuses.

[Prénom NOM]` },
  { id: 'candidature-commerciale', cat: 'candidature', premium: true, titre: 'Candidature commerciale',
    objet: 'Candidature – [Poste commercial]',
    corps: `Madame, Monsieur,

Votre recherche d'un(e) [Poste commercial] a immédiatement retenu mon attention. En [Nombre d'années] ans dans la vente de [Produits ou services], j'ai [Résultat chiffré], auprès de [Type de clients].

Je sais prospecter, écouter le besoin du client et conclure, mais aussi entretenir la relation après la vente. Je souhaite mettre cette méthode au service de [Nom de l'entreprise] pour développer votre clientèle.

Je me tiens à votre disposition pour un entretien ou une mise en situation de vente.

Cordialement,

[Prénom NOM]` },
  { id: 'candidature-administrative', cat: 'candidature', premium: true, titre: 'Candidature administrative',
    objet: 'Candidature – [Poste administratif]',
    corps: `Madame, Monsieur,

Je vous propose ma candidature au poste de [Poste administratif]. Organisé(e) et discret(ète), j'ai assuré chez [Ancienne structure] la gestion de [Tâches principales : courrier, agenda, classement, saisie].

Je maîtrise [Logiciels] et je tiens mes dossiers à jour avec rigueur. Je sais aussi accueillir visiteurs et appels avec courtoisie.

Je serais heureux(se) de vous rencontrer pour vous présenter mon parcours.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

[Prénom NOM]` },
  { id: 'candidature-technique', cat: 'candidature', premium: true, titre: 'Candidature métier technique',
    objet: 'Candidature – [Poste technique]',
    corps: `Madame, Monsieur,

Je souhaite postuler au poste de [Poste technique] au sein de [Nom de l'entreprise].

Depuis [Nombre d'années] ans, j'exerce comme [Métier] et j'ai notamment réalisé [Réalisation concrète]. Je connais [Outils ou machines] et je respecte toujours les consignes de sécurité.

Je suis disponible pour un essai pratique ou un entretien à la date qui vous convient.

Cordialement,

[Prénom NOM]` },
  { id: 'candidature-enseignement', cat: 'candidature', premium: true, titre: 'Candidature enseignant',
    objet: 'Candidature – enseignant(e) de [Matière]',
    corps: `Monsieur le Directeur, Madame la Directrice,

J'enseigne [Matière] depuis [Nombre d'années] ans, en classe de [Niveau], à [Dernier établissement]. L'an dernier, [Résultat de vos élèves].

Je prépare mes cours avec soin, j'évalue régulièrement et j'accorde de l'attention aux élèves en difficulté. Je souhaite rejoindre [Nom de l'établissement] pour contribuer à la réussite de vos élèves.

Je reste à votre disposition pour un entretien ou un cours d'essai.

Veuillez agréer mes respectueuses salutations.

[Prénom NOM]` },
  { id: 'candidature-reconversion', cat: 'candidature', premium: true, titre: 'Candidature après reconversion',
    objet: 'Candidature – [Nouveau poste]',
    corps: `Madame, Monsieur,

Après [Nombre d'années] ans comme [Ancien métier], j'ai décidé de changer de voie et de devenir [Nouveau métier]. J'ai suivi [Formation suivie] pour y parvenir.

Mon ancien métier m'a donné des atouts qui servent directement ce poste : [Compétence transférable 1] et [Compétence transférable 2]. Je suis motivé(e) pour repartir de zéro sur certains points.

Je serais heureux(se) de vous expliquer ma démarche lors d'un entretien.

Cordialement,

[Prénom NOM]` },
  { id: 'candidature-recommandation', cat: 'candidature', premium: true, titre: 'Candidature sur recommandation',
    objet: 'Candidature – [Poste visé] (recommandé(e) par [Nom de la personne])',
    corps: `Madame, Monsieur,

[Nom de la personne], [Sa fonction], m'a conseillé de vous écrire au sujet du poste de [Poste visé].

Mon parcours en [Domaine] correspond à vos besoins : [Atout 1] et [Atout 2]. Je suis convaincu(e) de pouvoir m'intégrer rapidement à votre équipe.

Je vous remercie de l'attention que vous porterez à ma candidature et reste disponible pour vous rencontrer.

Cordialement,

[Prénom NOM]` },

  /* ---------- Candidatures spontanées ---------- */
  { id: 'spontanee-generale', cat: 'spontanee', premium: false, titre: 'Candidature spontanée',
    objet: 'Candidature spontanée – [Poste souhaité]',
    corps: `Madame, Monsieur,

[Nom de l'entreprise] attire mon attention pour [Raison précise : un projet, un produit, une réputation]. Je vous propose ma candidature, même si aucune annonce n'est publiée.

Je suis [Votre profil en une phrase] et j'ai [Expérience principale]. Je pense pouvoir être utile à votre équipe comme [Poste souhaité].

Mon CV est joint. Si un besoin se présente, je serais heureux(se) d'échanger avec vous.

Cordialement,

[Prénom NOM]` },
  { id: 'spontanee-stage', cat: 'spontanee', premium: false, titre: 'Demande de stage',
    objet: 'Demande de stage de [Durée du stage]',
    corps: `Madame, Monsieur,

Étudiant(e) en [Filière] à [Établissement], je cherche un stage de [Durée du stage] à partir du [Date de début]. [Nom de l'entreprise] m'intéresse particulièrement pour [Raison précise].

Pendant ce stage, je souhaite découvrir [Métier ou service] et mettre en pratique ce que j'ai appris en [Matière ou projet]. Une convention de stage sera fournie par mon établissement.

Je reste disponible pour tout échange.

Respectueusement,

[Prénom NOM]` },
  { id: 'spontanee-petite-entreprise', cat: 'spontanee', premium: true, titre: 'Petite entreprise ou commerce',
    objet: "Recherche d'un poste de [Poste souhaité]",
    corps: `Bonjour [Nom du responsable],

Je m'appelle [Prénom NOM] et j'habite [Quartier]. Je cherche un emploi de [Poste souhaité] et votre [Boutique, atelier ou restaurant] est proche de chez moi.

J'ai déjà [Expérience], et je suis sérieux(se), ponctuel(le) et prêt(e) à apprendre. Je peux commencer dès le [Date de début].

Puis-je passer vous voir pour en parler ? Vous pouvez aussi m'appeler au [Téléphone].

Merci pour votre temps.

[Prénom NOM]` },
  { id: 'spontanee-ong', cat: 'spontanee', premium: true, titre: 'ONG ou association',
    objet: 'Candidature spontanée – [Poste ou bénévolat]',
    corps: `Madame, Monsieur,

Votre action en faveur de [Cause] correspond à mes convictions. Je souhaite y contribuer comme [Poste ou bénévolat].

J'ai [Expérience utile] et je suis disponible [Disponibilités]. Je suis prêt(e) à intervenir sur le terrain comme au bureau.

Je serais heureux(se) de m'entretenir avec vous sur les besoins de votre organisation.

Cordialement,

[Prénom NOM]` },
  { id: 'relance-candidature', cat: 'spontanee', premium: false, titre: 'Relance après une candidature',
    objet: 'Suite à ma candidature du [Date de candidature]',
    corps: `Bonjour [Nom du contact],

Je me permets de revenir vers vous au sujet de ma candidature pour le poste de [Poste visé], envoyée le [Date de candidature].

Je reste très intéressé(e) par [Nom de l'entreprise] et souhaite savoir où en est le recrutement. Je peux vous transmettre tout document complémentaire.

Merci d'avance pour votre retour.

Cordialement,

[Prénom NOM]` },

  /* ---------- Demandes ---------- */
  { id: 'demande-emploi', cat: 'demande', premium: false, titre: "Demande d'emploi",
    objet: "Demande d'emploi",
    corps: `Monsieur le Directeur, Madame la Directrice,

J'ai l'honneur de solliciter un emploi de [Poste visé] au sein de [Nom de l'entreprise].

Titulaire de [Diplôme], j'ai [Expérience principale]. Je m'engage à travailler avec sérieux et à respecter les règles de votre entreprise.

Dans l'attente d'une réponse favorable, je vous prie d'agréer l'expression de mes respectueuses salutations.

[Prénom NOM]` },
  { id: 'demande-conge', cat: 'demande', premium: false, titre: 'Demande de congé',
    objet: 'Demande de congé',
    corps: `Monsieur, Madame,

Je sollicite un congé de [Nombre de jours] jours, du [Date de début du congé] au [Date de fin du congé] inclus, pour [Motif].

Pendant mon absence, [Nom du collègue] reprendra [Tâches confiées] afin que le travail ne soit pas interrompu.

Je vous remercie de bien vouloir examiner ma demande.

Respectueusement,

[Prénom NOM], [Poste actuel]` },
  { id: 'demande-attestation', cat: 'demande', premium: true, titre: 'Attestation de travail',
    objet: 'Demande d\'attestation de travail',
    corps: `Monsieur, Madame,

Employé(e) dans votre structure depuis le [Date d'embauche] en qualité de [Poste actuel], je vous prie de bien vouloir me délivrer une attestation de travail.

Ce document m'est nécessaire pour [Usage : dossier bancaire, location, visa...].

Je vous remercie d'avance.

Cordialement,

[Prénom NOM]` },
  { id: 'demande-avance', cat: 'demande', premium: true, titre: 'Avance sur salaire',
    objet: 'Demande d\'avance sur salaire',
    corps: `Monsieur, Madame,

Je fais face à [Motif de la demande] et sollicite une avance de [Montant] sur mon salaire du mois de [Mois].

Je propose de la rembourser en [Nombre de mensualités] mensualités, par retenue sur salaire.

Je vous remercie de votre compréhension et reste à votre disposition pour en discuter.

Respectueusement,

[Prénom NOM], [Poste actuel]` },
  { id: 'demande-augmentation', cat: 'demande', premium: true, titre: "Demande d'augmentation",
    objet: 'Demande d\'entretien sur ma rémunération',
    corps: `Monsieur, Madame,

Je travaille comme [Poste actuel] depuis [Durée dans le poste]. Durant cette période, j'ai notamment [Réalisation 1] et [Réalisation 2].

Mes responsabilités ayant évolué, je souhaiterais échanger avec vous sur une revalorisation de ma rémunération.

Je reste disponible à la date qui vous conviendra.

Cordialement,

[Prénom NOM]` },
  { id: 'demande-recommandation', cat: 'demande', premium: true, titre: 'Lettre de recommandation',
    objet: 'Demande de lettre de recommandation',
    corps: `Bonjour [Nom du contact],

Nous avons travaillé ensemble [Période de collaboration]. Je prépare actuellement ma candidature pour [Poste ou formation visé(e)] et votre avis compterait beaucoup.

Accepteriez-vous de rédiger une lettre de recommandation ? Je peux vous envoyer mon CV et un résumé de nos missions pour vous faciliter la tâche.

Merci beaucoup pour votre aide.

Cordialement,

[Prénom NOM]` },

  /* ---------- Départ ---------- */
  { id: 'demission-simple', cat: 'depart', premium: false, titre: 'Démission simple',
    objet: 'Démission',
    corps: `Monsieur, Madame,

Par la présente, je vous informe de ma décision de démissionner du poste de [Poste actuel] que j'occupe depuis le [Date d'embauche].

Conformément à mon contrat, je respecterai un préavis de [Durée du préavis]. Mon dernier jour de travail sera donc le [Dernier jour].

Je vous remercie pour la confiance accordée durant ces années.

Respectueusement,

[Prénom NOM]` },
  { id: 'demission-remerciements', cat: 'depart', premium: true, titre: 'Démission avec remerciements',
    objet: 'Démission',
    corps: `Monsieur, Madame,

Après [Durée dans l'entreprise] chez [Nom de l'entreprise], j'ai décidé de poursuivre mon parcours ailleurs et je vous remets ma démission du poste de [Poste actuel].

Je tiens à vous remercier pour ce que j'ai appris ici, notamment [Ce que vous avez appris]. Je ferai le nécessaire pour préparer ma succession et transmettre mes dossiers jusqu'au [Dernier jour].

Cordialement,

[Prénom NOM]` },
  { id: 'demande-certificat-travail', cat: 'depart', premium: true, titre: 'Certificat de travail',
    objet: 'Demande de certificat de travail',
    corps: `Monsieur, Madame,

J'ai quitté [Nom de l'entreprise] le [Dernier jour] après avoir occupé le poste de [Poste occupé].

Je vous prie de bien vouloir me remettre mon certificat de travail ainsi que mon solde de tout compte.

Je vous remercie par avance.

Cordialement,

[Prénom NOM]` },

  /* ---------- Emails ---------- */
  { id: 'email-envoi-cv', cat: 'email', premium: false, titre: 'Envoyer son CV',
    objet: 'Candidature – [Poste visé] – [Prénom NOM]',
    corps: `Bonjour,

Je vous envoie ma candidature pour le poste de [Poste visé]. Vous trouverez en pièces jointes mon CV et ma lettre de motivation.

Je reste disponible pour un entretien et peux être joint(e) au [Téléphone].

Cordialement,

[Prénom NOM]` },
  { id: 'email-remerciement-entretien', cat: 'email', premium: false, titre: 'Remercier après un entretien',
    objet: 'Merci pour notre entretien du [Date de l\'entretien]',
    corps: `Bonjour [Nom du recruteur],

Merci de m'avoir reçu(e) le [Date de l'entretien] pour le poste de [Poste visé]. Notre échange a renforcé mon envie de rejoindre [Nom de l'entreprise], en particulier [Point précis évoqué].

Je reste à votre disposition pour tout complément d'information.

Cordialement,

[Prénom NOM]` },
  { id: 'email-accepter-offre', cat: 'email', premium: true, titre: 'Accepter une offre',
    objet: 'Acceptation de votre proposition',
    corps: `Bonjour [Nom du recruteur],

Je vous remercie pour votre proposition au poste de [Poste proposé]. Je l'accepte avec plaisir et peux commencer le [Date de début].

Pouvez-vous me confirmer les documents à fournir pour mon dossier ?

Cordialement,

[Prénom NOM]` },
  { id: 'email-refuser-offre', cat: 'email', premium: true, titre: 'Refuser une offre',
    objet: 'Réponse à votre proposition',
    corps: `Bonjour [Nom du recruteur],

Merci pour votre proposition au poste de [Poste proposé] et pour le temps accordé. Après réflexion, je ne pourrai pas l'accepter, car [Raison brève].

Je vous souhaite de trouver rapidement le bon profil et espère que nos chemins se croiseront à nouveau.

Cordialement,

[Prénom NOM]` },
  { id: 'email-negocier-salaire', cat: 'email', premium: true, titre: 'Négocier le salaire',
    objet: 'Votre proposition pour le poste de [Poste proposé]',
    corps: `Bonjour [Nom du recruteur],

Je vous remercie pour votre offre, qui m'enthousiasme. Compte tenu de [Expérience ou responsabilités], je souhaiterais que nous discutions d'une rémunération de [Montant souhaité].

Je suis ouvert(e) à la discussion et disponible pour en parler au moment qui vous convient.

Cordialement,

[Prénom NOM]` },
  { id: 'email-report-entretien', cat: 'email', premium: true, titre: "Reporter un entretien",
    objet: "Demande de report d'entretien",
    corps: `Bonjour [Nom du recruteur],

Je ne pourrai malheureusement pas me présenter à l'entretien prévu le [Date de l'entretien], en raison de [Motif]. Serait-il possible de le reporter au [Date proposée] ou à une autre date qui vous arrange ?

Je vous remercie de votre compréhension.

Cordialement,

[Prénom NOM]` },
];
