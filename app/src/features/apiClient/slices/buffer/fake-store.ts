import { configureStore } from "@reduxjs/toolkit";
import {
    API_CLIENT_ENVIRONMENTS_SLICE_NAME,
    API_CLIENT_ERRORED_RECORDS_SLICE_NAME,
    API_CLIENT_LIVE_RUN_RESULTS_SLICE_NAME,
    API_CLIENT_RECORDS_SLICE_NAME,
    API_CLIENT_RUN_HISTORY_SLICE_NAME,
    API_CLIENT_RUNNER_CONFIG_SLICE_NAME,
    BUFFER_SLICE_NAME,
} from "../common/constants";
import { ApiClientStore } from "../workspaceView/helpers/ApiClientContextRegistry";
import { apiRecordsSlice } from "../apiRecords";
import { environmentsSlice } from "../environments";
import { erroredRecordsSlice } from "../erroredRecords";
import { runnerConfigSlice } from "../runConfig/slice";
import { liveRunResultsSlice } from "../liveRunResults/slice";
import { runHistorySlice } from "../runHistory";
import { bufferSlice } from ".";

export function createFakeStore(): ApiClientStore {
  const store = configureStore({
    reducer: {
      [BUFFER_SLICE_NAME]: bufferSlice.reducer,
      [API_CLIENT_RECORDS_SLICE_NAME]: apiRecordsSlice.reducer,
      [API_CLIENT_ENVIRONMENTS_SLICE_NAME]: environmentsSlice.reducer,
      [API_CLIENT_ERRORED_RECORDS_SLICE_NAME]: erroredRecordsSlice.reducer,
      [API_CLIENT_RUNNER_CONFIG_SLICE_NAME]: runnerConfigSlice.reducer,
      [API_CLIENT_LIVE_RUN_RESULTS_SLICE_NAME]: liveRunResultsSlice.reducer,
      [API_CLIENT_RUN_HISTORY_SLICE_NAME]: runHistorySlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });

  return store as unknown as ApiClientStore;
}
