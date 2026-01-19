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
  version: 1,
  migrate: async (state: any) => {
    if (state) {
      return Promise.resolve(state);
    }

    try {
      const zustandState = localStorage.getItem("rqExampleCollectionsStore");

      if (zustandState) {
        const parsed = JSON.parse(zustandState);
        const oldState = parsed.state || parsed;

        let importStatus: ExampleCollectionsState["importStatus"];

        switch (oldState.importStatus) {
          case "IMPORTING":
            importStatus = { type: "IMPORTING" };
            break;
          case "IMPORTED":
            importStatus = {
              type: "IMPORTED",
              importedAt: Date.now(),
            };
            break;
          case "FAILED":
            importStatus = {
              type: "FAILED",
              error: "Import failed (migrated from old state)",
              failedAt: Date.now(),
            };
            break;
          case "NOT_IMPORTED":
          default:
            importStatus = { type: "NOT_IMPORTED" };
            break;
        }

        const migratedState = {
          importStatus,
          isNudgePermanentlyClosed: oldState.isNudgePermanentlyClosed || false,
        };

        localStorage.removeItem("rqExampleCollectionsStore");

        return Promise.resolve(migratedState);
      }
    } catch (error) {
      console.warn("Failed to migrate from Zustand state:", error);
    }

    return Promise.resolve(initialState);
  },
};

export const exampleCollectionsReducerWithPersist = persistReducer(persistConfig, exampleCollectionsSlice.reducer);

export const exampleCollectionsActions = exampleCollectionsSlice.actions;
export const exampleCollectionsReducer = exampleCollectionsSlice.reducer;
