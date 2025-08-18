import { RQAPI } from "../../types";

const HISTORY_LOCAL_STORE_KEY = "rq-api-history";
const MAX_LENGTH = 20;

export const getHistoryFromStore = (): RQAPI.ApiEntry[] => {
  return JSON.parse(window.localStorage.getItem(HISTORY_LOCAL_STORE_KEY) || "[]");
};

export const saveHistoryToStore = (history: RQAPI.ApiEntry[]): void => {
  window.localStorage.setItem(HISTORY_LOCAL_STORE_KEY, JSON.stringify(history));
};

export const addToHistoryInStore = (entry: RQAPI.ApiEntry): void => {
  const history = getHistoryFromStore();

  history.push({ ...entry, response: null });

  if (history.length > MAX_LENGTH) {
    history.shift();
  }

  saveHistoryToStore(history);
};

export const clearHistoryFromStore = () => {
  window.localStorage.removeItem(HISTORY_LOCAL_STORE_KEY);
};
