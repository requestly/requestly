import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";
import { BaseApiEntryStoreState, createBaseApiEntryState } from "../base";
import { IntrospectionData } from "features/apiClient/helpers/introspectionQuery";
import { extractOperationNames } from "features/apiClient/screens/apiClient/components/views/graphql/utils";

export type GraphQLRecordState = BaseApiEntryStoreState<RQAPI.GraphQLApiEntry> & {
  operationNames: string[];
  introspectionData: IntrospectionData | null;
  isFetchingIntrospectionData: boolean;
  hasIntrospectionFailed: boolean;
  setIsFetchingIntrospectionData: (isFetching: boolean) => void;
  setHasIntrospectionFailed: (hasFailed: boolean) => void;
  setIntrospectionData: (data: IntrospectionData | null) => void;
  updateOperationNames: (newNames: string[]) => void;
};

export function createGraphQLRecordStore(entry: RQAPI.GraphQLApiEntry, recordId: RQAPI.ApiRecord["id"]) {
  return create<GraphQLRecordState>()((set, get) => ({
    operationNames: extractOperationNames(entry.request.operation),
    introspectionData: null,
    isFetchingIntrospectionData: false,
    hasIntrospectionFailed: false,
    setIsFetchingIntrospectionData: (isFetching: boolean) => set({ isFetchingIntrospectionData: isFetching }),
    setHasIntrospectionFailed: (hasFailed: boolean) => set({ hasIntrospectionFailed: hasFailed }),
    setIntrospectionData: (data: any) => set({ introspectionData: data }),
    updateOperationNames: (newNames: string[]) => set({ operationNames: newNames }),
    ...createBaseApiEntryState(entry, recordId, set, get),
  }));
}
