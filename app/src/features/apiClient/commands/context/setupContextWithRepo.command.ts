import { EnvironmentData, EnvironmentMap } from "backend/environment/types";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { ErroredRecord } from "features/apiClient/helpers/modules/sync/local/services/types";
import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { createApiRecordsStore } from "features/apiClient/store/apiRecords/apiRecords.store";
import { createEnvironmentsStore } from "features/apiClient/store/environments/environments.store";
import { createErroredRecordsStore } from "features/apiClient/store/erroredRecords/erroredRecords.store";
import { RQAPI } from "features/apiClient/types";
import { extractSetupDataFromRepository } from "./utils";
import {
  apiClientMultiWorkspaceViewStore,
  ApiClientViewMode,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { markWorkspaceLoaded } from "../multiView";

export type ContextSetupData = {
  apiClientRecords: { records: RQAPI.ApiClientRecord[]; erroredRecords: ErroredRecord[] }; // old api expects errors to also be passed in
  environments: { globalEnvironment: EnvironmentData; nonGlobalEnvironments: EnvironmentMap };
  erroredRecords: { apiErroredRecords: ErroredRecord[]; environmentErroredRecords: ErroredRecord[] };
};

export const setupContextWithRepoWithoutMarkingLoaded = async (
  workspaceId: ApiClientFeatureContext["workspaceId"],
  repoForWorkspace: ApiClientRepositoryInterface
) => {
  const contexts = apiClientFeatureContextProviderStore.getState().contexts;
  if (contexts.has(workspaceId)) return workspaceId; // context already exists

  const { apiClientRecords, erroredRecords, environments } = await extractSetupDataFromRepository(repoForWorkspace);
  const environmentStore = createEnvironmentsStore({
    environments: environments.nonGlobalEnvironments,
    globalEnvironment: environments.globalEnvironment,
    contextId: workspaceId,
  });
  const apiRecordsStore = createApiRecordsStore(apiClientRecords);
  const errorStore = createErroredRecordsStore(erroredRecords);
  const stores = {
    environments: environmentStore,
    records: apiRecordsStore,
    erroredRecords: errorStore,
  };

  const storeId = apiRecordsStore.getState().storeId;
  console.log("DG-5.3: setupContextWithRepo creating context", JSON.stringify({workspaceId, storeId, recordsCount: apiClientRecords.records.length}, null, 2));

  const context: ApiClientFeatureContext = {
    id: workspaceId,
    workspaceId,
    stores,
    repositories: repoForWorkspace,
  };

  const viewMode = apiClientMultiWorkspaceViewStore.getState().viewMode;
  if (viewMode === ApiClientViewMode.SINGLE) {
    apiClientFeatureContextProviderStore.getState().clearAll();
  }

  apiClientFeatureContextProviderStore.getState().addContext(context);
  console.log("DG-5.4: Context added to provider", JSON.stringify({workspaceId: context.id, storeId}, null, 2));
  return context.id;
};

export async function setupContextWithRepo(
  workspaceId: ApiClientFeatureContext["workspaceId"],
  repoForWorkspace: ApiClientRepositoryInterface
) {
  const result = await setupContextWithRepoWithoutMarkingLoaded(workspaceId, repoForWorkspace);
  markWorkspaceLoaded();
  return result;
}
