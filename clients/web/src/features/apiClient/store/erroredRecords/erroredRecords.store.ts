import { create } from "zustand";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";

export type ErroredRecords<T = ErroredRecord> = {
  apiErroredRecords: T[];
  environmentErroredRecords: T[];
};

export type ErroredRecordsState<T = ErroredRecord> = ErroredRecords<T> & {
  setApiErroredRecords: (erroredRecord: T[]) => void;
  setEnvironmentErroredRecords: (erroredRecord: T[]) => void;
};

export const createErroredRecordsStore = <T = ErroredRecord>({
  apiErroredRecords,
  environmentErroredRecords,
}: ErroredRecords<T>) => {
  return create<ErroredRecordsState<T>>()((set, get) => ({
    apiErroredRecords,
    environmentErroredRecords,

    setApiErroredRecords(erroredRecords) {
      set({ apiErroredRecords: erroredRecords });
    },

    setEnvironmentErroredRecords(erroredRecords) {
      set({ environmentErroredRecords: erroredRecords });
    },
  }));
};
