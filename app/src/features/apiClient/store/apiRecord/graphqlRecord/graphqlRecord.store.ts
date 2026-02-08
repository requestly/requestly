import { create } from "zustand";
import { IntrospectionData } from "features/apiClient/helpers/introspectionQuery";

export type GraphQLRecordState = {
  introspectionData: IntrospectionData | null;
  isFetchingIntrospectionData: boolean;
  hasIntrospectionFailed: boolean;

  setIsFetchingIntrospectionData: (isFetching: boolean) => void;
  setHasIntrospectionFailed: (hasFailed: boolean) => void;
  setIntrospectionData: (data: IntrospectionData | null) => void;
};

export function createGraphQLRecordStore() {
  return create<GraphQLRecordState>()((set, get) => ({
    introspectionData: null,
    isFetchingIntrospectionData: false,
    hasIntrospectionFailed: false,

    setIsFetchingIntrospectionData: (isFetching: boolean) => set({ isFetchingIntrospectionData: isFetching }),
    setHasIntrospectionFailed: (hasFailed: boolean) => set({ hasIntrospectionFailed: hasFailed }),
    setIntrospectionData: (data: IntrospectionData | null) => set({ introspectionData: data }),
  }));
}
