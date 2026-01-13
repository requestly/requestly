import { createContext, ReactNode, useState } from "react";
import { StoreApi } from "zustand";
import { createGraphQLRecordStore, GraphQLRecordState } from "./graphqlRecord.store";

export const GraphQLRecordStoreContext = createContext<StoreApi<GraphQLRecordState> | null>(null);

export const GraphQLRecordProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => createGraphQLRecordStore());
  return <GraphQLRecordStoreContext.Provider value={store}>{children}</GraphQLRecordStoreContext.Provider>;
};
