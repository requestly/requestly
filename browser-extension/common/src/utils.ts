import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "./constants";
import { getRecord, saveRecord } from "./storage";

export function generateUUID() {
  return uuid();
}

export const getLastUpdatedTS = () => {
  return getRecord(STORAGE_KEYS.LAST_UPDATED_TS);
};

export const updateLastUpdatedTS = () => {
  return saveRecord(STORAGE_KEYS.LAST_UPDATED_TS, Date.now());
};
