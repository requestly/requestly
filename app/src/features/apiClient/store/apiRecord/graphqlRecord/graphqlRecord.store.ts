import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";
import { BaseApiRecordStoreState, createBaseApiRecordState } from "../base";
import { IntrospectionData } from "features/apiClient/helpers/introspectionQuery";

export type GraphQLRecordState = BaseApiRecordStoreState<RQAPI.GraphQLApiRecord> & {
  introspectionData: IntrospectionData | null;
  isFetchingIntrospectionData: boolean;
  hasIntrospectionFailed: boolean;
  setIsFetchingIntrospectionData: (isFetching: boolean) => void;
  setHasIntrospectionFailed: (hasFailed: boolean) => void;
  setIntrospectionData: (data: IntrospectionData) => void;
};

export function createGraphQLRecordStore(record: RQAPI.GraphQLApiRecord) {
  return create<GraphQLRecordState>()((set, get) => ({
    introspectionData: null,
    isFetchingIntrospectionData: false,
    hasIntrospectionFailed: false,
    setIsFetchingIntrospectionData: (isFetching: boolean) => set({ isFetchingIntrospectionData: isFetching }),
    setHasIntrospectionFailed: (hasFailed: boolean) => set({ hasIntrospectionFailed: hasFailed }),
    setIntrospectionData: (data: any) => set({ introspectionData: data }),
    ...createBaseApiRecordState(record, set, get),
  }));
}
