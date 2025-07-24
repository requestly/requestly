import { useContext } from "react";
import { useStore } from "zustand";
import { GraphQLRecordStoreContext } from "../store/apiRecord/graphqlRecord/GraphQLRecordContextProvider";
import { GraphQLRecordState } from "../store/apiRecord/graphqlRecord/graphqlRecord.store";
import { useShallow } from "zustand/shallow";

export function useGraphQLRecordStore<T>(selector: (state: GraphQLRecordState) => T) {
  const store = useContext(GraphQLRecordStoreContext);

  if (store === null) {
    throw new Error("useGraphQLRecordStore must be used within GraphQLRecordProvider");
  }

  return useStore(store, useShallow(selector));
}
