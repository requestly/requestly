import { create } from "zustand";
import { KeyValuePair, RQAPI } from "../types";
import { extractQueryParams } from "../screens/apiClient/utils";

export type QueryParamsStore = {
  queryParams: KeyValuePair[];
  isInitialized: boolean;
  setQueryParams: (params: KeyValuePair[]) => void;
};

const getSyncedQueryParams = (entry: RQAPI.Entry) => {
  const { request } = entry;
  const paramsFromUrl = extractQueryParams(request.url);
  const paramsObject = entry.request.queryParams;

  const keysFromObject = new Set(paramsObject.map((param) => param.key));
  const finalParams: KeyValuePair[] = [...paramsObject];

  for (const param of paramsFromUrl) {
    if (!keysFromObject.has(param.key)) {
      finalParams.push({
        key: param.key,
        value: param.value,
        isEnabled: true,
        id: Date.now(),
      });
    }
  }

  return finalParams || [];
};

export const createQueryParamsStore = (entry: RQAPI.Entry) => {
  return create<QueryParamsStore>()((set) => ({
    queryParams: getSyncedQueryParams(entry),
    isInitialized: false,

    setQueryParams: (params: KeyValuePair[]) => {
      set({ queryParams: params });
    },
  }));
};
