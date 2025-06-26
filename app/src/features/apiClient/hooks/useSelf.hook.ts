import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useStore } from "zustand";

export const useSelf = (id: string) => {
  const [getRecordStore] = useAPIRecords((s) => [s.getRecordStore]);

  const recordStore = getRecordStore(id);
  const { record } = useStore(recordStore);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return record;
};
