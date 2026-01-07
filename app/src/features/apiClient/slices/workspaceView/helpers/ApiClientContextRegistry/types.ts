import type { Store } from "@reduxjs/toolkit";
import type { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import type { Workspace } from "features/workspaces/types";
import type { ApiRecordsState } from "features/apiClient/slices/apiRecords";
import type { BufferState } from "features/apiClient/slices/buffer/types";
import type { EnvironmentsState } from "features/apiClient/slices/environments";
import type { ErroredRecordsState } from "features/apiClient/slices/erroredRecords";
import type { RunnerConfigState } from "features/apiClient/slices/runConfig/types";
import {
  API_CLIENT_RECORDS_SLICE_NAME,
  API_CLIENT_ENVIRONMENTS_SLICE_NAME,
  API_CLIENT_ERRORED_RECORDS_SLICE_NAME,
  BUFFER_SLICE_NAME,
} from "features/apiClient/slices/common/constants";

export interface ApiClientStoreState {
  [API_CLIENT_RECORDS_SLICE_NAME]: ApiRecordsState;
  [API_CLIENT_ENVIRONMENTS_SLICE_NAME]: EnvironmentsState;
  [API_CLIENT_ERRORED_RECORDS_SLICE_NAME]: ErroredRecordsState;
  [BUFFER_SLICE_NAME]: BufferState;
  runConfig: RunnerConfigState;
}

export type ApiClientStore = Store<ApiClientStoreState>;

export interface ApiClientFeatureContext {
  store: ApiClientStore;
  workspaceId: Workspace["id"];
  repositories: ApiClientRepositoryInterface;
}
