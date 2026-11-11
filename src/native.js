import { Share } from '@capacitor/share';

export const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

// Ouvre le partage du téléphone (WhatsApp, SMS, email…). Retourne : shared, cancelled, copied ou failed.
export async function shareText(title, text) {
  try {
    await Share.share({ title, text, dialogTitle: title });
    return 'shared';
  } catch (e) {
    if (/cancel/i.test(String((e && e.message) || ''))) return 'cancelled';
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return 'shared';
      } catch {
        return 'cancelled';
      }
    }
    return (await copyText(text)) ? 'copied' : 'failed';
  }
}
