import localStoreRepository from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { setupContextWithRepo } from "./setupContextWithRepo.command";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { Workspace, WorkspaceType } from "features/workspaces/types";

type UserDetails = { uid: string; loggedIn: true } | { loggedIn: false };

export const setupContext = async (
  workspace: Workspace,
  user: UserDetails
): Promise<{ id: ApiClientFeatureContext["id"]; name?: string }> => {
  if (!user.loggedIn) {
    const anonRepo = localStoreRepository;
    const id = await setupContextWithRepo(workspace.id, anonRepo);
    return { id };
  }

  const userId = user.uid;
  const workspaceId = workspace.id;
  const workspaceType = workspace.workspaceType;

  if (workspaceType === WorkspaceType.LOCAL) {
    const localRepo = new ApiClientLocalRepository({ rootPath: workspace.rootPath });
    const id = await setupContextWithRepo(workspaceId, localRepo);
    return { id };
  }

  const firebaseRepo = new ApiClientCloudRepository({ uid: userId, teamId: workspaceId });
  const id = await setupContextWithRepo(workspaceId, firebaseRepo);
  return { id };
};
