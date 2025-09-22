import { useContext } from "react";
import { RunConfigState } from "./runConfig.store";
import { RunConfigStoreContext } from "./RunConfigStoreContextProvider";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { NativeError } from "errors/NativeError";

export function useRunConfigStore<T>(selector: (state: RunConfigState) => T) {
  const store = useContext(RunConfigStoreContext);

  if (store === null) {
    throw new NativeError("useRunConfigStore must be used within RunConfigStoreContextProvider");
  }

  return useStore(store, useShallow(selector));
}
