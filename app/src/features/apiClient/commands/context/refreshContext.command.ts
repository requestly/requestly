import { NativeError } from "errors/NativeError";
import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { extractSetupDataFromRepository } from "./utils";

async function _refreshContext(
  stores: ApiClientFeatureContext["stores"],
  repo: ApiClientFeatureContext["repositories"]
) {
  const { apiClientRecords, environments, erroredRecords } = await extractSetupDataFromRepository(repo);

  stores.records.getState().refresh(apiClientRecords.records);
  stores.environments.getState().refresh({
    globalEnvironment: environments.globalEnvironment,
    environments: environments.nonGlobalEnvironments,
  });
  stores.erroredRecords.getState().setApiErroredRecords(erroredRecords.apiErroredRecords);
  stores.erroredRecords.getState().setEnvironmentErroredRecords(erroredRecords.environmentErroredRecords);
}

export const refreshContext = async (ctxId: ApiClientFeatureContext["id"]) => {
  const contexts = apiClientFeatureContextProviderStore.getState().contexts;

  if (!contexts.has(ctxId)) throw new NativeError("Add the context to the store before trying to refresh it");

  const context = contexts.get(ctxId);
  return _refreshContext(context.stores, context.repositories);
};
