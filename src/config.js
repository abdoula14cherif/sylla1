export const CONFIG = {
  // Fichier de réglages que l'admin modifie sur GitHub (premium, lien de paiement, codes d'activation).
  // Mettez-le dans un petit dépôt PUBLIC séparé (ex. digiform-config) pour pouvoir garder le dépôt du code PRIVÉ.
  // L'app essaie les adresses dans l'ordre ; sans internet, elle garde les derniers réglages reçus.
  premiumUrls: [
    'https://raw.githubusercontent.com/abdoula14cherif/digiform-config/main/premium.json',
    'https://raw.githubusercontent.com/abdoula14cherif/sylla1/main/premium.json',
  ],

  // Page GitHub où l'admin colle le nouveau premium.json
  adminEditUrl: 'https://github.com/abdoula14cherif/digiform-config/edit/main/premium.json',

  // Numéro WhatsApp de l'admin, format international sans le + (modifiable aussi dans premium.json)
  adminWhatsapp: '237675371857',

  // Indicatif par défaut pour les numéros saisis sans « + » (237 = Cameroun)
  countryCode: '237',

  // true = tout est débloqué (pratique pour tester)
  unlockAll: false,
};

// Version « Google Play gratuite » : tout est débloqué, aucun paiement ni lien externe dans l'app.
// (compilée avec VITE_STORE=play par le workflow « Google Play »)
export const FREE_BUILD = import.meta.env.VITE_STORE === 'play';
