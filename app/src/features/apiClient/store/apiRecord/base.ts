import { RQAPI } from "features/apiClient/types";
// import { create } from "zustand";

export type BaseApiRecordStoreState<T extends RQAPI.ApiRecord = RQAPI.ApiRecord, TAdditionalData = {}> = {
  record: T;
  hasUnsavedChanges: boolean;
  updateRecordName: (name: string) => void;
  updateRecordRequest: (patch: Partial<T["data"]["request"]>) => void;
  updateRecordResponse: (response: T["data"]["response"]) => void;
  updateRecordAuth: (auth: RQAPI.Auth) => void;
  updateRecordTestResults: (testResults: RQAPI.ApiEntryMetaData["testResults"]) => void;
  updateRecordScripts: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => void;
  updateRecord: (record: T["data"]) => void;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  getRecord: () => T;
  getRecordName: () => string;
} & TAdditionalData;

// type setType<T extends RQAPI.ApiRecord> = ReturnType<typeof create<BaseApiRecordStoreState<T, {}>>> extends (
//   set: infer S,
//   ...args: any[]
// ) => any
//   ? S
//   : unknown;
// type setType<T extends RQAPI.ApiRecord> = Params UseBoundStore<StoreApi<GraphQLRecordState>> => any
//   ? S
//   : unknown;

export const createBaseApiRecordState = <T extends RQAPI.ApiRecord>(
  record: T,
  set: any,
  get: any
): BaseApiRecordStoreState<T, {}> => {
  // type a = setType<T>;
  return {
    record,
    hasUnsavedChanges: false,
    updateRecordRequest: (patch: Partial<RQAPI.GraphQLRequest>) => {
      const record = get().record;
      set({
        record: { ...record, data: { ...record.data, request: { ...record.data.request, ...patch } } },
        hasUnsavedChanges: true,
      });
    },
    updateRecordAuth: (auth: RQAPI.Auth) => {
      const record = get().record;
      set({
        record: { ...record, data: { ...record.data, auth } },
        hasUnsavedChanges: true,
      });
    },
    updateRecordResponse: (response: RQAPI.GraphQLResponse) => {
      const record = get().record;
      set({
        record: { ...record, data: { ...record.data, response } },
      });
    },
    updateRecordTestResults: (testResults: RQAPI.ApiEntryMetaData["testResults"]) => {
      const record = get().record;
      set({
        record: { ...record, data: { ...record.data, testResults } },
        hasUnsavedChanges: true,
      });
    },
    updateRecordScripts: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => {
      const record = get().record;
      set({
        record: { ...record, data: { ...record.data, scripts } },
        hasUnsavedChanges: true,
      });
    },
    updateRecordName: (name: string) => {
      const record = get().record;
      set({
        record: { ...record, name },
      });
    },
    updateRecord: (record: T["data"]) => {
      const currentRecord = get().record;
      set({ record: { ...currentRecord, data: record } });
    },
    getRecord: () => get().record,
    getRecordName: () => get().record.name,
    setHasUnsavedChanges: (hasUnsavedChanges: boolean) => {
      set({ hasUnsavedChanges });
    },
  };
};
