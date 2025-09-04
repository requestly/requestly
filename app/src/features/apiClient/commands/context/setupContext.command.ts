import localStoreRepository from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { setupContextWithRepo } from "./setupContextWithRepo.command";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { Workspace, WorkspaceType } from "features/workspaces/types";

type UserDetails = { uid: string; loggedIn: true } | { loggedIn: false };

export function createRepository(workspace: Workspace, user: UserDetails) {
  const workspaceId = workspace.id;
  const workspaceType = workspace.workspaceType;

  if (workspaceType === WorkspaceType.LOCAL) {
    return new ApiClientLocalRepository({ rootPath: workspace.rootPath });
  }

  if (!user.loggedIn) {
    return localStoreRepository;
  }
  const userId = user.uid;
  return new ApiClientCloudRepository({ uid: userId, teamId: workspaceId });
}

export const setupContext = async (
  workspace: Workspace,
  user: UserDetails
): Promise<{ id: ApiClientFeatureContext["id"]; name?: string }> => {
  const repository = createRepository(workspace, user);
  const id = await setupContextWithRepo(workspace.id, repository);
  return { id };
};
