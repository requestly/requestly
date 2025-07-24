import { RQAPI } from "features/apiClient/types";
// import { create } from "zustand";

export type BaseApiRecordStoreState<T extends RQAPI.ApiRecord = RQAPI.ApiRecord, TAdditionalData = {}> = {
  record: T;
  updateRecordName: (name: string) => void;
  updateRecordRequest: (patch: Partial<T["data"]["request"]>) => void;
  updateRecordResponse: (response: T["data"]["response"]) => void;
  updateRecordAuth: (auth: RQAPI.Auth) => void;
  updateRecordScripts: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => void;
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
  set: any
): BaseApiRecordStoreState<T, {}> => {
  // type a = setType<T>;
  return {
    record,
    updateRecordRequest: (patch: Partial<RQAPI.GraphQLRequest>) => {
      set({
        record: { ...record, data: { ...record.data, request: { ...record.data.request, ...patch } } },
      });
    },
    updateRecordAuth: (auth: RQAPI.Auth) => {
      set({
        record: { ...record, data: { ...record.data, auth } },
      });
    },
    updateRecordResponse: (response: RQAPI.GraphQLResponse) => {
      set({
        record: { ...record, data: { ...record.data, response } },
      });
    },
    updateRecordScripts: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => {
      set({
        record: { ...record, data: { ...record.data, scripts } },
      });
    },
    updateRecordName: (name: string) => {
      set({
        record: { ...record, name },
      });
    },
  };
};
