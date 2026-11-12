import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { PAGES } from './design.js';
import { isNative } from './native.js';

/* ---------- 1. Copier les styles calculés (le rendu part dans un SVG isolé) ---------- */
function cssOf(cs) {
  let css = '';
  for (let i = 0; i < cs.length; i += 1) css += `${cs[i]}:${cs.getPropertyValue(cs[i])};`;
  return css;
}

function inlineStyles(src, dst) {
  dst.setAttribute('style', cssOf(getComputedStyle(src)));
  const kids = [...dst.children];
  ['::before', '::after'].forEach((ps) => {
    const pcs = getComputedStyle(src, ps);
    const content = pcs.getPropertyValue('content');
    if (content && content !== 'none' && content !== 'normal') {
      const span = document.createElement('span');
      span.setAttribute('style', cssOf(pcs));
      span.textContent = content.replace(/^["']|["']$/g, '');
      if (ps === '::before') dst.insertBefore(span, dst.firstChild);
      else dst.appendChild(span);
    }
  });
  [...src.children].forEach((child, i) => kids[i] && inlineStyles(child, kids[i]));
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Rendu impossible'));
    img.src = url;
  });
}

/* ---------- 2. Élément -> image -> pages JPEG ---------- */
async function renderPages(node, page, scale = 2) {
  const w = page.w;
  const h = Math.max(Math.ceil(node.offsetHeight), page.h);
  const clone = node.cloneNode(true);
  inlineStyles(node, clone);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  clone.style.margin = '0';
  clone.style.transform = 'none';
  clone.style.position = 'static';
  const xml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="${w}" height="${h}">${xml}</foreignObject></svg>`;
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);

  const n = Math.max(1, Math.ceil(h / page.h - 0.002));
  const big = document.createElement('canvas');
  big.width = w * scale;
  big.height = n * page.h * scale;
  const g = big.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, big.width, big.height);
  g.drawImage(img, 0, 0, w * scale, h * scale);

  const out = [];
  for (let i = 0; i < n; i += 1) {
    const c = document.createElement('canvas');
    c.width = w * scale;
    c.height = page.h * scale;
    c.getContext('2d').drawImage(big, 0, i * page.h * scale, c.width, c.height, 0, 0, c.width, c.height);
    const b64 = c.toDataURL('image/jpeg', 0.92).split(',')[1];
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k += 1) bytes[k] = bin.charCodeAt(k);
    out.push({ jpeg: bytes, w: c.width, h: c.height });
  }
  return out;
}

/* ---------- 3. Pages JPEG -> fichier PDF ---------- */
export function makePDF(pages, page, title = 'Document') {
  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let len = 0;
  const push = (u8) => {
    chunks.push(u8);
    len += u8.length;
  };
  const str = (s) => push(enc.encode(s));
  const obj = (id, body) => {
    offsets[id] = len;
    str(`${id} 0 obj\n${body}\nendobj\n`);
  };
  let hex = '<FEFF';
  for (let i = 0; i < title.length; i += 1) hex += title.charCodeAt(i).toString(16).padStart(4, '0');
  hex += '>';

  push(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  const kids = pages.map((_, i) => `${4 + 3 * i} 0 R`).join(' ');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  obj(3, `<< /Title ${hex} /Producer (Digiform) >>`);
  const W = page.ptW.toFixed(2);
  const H = page.ptH.toFixed(2);
  pages.forEach((p, i) => {
    const pid = 4 + 3 * i;
    const cid = pid + 1;
    const iid = pid + 2;
    obj(pid, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${iid} 0 R >> >> /Contents ${cid} 0 R >>`);
    const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(cid, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    offsets[iid] = len;
    str(`${iid} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
    push(p.jpeg);
    str('\nendstream\nendobj\n');
  });
  const count = 4 + 3 * pages.length;
  const xref = len;
  let x = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i += 1) x += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  x += `trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF`;
  str(x);

  const out = new Uint8Array(len);
  let pos = 0;
  chunks.forEach((c) => {
    out.set(c, pos);
    pos += c.length;
  });
  return out;
}

/* ---------- 4. Remise du fichier : partage (téléphone) ou téléchargement ---------- */
function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function deliverPDF(bytes, filename, title) {
  if (isNative) {
    const res = await Filesystem.writeFile({ path: filename, data: toBase64(bytes), directory: Directory.Cache });
    try {
      await Share.share({ title, dialogTitle: title, files: [res.uri] });
      return 'shared';
    } catch (e) {
      return /cancel/i.test(String((e && e.message) || '')) ? 'cancelled' : 'failed';
    }
  }
  const blob = new Blob([bytes], { type: 'application/pdf' });
  try {
    const file = new File([blob], filename, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'cancelled';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'downloaded';
}

/* ---------- 5. Tout en un : construit, photographie, assemble, remet ---------- */
export async function exportDocument({ fmt, filename, title, build }) {
  const page = PAGES[fmt] || PAGES.A4;
  const stage = document.createElement('div');
  stage.id = 'pdf-stage';
  stage.style.cssText = `position:fixed;left:-30000px;top:0;width:${page.w}px;background:#fff;`;
  document.body.appendChild(stage);
  try {
    const node = build(stage, page);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all([...node.querySelectorAll('img')].map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
    const pages = await renderPages(node, page);
    return await deliverPDF(makePDF(pages, page, title), filename, title);
  } finally {
    stage.remove();
  }
}

/* ---------- 6. Impression (navigateur) au format choisi ---------- */
export function printPage(fmt) {
  const page = PAGES[fmt] || PAGES.A4;
  let st = document.getElementById('page-size');
  if (!st) {
    st = document.createElement('style');
    st.id = 'page-size';
    document.head.appendChild(st);
  }
  st.textContent = `@page{size:${page.mm[0]}mm ${page.mm[1]}mm;margin:0}`;
  document.documentElement.style.setProperty('--pw', `${page.mm[0]}mm`);
  document.documentElement.style.setProperty('--ph', `${page.mm[1]}mm`);
  window.print();
}
