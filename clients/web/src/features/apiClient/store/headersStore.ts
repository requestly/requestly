import { create } from "zustand";
import { KeyValuePair, RQAPI } from "../types";

export type HeadersStore = {
  headers: KeyValuePair[];
  setHeaders: (headers: KeyValuePair[]) => void;
};

const getSyncedHeaders = (entry: RQAPI.HttpApiEntry) => {
  const { request } = entry || {};
  if (!request) {
    return [];
  }
  return request.headers || [];
};

export const createHeadersStore = (entry: RQAPI.HttpApiEntry) => {
  return create<HeadersStore>()((set) => ({
    headers: getSyncedHeaders(entry),
    setHeaders: (newHeaders: KeyValuePair[]) => {
      set({ headers: newHeaders });
    },
  }));
};
