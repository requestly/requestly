import { RQAPI } from "../../types";

const HISTORY_LOCAL_STORE_KEY = "rq-api-history";
const MAX_LENGTH = 20;


export type HistoryEntry = RQAPI.ApiEntry & {
  historyId: string;
  createdTs: number;
};

export const getHistoryFromStore = (): HistoryEntry[] => {
  return JSON.parse(window.localStorage.getItem(HISTORY_LOCAL_STORE_KEY) || "[]");
};

export const saveHistoryToStore = (history: HistoryEntry[]): void => {
  window.localStorage.setItem(HISTORY_LOCAL_STORE_KEY, JSON.stringify(history));
};

export const addToHistoryInStore = (entry: HistoryEntry): void => {
  const history = getHistoryFromStore();
  history.push({ ...entry, response: null });

  if (history.length > MAX_LENGTH) {
    history.shift();
  }

  saveHistoryToStore(history);
};

export const clearHistoryFromStore = (): void => {
  window.localStorage.removeItem(HISTORY_LOCAL_STORE_KEY);
};

export const deleteHistoryItemFromStore = (id: string): void => {
  const history = getHistoryFromStore();
  const updatedHistory = history.filter((entry) => entry.historyId !== id);
  saveHistoryToStore(updatedHistory);
};

export const deleteHistoryByDateFromStore = (dateKey: string): void => {
  const history = getHistoryFromStore();
  const updatedHistory = history.filter((entry) => {
    const entryDate = new Date(entry.createdTs).toISOString().slice(0, 10);
    return entryDate !== dateKey;
  });
  saveHistoryToStore(updatedHistory);
};
