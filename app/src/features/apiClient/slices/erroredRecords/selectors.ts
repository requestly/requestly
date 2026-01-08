import { createSelector } from "@reduxjs/toolkit";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { API_CLIENT_ERRORED_RECORDS_SLICE_NAME } from "../common/constants";
import { ErroredRecordsState } from "./types";

const selectErroredRecordsSlice = (state: ApiClientStoreState) => state[API_CLIENT_ERRORED_RECORDS_SLICE_NAME];

export const selectApiErroredRecords = createSelector(
  selectErroredRecordsSlice,
  (slice: ErroredRecordsState) => slice.apiErroredRecords
);

export const selectEnvironmentErroredRecords = createSelector(
  selectErroredRecordsSlice,
  (slice: ErroredRecordsState) => slice.environmentErroredRecords
);

export const selectAllErroredRecords = createSelector(
  [selectApiErroredRecords, selectEnvironmentErroredRecords],
  (apiErroredRecords, environmentErroredRecords) => ({
    apiErroredRecords,
    environmentErroredRecords,
  })
);
