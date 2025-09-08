import { ApiClientLocalStoreRepository } from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { WorkspaceType } from "features/workspaces/types";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { apiClientMultiWorkspaceViewStore } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";

type UserDetails = { loggedIn: boolean };

function clearContextsByRepo(predicate: (repo: ApiClientRepositoryInterface) => boolean) {
  const { contexts } = apiClientFeatureContextProviderStore.getState();

  contexts.forEach((ctx) => {
    if (predicate(ctx.repositories)) {
      const contextId = ctx.id;

      apiClientMultiWorkspaceViewStore.getState().removeWorkspace(contextId);
      apiClientFeatureContextProviderStore.getState().removeContext(contextId);
    }
  });
}

function clearContextsOnUserLogout() {
  clearContextsByRepo((repo) => !(repo instanceof ApiClientLocalStoreRepository));
}

function clearContextsOnUserLogin(workspaceType: WorkspaceType) {
  if ([WorkspaceType.PERSONAL, WorkspaceType.SHARED].includes(workspaceType)) {
    clearContextsByRepo((repo) => !(repo instanceof ApiClientCloudRepository));
    return;
  }

  if (WorkspaceType.LOCAL === workspaceType) {
    clearContextsByRepo((repo) => !(repo instanceof ApiClientLocalRepository));
    return;
  }

  if (WorkspaceType.LOCAL_STORAGE === workspaceType) {
    clearContextsByRepo((repo) => !(repo instanceof ApiClientLocalStoreRepository));
    return;
  }
}

export function clearStaleContextsOnAuthChange(params: { user: UserDetails; workspaceType: WorkspaceType }) {
  const { user, workspaceType } = params;

  if (!user.loggedIn) {
    clearContextsOnUserLogout();
  } else {
    clearContextsOnUserLogin(workspaceType);
  }
}
