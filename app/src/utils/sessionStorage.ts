import { isEmpty } from "lodash";

const storagePrefix = "rq_";

const getStorageKey = (key: string) => `${storagePrefix}${key}`;

export const sessionStorage = {
  setItem(key: string, data: string | [] | {}) {
    typeof window !== "undefined" && window.sessionStorage.setItem(getStorageKey(key), JSON.stringify(data));
  },

  getItem(key: string, emptyValue: string | [] | {}) {
    return (
      (typeof window !== "undefined" &&
        !isEmpty(window.sessionStorage.getItem(getStorageKey(key))) &&
        JSON.parse(window.sessionStorage.getItem(getStorageKey(key)))) ||
      (typeof emptyValue === "undefined" ? {} : emptyValue)
    );
  },

  removeItem(key: string) {
    return window.sessionStorage.removeItem(getStorageKey(key));
  },

  clearStorage() {
    return window.sessionStorage.clear();
  },
};
