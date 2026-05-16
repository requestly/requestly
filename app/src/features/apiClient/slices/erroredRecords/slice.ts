import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { API_CLIENT_ERRORED_RECORDS_SLICE_NAME } from "../common/constants";
import { ErroredRecordsState } from "./types";
import erroredRecordsUtils from "./erroredRecords.utils";

const { addExcludedErroredRecordId, excludeErroredRecordById, getVisibleErroredRecords } = erroredRecordsUtils;

const initialState: ErroredRecordsState = {
  apiErroredRecords: [],
  environmentErroredRecords: [],
  excludedApiErroredRecordIds: [],
  excludedEnvironmentErroredRecordIds: [],
};

export const erroredRecordsSlice = createSlice({
  name: API_CLIENT_ERRORED_RECORDS_SLICE_NAME,
  initialState,
  reducers: {
    setApiErroredRecords(state, action: PayloadAction<ErroredRecord[]>) {
      state.apiErroredRecords = getVisibleErroredRecords(action.payload, state.excludedApiErroredRecordIds);
    },

    setEnvironmentErroredRecords(state, action: PayloadAction<ErroredRecord[]>) {
      state.environmentErroredRecords = getVisibleErroredRecords(
        action.payload,
        state.excludedEnvironmentErroredRecordIds
      );
    },

    excludeApiErroredRecord(state, action: PayloadAction<ErroredRecord["id"]>) {
      state.excludedApiErroredRecordIds = addExcludedErroredRecordId(state.excludedApiErroredRecordIds, action.payload);
      state.apiErroredRecords = excludeErroredRecordById(state.apiErroredRecords, action.payload);
    },

    excludeEnvironmentErroredRecord(state, action: PayloadAction<ErroredRecord["id"]>) {
      state.excludedEnvironmentErroredRecordIds = addExcludedErroredRecordId(
        state.excludedEnvironmentErroredRecordIds,
        action.payload
      );
      state.environmentErroredRecords = excludeErroredRecordById(state.environmentErroredRecords, action.payload);
    },

    hydrate(
      state,
      action: PayloadAction<{
        apiErroredRecords: ErroredRecord[];
        environmentErroredRecords: ErroredRecord[];
        excludedApiErroredRecordIds?: ErroredRecord["id"][];
        excludedEnvironmentErroredRecordIds?: ErroredRecord["id"][];
      }>
    ) {
      state.excludedApiErroredRecordIds = action.payload.excludedApiErroredRecordIds ?? [];
      state.excludedEnvironmentErroredRecordIds = action.payload.excludedEnvironmentErroredRecordIds ?? [];
      state.apiErroredRecords = getVisibleErroredRecords(
        action.payload.apiErroredRecords,
        state.excludedApiErroredRecordIds
      );
      state.environmentErroredRecords = getVisibleErroredRecords(
        action.payload.environmentErroredRecords,
        state.excludedEnvironmentErroredRecordIds
      );
    },

    clearAll(state) {
      state.apiErroredRecords = [];
      state.environmentErroredRecords = [];
      state.excludedApiErroredRecordIds = [];
      state.excludedEnvironmentErroredRecordIds = [];
    },
  },
});

export const erroredRecordsActions = erroredRecordsSlice.actions;
export const erroredRecordsReducer = erroredRecordsSlice.reducer;
