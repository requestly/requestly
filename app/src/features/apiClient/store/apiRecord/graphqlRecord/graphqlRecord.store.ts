import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";
import { BaseApiRecordStoreState, createBaseApiRecordState } from "../base";
import { IntrospectionData } from "features/apiClient/helpers/introspectionQuery";

export type GraphQLRecordState = BaseApiRecordStoreState<RQAPI.GraphQLApiRecord> & {
  introspectionData: IntrospectionData | null;
  setIntrospectionData: (data: IntrospectionData) => void;
};

export function createGraphQLRecordStore(record: RQAPI.GraphQLApiRecord) {
  return create<GraphQLRecordState>()((set, get) => ({
    introspectionData: null,
    setIntrospectionData: (data: any) => set({ introspectionData: data }),
    ...createBaseApiRecordState(record, set, get),
  }));
}
