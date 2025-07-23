import { useContext } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { ApiClientFilesContext } from "../store/ApiClientFilesContextProvider";
import { ApiClientFilesStore } from "../store/apiClientFilesStore";

export function useApiClientFileStore<T>(selector: (state: ApiClientFilesStore) => T) {
  const store = useContext(ApiClientFilesContext);

  if (!store) {
    throw new Error("useFileStore must be used within ApiClientFilesProvider");
  }

  return useStore(store, useShallow(selector));
}
