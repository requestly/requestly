import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import { ExampleCollectionsState } from "./types";

const initialState: ExampleCollectionsState = {
  isNudgePermanentlyClosed: false,
  importStatus: { type: "NOT_IMPORTED" },
} as const;

export const exampleCollectionsSlice = createSlice({
  name: "exampleCollections",
  initialState,
  reducers: {
    importStarted(state) {
      state.importStatus = { type: "IMPORTING" };
    },

    importSucceeded(state, action: PayloadAction<{ timestamp: number }>) {
      state.importStatus = {
        type: "IMPORTED",
        importedAt: action.payload.timestamp,
      };
    },

    importFailed(state, action: PayloadAction<{ error: string; timestamp: number }>) {
      state.importStatus = {
        type: "FAILED",
        error: action.payload.error,
        failedAt: action.payload.timestamp,
      };
    },

    nudgeClosed(state) {
      state.isNudgePermanentlyClosed = true;
    },

    stateReset() {
      return initialState;
    },
  },
});

const persistConfig = {
  key: "exampleCollections",
  storage,
  whitelist: ["importStatus", "isNudgePermanentlyClosed"],
};

export const exampleCollectionsReducerWithPersist = persistReducer(persistConfig, exampleCollectionsSlice.reducer);

export const exampleCollectionsActions = exampleCollectionsSlice.actions;
export const exampleCollectionsReducer = exampleCollectionsSlice.reducer;
