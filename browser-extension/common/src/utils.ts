import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "./constants";
import { saveRecord } from "./storage";

export function generateUUID() {
  return uuid();
}

export const updateLastUpdatedTS = () => {
  return saveRecord(STORAGE_KEYS.LAST_UPDATED_TS, Date.now());
};
