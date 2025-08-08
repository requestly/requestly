import { RQAPI } from "features/apiClient/types";
import { create } from "zustand";
import { BaseApiRecordStoreState, createBaseApiRecordState } from "../base";
import { IntrospectionData } from "features/apiClient/helpers/introspectionQuery";
import { extractOperationNames } from "features/apiClient/screens/apiClient/components/views/graphql/utils";

export type GraphQLRecordState = BaseApiRecordStoreState<RQAPI.GraphQLApiRecord> & {
  operationNames: string[];
  introspectionData: IntrospectionData | null;
  isFetchingIntrospectionData: boolean;
  hasIntrospectionFailed: boolean;
  setIsFetchingIntrospectionData: (isFetching: boolean) => void;
  setHasIntrospectionFailed: (hasFailed: boolean) => void;
  setIntrospectionData: (data: IntrospectionData) => void;
  updateOperationNames: (newNames: string[]) => void;
};

export function createGraphQLRecordStore(record: RQAPI.GraphQLApiRecord) {
  return create<GraphQLRecordState>()((set, get) => ({
    operationNames: extractOperationNames(record.data.request.operation),
    introspectionData: null,
    isFetchingIntrospectionData: false,
    hasIntrospectionFailed: false,
    setIsFetchingIntrospectionData: (isFetching: boolean) => set({ isFetchingIntrospectionData: isFetching }),
    setHasIntrospectionFailed: (hasFailed: boolean) => set({ hasIntrospectionFailed: hasFailed }),
    setIntrospectionData: (data: any) => set({ introspectionData: data }),
    updateOperationNames: (newNames: string[]) => set({ operationNames: newNames }),
    ...createBaseApiRecordState(record, set, get),
  }));
}
