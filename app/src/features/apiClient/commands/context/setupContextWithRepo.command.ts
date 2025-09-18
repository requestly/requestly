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
import { ApiClientTreeBus } from "features/apiClient/helpers/apiClientTreeBus/apiClientTreeBus";

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

  const context: ApiClientFeatureContext = {
    id: workspaceId,
    workspaceId,
    stores: {},
    repositories: repoForWorkspace,
    treeBus: {} as ApiClientTreeBus,
  } as ApiClientFeatureContext;

  const apiRecordsStore = createApiRecordsStore(context, apiClientRecords);
  const errorStore = createErroredRecordsStore(erroredRecords);
  const stores = {
    environments: environmentStore,
    records: apiRecordsStore,
    erroredRecords: errorStore,
  };
  context.stores = stores;

  const treeBus = new ApiClientTreeBus(context);
  context.treeBus = treeBus;

  const viewMode = apiClientMultiWorkspaceViewStore.getState().viewMode;
  if (viewMode === ApiClientViewMode.SINGLE) {
    apiClientFeatureContextProviderStore.getState().clearAll();
  }

  apiClientFeatureContextProviderStore.getState().addContext(context);
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
