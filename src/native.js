import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

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

// Ouvre un lien (WhatsApp, email…) dans l'application adaptée
export function openLink(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- Fichiers (images, contact .vcf) ---------- */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// files : [{ blob, name }]. Retourne : shared, cancelled, downloaded ou failed.
// Dans l'app : feuille de partage du téléphone (WhatsApp, Enregistrer…). Sur le web : partage si possible, sinon téléchargement.
export async function shareFiles(title, files, text = '') {
  if (isNative) {
    try {
      const uris = [];
      for (const f of files) {
        const w = await Filesystem.writeFile({ path: f.name, data: await blobToBase64(f.blob), directory: Directory.Cache });
        uris.push(w.uri);
      }
      await Share.share({ title, text, files: uris, dialogTitle: title });
      return 'shared';
    } catch (e) {
      return /cancel/i.test(String((e && e.message) || '')) ? 'cancelled' : 'failed';
    }
  }
  const list = files.map((f) => new File([f.blob], f.name, { type: f.blob.type }));
  if (navigator.canShare && navigator.canShare({ files: list })) {
    try {
      await navigator.share({ files: list, title, text });
      return 'shared';
    } catch (e) {
      return e && e.name === 'AbortError' ? 'cancelled' : 'failed';
    }
  }
  files.forEach((f, i) => setTimeout(() => downloadBlob(f.blob, f.name), i * 350));
  return 'downloaded';
}

// Enregistrer un seul fichier : téléchargement sur le web, feuille de partage dans l'app
export async function saveFile(title, blob, name) {
  if (isNative) return shareFiles(title, [{ blob, name }]);
  downloadBlob(blob, name);
  return 'downloaded';
}
