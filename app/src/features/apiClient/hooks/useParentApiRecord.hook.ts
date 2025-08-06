import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";
import { useStore } from "zustand";
import { createRecordStore } from "../store/apiRecords/apiRecords.store";
import { RQAPI } from "../types";
import { useState } from "react";
import { NativeError } from "errors/NativeError";

export function useParentApiRecord(id: string) {
  const [noopStore] = useState(() => createRecordStore({} as RQAPI.ApiClientRecord));
  const [getParent, getRecordStore] = useAPIRecords((s) => [s.getParent, s.getRecordStore]);

  const parent = getParent(id);
  // Returning an empty object because hook cannot be conditionally returned for records that don't have a parent
  const recordStore = parent ? getRecordStore(parent) : noopStore;

  if (!recordStore) {
    new NativeError("Record store does not exist for parent!").addContext({ parentId: id });
  }

  return useStore(recordStore!);
}
