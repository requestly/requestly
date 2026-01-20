import { NativeError } from "errors/NativeError";
import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

import { forceRefreshRecords } from "../records";
import { forceRefreshEnvironments } from "../environments";
import { reloadFsManager } from "services/fsManagerServiceAdapter";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

export const refreshContext = async (ctxId: ApiClientFeatureContext["id"]) => {
  try {
    const contexts = apiClientFeatureContextProviderStore.getState().contexts;
    const context = contexts.get(ctxId);

    if (!context) {
      throw new NativeError("Add the context to the store before trying to refresh it");
    }

    if (context.repositories instanceof ApiClientLocalRepository) {
      await reloadFsManager(context.repositories.apiClientRecordsRepository.meta.rootPath);
    }

    return Promise.all([forceRefreshRecords(context), forceRefreshEnvironments(context)]);
  } catch (e) {
    apiClientMultiWorkspaceViewStore.getState().setStateForSelectedWorkspace(ctxId, {
      loading: false,
      errored: true,
      error: e,
    });
    throw e;
  }
};
