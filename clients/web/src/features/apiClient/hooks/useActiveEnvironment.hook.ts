import { createStore, useStore } from "zustand";
import { EnvironmentState } from "../store/environments/environments.store";
import { useAPIEnvironment } from "../store/apiRecords/ApiRecordsContextProvider";

export function useActiveEnvironment(): EnvironmentState | null {
  const nullStore = createStore(() => null as any);
  const activeEnvironment = useAPIEnvironment((s) => s.activeEnvironment);
  return useStore(activeEnvironment || nullStore);
}
