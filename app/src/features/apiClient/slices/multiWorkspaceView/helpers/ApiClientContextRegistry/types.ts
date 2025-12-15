import { Store } from "@reduxjs/toolkit";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentData } from "backend/environment/types";
import { Workspace } from "features/workspaces/types";

// STUB
export interface RecordsState {
  apiClientRecords: RQAPI.ApiClientRecord[];
  childParentMap: Record<string, string>;
  index: Record<string, RQAPI.ApiClientRecord>;
}

// STUB
export interface EnvironmentsState {
  activeEnvironmentId: string | null;
  globalEnvironment: EnvironmentData;
  environments: Record<string, EnvironmentData>;
}

// STUB
export interface ApiClientStoreState {
  records: RecordsState;
  environments: EnvironmentsState;
}

export type ApiClientStore = Store<ApiClientStoreState>;

export interface ApiClientFeatureContext {
  store: ApiClientStore;
  workspaceId: Workspace["id"];
  repositories: ApiClientRepositoryInterface;
}
