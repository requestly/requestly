import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RQAPI } from "../types";
import { RootState } from "store/types";

const ApiClientRecords = createSlice({
  name: "apiClient",
  initialState: {
    records: {} as Record<RQAPI.Record["id"], RQAPI.Record>,
  },
  reducers: {
    setRecords: (state, action: PayloadAction<Record<RQAPI.Record["id"], RQAPI.Record>>) => {
      state.records = action.payload;
    },
    setRecord: (state, action: PayloadAction<RQAPI.Record>) => {
      state.records[action.payload.id] = action.payload;
    },
    deleteRecord: (state, action) => {
      delete state.records[action.payload.id];
    },
  },
});
export const ApiClientReducers = ApiClientRecords.reducer;
export const { setRecords, setRecord, deleteRecord } = ApiClientRecords.actions;
/* selectors */
export const getAllRecords = (state: RootState) => {
  console.log(state);
  return state.apiClient.records;
};

export const getRecordsList = (state: RootState) => {
  return Object.values(state.apiClient.records);
};
