import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import { API_CLIENT_ERRORED_RECORDS_SLICE_NAME } from "../common/constants";
import { ErroredRecordsState } from "./types";

const initialState: ErroredRecordsState = {
  apiErroredRecords: [],
  environmentErroredRecords: [],
};

export const erroredRecordsSlice = createSlice({
  name: API_CLIENT_ERRORED_RECORDS_SLICE_NAME,
  initialState,
  reducers: {
    setApiErroredRecords(state, action: PayloadAction<ErroredRecord[]>) {
      state.apiErroredRecords = action.payload;
    },

    setEnvironmentErroredRecords(state, action: PayloadAction<ErroredRecord[]>) {
      state.environmentErroredRecords = action.payload;
    },

    excludeErroredRecord(state, action: PayloadAction<Pick<ErroredRecord, "id" | "type">>) {
      const { id, type } = action.payload;

      state.apiErroredRecords = state.apiErroredRecords.filter((record) => record.id !== id || record.type !== type);
      state.environmentErroredRecords = state.environmentErroredRecords.filter(
        (record) => record.id !== id || record.type !== type
      );
    },

    hydrate(
      state,
      action: PayloadAction<{
        apiErroredRecords: ErroredRecord[];
        environmentErroredRecords: ErroredRecord[];
      }>
    ) {
      state.apiErroredRecords = action.payload.apiErroredRecords;
      state.environmentErroredRecords = action.payload.environmentErroredRecords;
    },

    clearAll(state) {
      state.apiErroredRecords = [];
      state.environmentErroredRecords = [];
    },
  },
});

export const erroredRecordsActions = erroredRecordsSlice.actions;
export const erroredRecordsReducer = erroredRecordsSlice.reducer;
