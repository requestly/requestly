import { RQAPI } from "features/apiClient/types";
import { GraphQLSchema } from "graphql";
import { create } from "zustand";
import { BaseApiRecordState } from "../types";

export type GraphQLRecordState = BaseApiRecordState<RQAPI.GraphQLRequest, RQAPI.GraphQLResponse> & {
  schema: GraphQLSchema;
};

export function createGraphQLRecordStore(record: RQAPI.GraphQLApiRecord) {
  return create<GraphQLRecordState>()((set) => ({
    record,
    schema: null,
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
  }));
}
