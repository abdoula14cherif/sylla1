export const DOC_CATS = [
  { id: 'paiement', nom: 'Paiements' },
  { id: 'attestation', nom: 'Attestations' },
  { id: 'contrat', nom: 'Contrats' },
];

export const DOC_NOTE =
  'Ce sont des modèles généraux à adapter. Pour un engagement important (location, dette, contrat), faites relire le document par un professionnel du droit.';

export const DOCS = [
  { id: 'doc-recu-paiement', cat: 'paiement', format: 'doc', titre: 'Reçu de paiement', objet: '',
    corps: `REÇU DE PAIEMENT

Je soussigné(e) [Nom de la personne qui reçoit], reconnais avoir reçu de [Nom de la personne qui paie] la somme de [Montant en chiffres] FCFA ([Montant en lettres]), par [Mode de paiement : espèces, Mobile Money, virement].

Cette somme correspond à [Objet du paiement].

Fait à [Ville], le [Date].

Signature de la personne qui reçoit :
[Nom de la personne qui reçoit]` },
  { id: 'doc-decharge', cat: 'paiement', format: 'doc', titre: 'Décharge', objet: '',
    corps: `DÉCHARGE

Je soussigné(e) [Nom de la personne qui reçoit], reconnais avoir reçu de [Nom de la personne ou de la structure] les éléments suivants : [Liste des éléments remis].

La présente décharge est établie pour servir et valoir ce que de droit.

Fait à [Ville], le [Date].

Signature :
[Nom de la personne qui reçoit]` },
  { id: 'doc-reconnaissance-dette', cat: 'paiement', format: 'doc', titre: 'Reconnaissance de dette', objet: '',
    corps: `RECONNAISSANCE DE DETTE

Je soussigné(e) [Nom du débiteur], demeurant à [Adresse du débiteur], reconnais devoir à [Nom du créancier], demeurant à [Adresse du créancier], la somme de [Montant en chiffres] FCFA ([Montant en lettres]).

Je m'engage à rembourser cette somme selon les modalités suivantes : [Modalités de remboursement : date unique ou mensualités].

Fait à [Ville], le [Date], en deux exemplaires.

Le débiteur : [Nom du débiteur]
Le créancier : [Nom du créancier]` },
  { id: 'doc-attestation-hebergement', cat: 'attestation', format: 'doc', titre: "Attestation d'hébergement", objet: '',
    corps: `ATTESTATION D'HÉBERGEMENT

Je soussigné(e) [Nom de la personne qui héberge], né(e) le [Date de naissance] à [Lieu de naissance], demeurant à [Adresse], atteste héberger à mon domicile [Nom de la personne hébergée], depuis le [Date de début de l'hébergement].

La présente attestation est établie pour servir et valoir ce que de droit.

Fait à [Ville], le [Date].

[Nom de la personne qui héberge]` },
  { id: 'doc-contrat-prestation', cat: 'contrat', format: 'doc', titre: 'Contrat de prestation de service', objet: '',
    corps: `CONTRAT DE PRESTATION DE SERVICE

Entre [Nom du prestataire], demeurant à [Adresse du prestataire], ci-après « le prestataire »,
et [Nom du client], demeurant à [Adresse du client], ci-après « le client ».

Article 1 – Objet
Le prestataire réalise pour le client la prestation suivante : [Description de la prestation].

Article 2 – Durée et délais
La prestation commence le [Date de début] et sera terminée au plus tard le [Date de fin].

Article 3 – Prix et paiement
Le prix total est de [Prix] FCFA, payable ainsi : [Modalités de paiement : acompte, solde, dates].

Article 4 – Modification ou arrêt
Toute modification se fait par accord écrit des deux parties. Si la prestation s'arrête avant la fin, le travail déjà réalisé reste dû.

Article 5 – Litiges
Les parties cherchent d'abord un accord à l'amiable. À défaut, le litige est porté devant la juridiction compétente.

Fait à [Ville], le [Date], en deux exemplaires.

Le prestataire : [Nom du prestataire]
Le client : [Nom du client]` },
  { id: 'doc-contrat-location', cat: 'contrat', format: 'doc', titre: 'Contrat de location (logement)', objet: '',
    corps: `CONTRAT DE LOCATION

Entre [Nom du bailleur], propriétaire, demeurant à [Adresse du bailleur], ci-après « le bailleur »,
et [Nom du locataire], demeurant à [Adresse du locataire], ci-après « le locataire ».

Article 1 – Logement loué
Le bailleur loue au locataire : [Description et adresse du logement].

Article 2 – Durée
La location commence le [Date de début] pour une durée de [Durée].

Article 3 – Loyer
Le loyer mensuel est de [Loyer mensuel] FCFA, payable avant le [Jour limite de paiement] de chaque mois, par [Mode de paiement].

Article 4 – Caution
Le locataire verse une caution de [Montant de la caution] FCFA. Elle lui est rendue à son départ, après état des lieux, déduction faite des dégâts éventuels.

Article 5 – Obligations
Le locataire entretient le logement, paie ses charges ([Charges : eau, électricité]) et ne sous-loue pas sans accord écrit du bailleur. Le bailleur remet un logement en bon état d'usage.

Article 6 – Fin du contrat
Chacune des parties peut y mettre fin en prévenant l'autre par écrit, [Durée du préavis] à l'avance.

Fait à [Ville], le [Date], en deux exemplaires.

Le bailleur : [Nom du bailleur]
Le locataire : [Nom du locataire]` },
];
