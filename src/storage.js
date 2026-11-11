const KEY = 'digiform.cv.v1';

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* stockage plein ou bloqué */
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* rien à faire */
  }
}