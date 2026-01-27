import { useContext } from "react";
import { useStore } from "zustand";
import { HeadersStore } from "../store/headersStore";
import { HeadersStoreContext } from "../store/HeadersContextProvider";
import { useShallow } from "zustand/shallow";

export function useHeadersStore<T>(selector: (state: HeadersStore) => T) {
  const store = useContext(HeadersStoreContext);

  if (store === null) {
    throw new Error("useHeadersStore must be used within HeadersProvider");
  }

  return useStore(store, useShallow(selector));
}
