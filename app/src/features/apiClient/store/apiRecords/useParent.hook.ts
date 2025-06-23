import { useAPIRecords } from "./ApiRecordsContextProvider";
import { useStore } from "zustand";
import { createVersionStore } from "./apiRecords.store";

export function useParent(id: string) {
  const [ getParent, getVersionStore ] = useAPIRecords(s => [s.getParent, s.getVersionStore]);

  const parent = getParent(id);
  const versionStateStore = parent ? getVersionStore(parent) : createVersionStore();
  return useStore(versionStateStore);
}
