import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { EnvironmentState, EnvironmentStore } from "../store/environments/environments.store";

export function useEnvironmentStore<T>(environmentStore: EnvironmentStore, selector: (state: EnvironmentState) => T) {
  const environment = useStore(environmentStore, useShallow(selector));
  return environment;
}
