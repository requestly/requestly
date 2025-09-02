import { createContext, ReactNode, useState } from "react";
import { StoreApi } from "zustand";
import { createGraphQLRecordStore, GraphQLRecordState } from "./graphqlRecord.store";
import { RQAPI } from "features/apiClient/types";

export const GraphQLRecordStoreContext = createContext<StoreApi<GraphQLRecordState> | null>(null);

export const GraphQLRecordProvider = ({
  children,
  entry,
  recordId,
}: {
  children: ReactNode;
  entry: RQAPI.GraphQLApiEntry;
  recordId: RQAPI.ApiRecord["id"];
}) => {
  const [store] = useState(() => createGraphQLRecordStore(entry, recordId));
  return <GraphQLRecordStoreContext.Provider value={store}>{children}</GraphQLRecordStoreContext.Provider>;
};
