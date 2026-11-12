// Logo, cachet et signature de l'utilisateur : gardés sur le téléphone
const KEY = 'digiform.assets.v1';
const subs = new Set();
let data = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
})();
const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* stockage plein */
  }
  subs.forEach((fn) => fn());
};

export const getAssets = () => data;
export const setAsset = (k, v) => {
  data = { ...data, [k]: v };
  persist();
};
export const clearAsset = (...keys) => {
  data = { ...data };
  keys.forEach((k) => delete data[k]);
  persist();
};
export const onAssets = (fn) => subs.add(fn);
