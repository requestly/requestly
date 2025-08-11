import localStoreRepository from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { setupContextWithRepo } from "./setupContextWithRepo.command";
import { WorkspaceType } from "features/workspaces/types";
import { ApiClientLocalRepository } from "features/apiClient/helpers/modules/sync/local";
import { ApiClientCloudRepository } from "features/apiClient/helpers/modules/sync/cloud";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

type UserDetails = { uid: string; loggedIn: true } | { loggedIn: false };

export type RepositoryMeta = {
  user: UserDetails;
  workspaceId: string;
  workspaceType: WorkspaceType;
};

export const setupContext = async (
  meta: RepositoryMeta
): Promise<{ id: ApiClientFeatureContext["id"]; name?: string }> => {
  if (!meta.user.loggedIn) {
    const anonRepo = localStoreRepository;
    const id = await setupContextWithRepo(meta.workspaceId, anonRepo);
    return { id };
  }

  const userId = meta.user.uid;
  const workspaceId = meta.workspaceId;
  const workspaceType = meta.workspaceType;

  if (workspaceType === WorkspaceType.LOCAL) {
    const localRepo = new ApiClientLocalRepository({ rootPath: workspaceId });
    const id = await setupContextWithRepo(workspaceId, localRepo);
    return { id };
  }

  const firebaseRepo = new ApiClientCloudRepository({ uid: userId, teamId: workspaceId });
  const id = await setupContextWithRepo(workspaceId, firebaseRepo);
  return { id };
};
