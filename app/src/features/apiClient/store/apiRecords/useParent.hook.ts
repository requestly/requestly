import { useAPIRecords } from "./ApiRecordsContextProvider";
import { useStore } from "zustand";
import { createVersionStore } from "./apiRecords.store";

export function useParent(id: string) {
  const [childParentMap, indexStore] = useAPIRecords((s) => [s.childParentMap, s.indexStore]);

  const parent = childParentMap.get(id);
  const versionStateStore = parent ? indexStore.get(parent) : createVersionStore();
  return useStore(versionStateStore);
}
