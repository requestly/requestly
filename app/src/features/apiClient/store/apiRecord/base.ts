import { RQAPI } from "features/apiClient/types";

export type BaseApiEntryStoreState<T extends RQAPI.ApiEntry = RQAPI.ApiEntry, TAdditionalData = {}> = {
  entry: T;
  recordId: RQAPI.ApiRecord["id"];
  hasUnsavedChanges: boolean;
  updateEntryRequest: (patch: Partial<T["request"]>) => void;
  updateEntryResponse: (response: T["response"]) => void;
  updateEntryAuth: (auth: RQAPI.Auth) => void;
  updateEntryTestResults: (testResults: RQAPI.ApiEntryMetaData["testResults"]) => void;
  updateEntryScripts: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => void;
  updateEntry: (updatedEntry: T) => void;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  getEntry: () => T;
} & TAdditionalData;

export const createBaseApiEntryState = <T extends RQAPI.ApiEntry>(
  entry: T,
  recordId: RQAPI.ApiRecord["id"],
  set: any,
  get: any
): BaseApiEntryStoreState<T, {}> => {
  // type a = setType<T>;
  return {
    recordId,
    entry,
    hasUnsavedChanges: false,
    updateEntryRequest: (patch: Partial<T["request"]>) => {
      const entry = get().entry;
      set({
        entry: { ...entry, request: { ...entry.request, ...patch } },
        hasUnsavedChanges: true,
      });
    },
    updateEntryAuth: (auth: RQAPI.Auth) => {
      const entry = get().entry;
      set({
        entry: { ...entry, auth },
        hasUnsavedChanges: true,
      });
    },
    updateEntryResponse: (response: T["response"]) => {
      const entry = get().entry;
      set({
        entry: { ...entry, response },
      });
    },
    updateEntryTestResults: (testResults: RQAPI.ApiEntryMetaData["testResults"]) => {
      const entry = get().entry;
      set({
        entry: { ...entry, testResults },
        hasUnsavedChanges: true,
      });
    },
    updateEntryScripts: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => {
      const entry = get().entry;
      set({
        entry: { ...entry, scripts },
        hasUnsavedChanges: true,
      });
    },
    updateEntry: (updatedEntry: T) => {
      const currentEntry = get().entry;
      set({ entry: { ...currentEntry, ...updatedEntry } });
    },
    getEntry: () => get().entry,
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => {
      set({ hasUnsavedChanges });
    },
  };
};
