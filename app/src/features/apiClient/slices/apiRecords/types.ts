import { EntityState } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { TreeIndices } from "../types";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";

export interface ApiRecordsState {
  erroredRecords: ErroredRecord[];
  records: EntityState<RQAPI.ApiClientRecord>;
  tree: TreeIndices;
}
