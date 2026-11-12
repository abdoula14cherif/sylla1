export const EMPTY_ITEMS = {
  experiences: { poste: '', entreprise: '', debut: '', fin: '', desc: '' },
  formations: { diplome: '', ecole: '', debut: '', fin: '' },
  langues: { nom: '', niveau: 2 },
};

export const emptyState = () => ({
  lang: 'fr',
  template: 'classique',
  accent: '#14213D',
  photo: '',
  identite: { nom: '', titre: '', tel: '', email: '', ville: '', lien: '' },
  resume: '',
  experiences: [{ ...EMPTY_ITEMS.experiences }],
  formations: [{ ...EMPTY_ITEMS.formations }],
  competences: '',
  langues: [
    { nom: 'Français', niveau: 3 },
    { nom: 'Anglais', niveau: 1 },
  ],
  loisirs: '',
  police: 'auto',
  taille: 'normal',
  photoForme: 'rond',
  format: 'A4',
  sections: { profil: true, experiences: true, formations: true, competences: true, langues: true, loisirs: true, extra: true },
  extraTitre: '',
  extraTexte: '',
});

export const sampleState = () => ({
  lang: 'fr',
  template: 'moderne',
  accent: '#0B7A4B',
  photo: '',
  identite: {
    nom: 'Nadège Mballa',
    titre: 'Assistante commerciale',
    tel: '+237 6 00 00 00 00',
    email: 'nadege.mballa@email.com',
    ville: 'Douala, Cameroun',
    lien: '',
  },
  resume:
    "Assistante commerciale avec 4 ans d'expérience en vente et service client. Rigoureuse, à l'aise avec les chiffres et les outils bureautiques, je cherche un poste où fidéliser les clients et développer le chiffre d'affaires.",
  experiences: [
    {
      poste: 'Assistante commerciale',
      entreprise: 'Société Atlantique, Douala',
      debut: 'Mars 2022',
      fin: '',
      desc: 'Suivi de 80 clients actifs et relances par téléphone\nÉdition des devis et des factures\nHausse de 15 % des ventes sur le dernier exercice',
    },
    {
      poste: 'Vendeuse',
      entreprise: 'Boutique Mode Plus, Douala',
      debut: 'Janvier 2020',
      fin: 'Février 2022',
      desc: 'Accueil et conseil de la clientèle\nGestion du stock et de la caisse',
    },
  ],
  formations: [
    { diplome: 'BTS Commerce International', ecole: 'Institut supérieur de Douala', debut: '2018', fin: '2020' },
    { diplome: 'Baccalauréat G2', ecole: 'Lycée de New Bell', debut: '2015', fin: '2018' },
  ],
  competences: 'Vente, Relation client, Excel, Word, Facturation, Négociation',
  langues: [
    { nom: 'Français', niveau: 3 },
    { nom: 'Anglais', niveau: 1 },
  ],
  loisirs: 'Lecture, Bénévolat, Cuisine',
  police: 'auto',
  taille: 'normal',
  photoForme: 'rond',
  format: 'A4',
  sections: { profil: true, experiences: true, formations: true, competences: true, langues: true, loisirs: true, extra: true },
  extraTitre: 'Permis et certifications',
  extraTexte: 'Permis B\nCertificat Excel avancé',
});
