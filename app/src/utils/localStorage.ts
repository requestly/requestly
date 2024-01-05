const storagePrefix = "rq_";

const getStorageKey = (key: string) => `${storagePrefix}${key}`;

// TODO: move in top level utils
export const localStorage = {
  setItem(key: string, value: unknown) {
    return window.localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  },

  getItem(key: string) {
    return JSON.parse(window.localStorage.getItem(getStorageKey(key))) as unknown;
  },

  removeItem(key: string) {
    return window.localStorage.removeItem(getStorageKey(key));
  },

  clearStorage(key: string) {
    return window.localStorage.clear();
  },
};
