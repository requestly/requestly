import { RQAPI } from "features/apiClient/types";
import { GraphQLSchema } from "graphql";
import { create } from "zustand";
import { BaseApiRecordStoreState, createBaseApiRecordState } from "../base";

export type GraphQLRecordState = BaseApiRecordStoreState<RQAPI.GraphQLApiRecord> & {
  introspectionData: any;
  setIntrospectionData: (data: any) => void;
};

export function createGraphQLRecordStore(record: RQAPI.GraphQLApiRecord) {
  return create<GraphQLRecordState>()((set, get) => ({
    introspectionData: null,
    setIntrospectionData: (data: any) => set({ introspectionData: data }),
    ...createBaseApiRecordState(record, set, get),
  }));
}
