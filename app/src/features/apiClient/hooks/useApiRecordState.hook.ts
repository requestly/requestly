import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { createRecordStore } from "features/apiClient/store/apiRecords/apiRecords.store";
import { RQAPI } from "features/apiClient/types";
import { useState } from "react";

export const useApiRecordState = (id: string) => {
  const [noopStore] = useState(() => createRecordStore({} as RQAPI.ApiRecord));
  const [getRecordStore] = useAPIRecords((s) => [s.getRecordStore]);

  const recordStore = getRecordStore(id);
  // Use noopStore as fallback when recordStore is undefined to prevent useStore error
  return useStore(
    recordStore || noopStore,
    useShallow((s) => s)
  );
};
