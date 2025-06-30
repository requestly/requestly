import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

export const useApiRecord = (id: string) => {
  const [getRecordStore] = useAPIRecords((s) => [s.getRecordStore]);

  const recordStore = getRecordStore(id);
  const record = useStore(
    recordStore,
    useShallow((s) => s.record)
  );

  return record;
};
