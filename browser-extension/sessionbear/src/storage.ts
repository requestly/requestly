import { STORAGE_TYPE } from "./constants";

type StoreObject = { [key: string]: any };

export const getSuperObject = async (): Promise<StoreObject> => {
  return new Promise((resolve) => {
    chrome.storage[STORAGE_TYPE].get(null, resolve);
  });
};

export const getAllRecords = async (): Promise<unknown[]> => {
  const superObject = await getSuperObject();
  return Object.values(superObject).filter((val) => !!val);
};

export const saveObject = async (object: StoreObject): Promise<void> => {
  await chrome.storage[STORAGE_TYPE].set(object);
};

export const saveRecord = async <T>(key: string, record: T): Promise<void> => {
  await saveObject({ [key]: record });
};

export const getRecord = async <T>(key: string): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage[STORAGE_TYPE].get(key, (records) => resolve(records[key]));
  });
};

export const getRecords = async <T>(keys: string[]): Promise<T[]> => {
  const records = await chrome.storage[STORAGE_TYPE].get(keys);
  return Object.values(records);
};

export const removeRecord = async (key: string): Promise<void> => {
  await chrome.storage[STORAGE_TYPE].remove(key);
};

export const clearAllRecords = async (): Promise<void> => {
  await chrome.storage[STORAGE_TYPE].clear();
};

export enum ChangeType {
  MODIFIED,
  CREATED,
  DELETED,
}

export interface Change<T = unknown> {
  changeType: ChangeType;
  key: string;
  oldValue?: T;
  newValue?: T;
}

export interface RecordChangeFilters<T> {
  changeTypes?: ChangeType[];
  keyFilter?: string;
  valueFilter?: (value: T) => boolean;
}

export const onRecordChange = <T = unknown>(
  filters: RecordChangeFilters<T>,
  callback: (changes: Change<T>[]) => void
): void => {
  chrome.storage.onChanged.addListener((storeChanges, areaName) => {
    if (areaName === STORAGE_TYPE) {
      const changes: Change<T>[] = [];

      Object.entries(storeChanges).forEach(([key, storeChange]) => {
        let changeType: ChangeType;
        let testValue: T;

        if (typeof storeChange.newValue !== "undefined") {
          if (typeof storeChange.oldValue !== "undefined") {
            changeType = ChangeType.MODIFIED;
          } else {
            changeType = ChangeType.CREATED;
          }
          testValue = storeChange.newValue;
        } else if (typeof storeChange.oldValue !== "undefined") {
          changeType = ChangeType.DELETED;
          testValue = storeChange.oldValue;
        } else {
          return;
        }

        if (filters?.changeTypes?.length && !filters.changeTypes.includes(changeType)) {
          return;
        }

        if (filters?.keyFilter && key !== filters.keyFilter) {
          return;
        }

        if (filters?.valueFilter && !filters.valueFilter(testValue)) {
          return;
        }

        changes.push({ changeType, key, ...storeChange });
      });

      if (changes.length) {
        callback(changes);
      }
    }
  });
};
