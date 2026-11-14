import { App } from '@capacitor/app';
import { isNative } from './native.js';
import { toast } from './premium.js';

// Bouton « retour » d'Android : revient d'un écran en arrière au lieu de quitter l'app.
// Ordre : fenêtre ouverte → sous-écran / salle → accueil → (double appui) quitter.
let lastTry = 0;
export function handleBack(exit = () => App.exitApp()) {
  {
    const modal = document.querySelector('#app-modal:not([hidden])');
    if (modal) {
      modal.hidden = true;
      return;
    }
    // Même action que la flèche « ← » de l'écran affiché (Aperçu → Modifier, Détail → Liste, Salle → Accueil)
    const room = [...document.querySelectorAll('.overlay')].find((o) => !o.hidden);
    const btn = room && room.querySelector('.ov-top [data-act="back"]');
    if (btn) {
      btn.click();
      return;
    }
    const route = location.hash.replace(/^#\/?/, '') || 'home';
    if (route !== 'home') {
      if (history.length > 1) history.back();
      else location.replace('#/');
      return;
    }
    const now = Date.now();
    if (now - lastTry < 2000) exit();
    else {
      lastTry = now;
      toast('Appuyez encore pour quitter');
    }
  }
}

export function initBackButton() {
  if (isNative) App.addListener('backButton', () => handleBack());
}
