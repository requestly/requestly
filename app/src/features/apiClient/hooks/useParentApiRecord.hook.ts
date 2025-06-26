import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";
import { useStore } from "zustand";
import { createRecordStore } from "../store/apiRecords/apiRecords.store";
import { RQAPI } from "../types";

export function useParentApiRecord(id: string) {
  const [getParent, getRecordStore] = useAPIRecords((s) => [s.getParent, s.getRecordStore]);

  const parent = getParent(id);
  const versionStateStore = parent ? getRecordStore(parent) : createRecordStore({} as RQAPI.Record);
  return useStore(versionStateStore);
}
