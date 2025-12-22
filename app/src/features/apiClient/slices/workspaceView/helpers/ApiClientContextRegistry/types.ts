import { Store } from "@reduxjs/toolkit";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { Workspace } from "features/workspaces/types";
import { ApiRecordsState } from "features/apiClient/slices/apiRecords";
import { BufferState } from "features/apiClient/slices/buffer/types";
import { EnvironmentsState } from "features/apiClient/slices/environments";
import { API_CLIENT_RECORDS_SLICE_NAME, API_CLIENT_ENVIRONMENTS_SLICE_NAME, BUFFER_SLICE_NAME } from "features/apiClient/slices/common/constants";

export interface ApiClientStoreState {
  [API_CLIENT_RECORDS_SLICE_NAME]: ApiRecordsState;
  [API_CLIENT_ENVIRONMENTS_SLICE_NAME]: EnvironmentsState;
  [BUFFER_SLICE_NAME]: BufferState;
}

export type ApiClientStore = Store<ApiClientStoreState>;

export interface ApiClientFeatureContext {
  store: ApiClientStore;
  workspaceId: Workspace["id"];
  repositories: ApiClientRepositoryInterface;
}
