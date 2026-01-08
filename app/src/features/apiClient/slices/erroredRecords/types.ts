import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";

export interface ErroredRecordsState {
  apiErroredRecords: ErroredRecord[];
  environmentErroredRecords: ErroredRecord[];
}
