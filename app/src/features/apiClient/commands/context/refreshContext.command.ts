import { NativeError } from "errors/NativeError";
import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

import { forceRefreshRecords } from "../records";
import { forceRefreshEnvironments } from "../environments";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";

export const refreshContext = async (ctxId: ApiClientFeatureContext["id"]) => {
  const contexts = apiClientFeatureContextProviderStore.getState().contexts;

  if (!contexts.has(ctxId)) throw new NativeError("Add the context to the store before trying to refresh it");

  const context = contexts.get(ctxId);
  if (context.repositories.apiClientRecordsRepository instanceof ApiClientLocalRepository) {
    await reloadFsManager(context.repositories.apiClientRecordsRepository.meta.rootPath);
  }

  return Promise.all([forceRefreshRecords(context), forceRefreshEnvironments(context)]);
};
