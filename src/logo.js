// Logo Digiform : une page avec un coin plié ambre et un « D » tracé dedans.
// 100 % vectoriel : net à toutes les tailles (en-têtes, favicon, icône).
export const logoSVG = (size = 32, animated = false) =>
  `<svg class="logo${animated ? ' logo-anim' : ''}" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="Digiform" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="#14213D"/>
  <path d="M16 0h32L0 48V16A16 16 0 0 1 16 0z" fill="#fff" opacity=".06"/>
  <path d="M20 13h17l11 11v27a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4z" fill="#fff"/>
  <path class="fold" d="M37 13v9a2 2 0 0 0 2 2h9z" fill="#F2A900"/>
  <path class="dd" pathLength="100" d="M25.5 30v16h5.2a8 8 0 0 0 0-16z" fill="none" stroke="#14213D" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;

export const logoDataURI = () => `data:image/svg+xml,${encodeURIComponent(logoSVG(64))}`;
