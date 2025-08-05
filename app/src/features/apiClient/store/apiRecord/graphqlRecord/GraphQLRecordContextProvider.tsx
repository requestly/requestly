import { createContext, ReactNode, useState } from "react";
import { StoreApi } from "zustand";
import { createGraphQLRecordStore, GraphQLRecordState } from "./graphqlRecord.store";
import { RQAPI } from "features/apiClient/types";

export const GraphQLRecordStoreContext = createContext<StoreApi<GraphQLRecordState> | null>(null);

export const GraphQLRecordProvider = ({
  children,
  record,
}: {
  children: ReactNode;
  record: RQAPI.GraphQLApiRecord;
}) => {
  const [store] = useState(() => createGraphQLRecordStore(record));
  return <GraphQLRecordStoreContext.Provider value={store}>{children}</GraphQLRecordStoreContext.Provider>;
};
