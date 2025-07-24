import { create } from "zustand";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";

type ErroredRecords<T = ErroredRecord> = {
  apiErroredRecords: T[];
  environmentErroredRecords: T[];

  setApiErroredRecords: (erroredRecord: T[]) => void;
  setEnvironmentErroredRecords: (erroredRecord: T[]) => void;
};

export type ErroredRecordsStore = ErroredRecords;

export const createErroredRecordsStore = ({ apiErroredRecords, environmentErroredRecords }: ErroredRecords) => {
  return create<ErroredRecordsStore>()((set, get) => ({
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
