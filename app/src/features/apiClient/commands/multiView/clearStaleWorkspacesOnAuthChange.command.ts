import { ApiClientLocalStoreRepository } from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { apiClientFeatureContextProviderStore } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { removeWorkspaceFromView } from "./removeWorkspaceFromView.command";
import { WorkspaceType } from "features/workspaces/types";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";

type UserDetails = { loggedIn: boolean };

function clearWorkspacesByRepo(predicate: (repo: ApiClientRepositoryInterface) => boolean) {
  const { contexts } = apiClientFeatureContextProviderStore.getState();

  contexts.forEach((ctx) => {
    if (predicate(ctx.repositories)) {
      removeWorkspaceFromView(ctx.workspaceId);
    }
  });
}

function clearWorkspacesOnUserLogout() {
  clearWorkspacesByRepo((repo) => !(repo instanceof ApiClientLocalStoreRepository));
}

function clearWorkspacesOnUserLogin(workspaceType: WorkspaceType) {
  if ([WorkspaceType.PERSONAL, WorkspaceType.SHARED].includes(workspaceType)) {
    clearWorkspacesByRepo((repo) => !(repo instanceof ApiClientCloudRepository));
    return;
  }

  if (WorkspaceType.LOCAL === workspaceType) {
    clearWorkspacesByRepo((repo) => !(repo instanceof ApiClientLocalRepository));
    return;
  }

  if (WorkspaceType.LOCAL_STORAGE === workspaceType) {
    clearWorkspacesByRepo((repo) => !(repo instanceof ApiClientLocalStoreRepository));
    return;
  }
}

export function clearStaleWorkspacesOnAuthChange(params: { user: UserDetails; workspaceType: WorkspaceType }) {
  const { user, workspaceType } = params;

  if (!user.loggedIn) {
    clearWorkspacesOnUserLogout();
  } else {
    clearWorkspacesOnUserLogin(workspaceType);
  }
}
