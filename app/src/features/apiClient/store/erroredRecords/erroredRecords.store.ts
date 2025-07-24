import { create } from "zustand";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";

type ErroredRecords<T = ErroredRecord> = {
  apiErroredRecords: T[];
  environmentErroredRecords: T[];

  setApiErroredRecords: (erroredRecord: T[]) => void;
  setEnvironmentErroredRecords: (erroredRecord: T[]) => void;

  refreshApiClientRecords: () => void;
  refreshEnvironments: () => void;
};

type ErroredRecordsStore = ErroredRecords;

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

    refreshApiClientRecords() {
      // should refetch entity, should be out, else it needs the repository and other store access to complete whole refresh flow
      // eg: get the records from repo -> refresh the api records (records store) -> update the latest errorec records
    },

    refreshEnvironments() {
      // should refetch entity, same as above
    },
  }));
};
