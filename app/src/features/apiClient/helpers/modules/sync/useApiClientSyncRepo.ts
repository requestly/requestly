import { useCallback, useMemo } from "react";
import { getAppMode } from "store/selectors";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { ApiClientCloudRepository } from "./cloud";
import { ApiClientLocalRepository } from "./local";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { ApiClientRepositoryInterface } from "./interfaces";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import { ApiClientLocalStoreRepository } from "./localStore";

export const useGetApiClientSyncRepo = () => {
  const user: Record<string, any> = useSelector(getUserAuthDetails);
  const appMode: string = useSelector(getAppMode);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isWorkspaceLocal: boolean = activeWorkspace?.workspaceType === WorkspaceType.LOCAL;

  const getRepository: () => ApiClientRepositoryInterface = useCallback(() => {
    if (!user.loggedIn) {
      return new ApiClientLocalStoreRepository({ storageKey: "apiClientLocalStorage", version: 0 });
    }

    if (isWorkspaceLocal && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      return new ApiClientLocalRepository({
        rootPath: activeWorkspace?.rootPath,
      });
    } else {
      return new ApiClientCloudRepository({ uid: user.details.profile.uid, teamId: activeWorkspace.id });
    }
  }, [isWorkspaceLocal, user.details?.profile?.uid, user.loggedIn, activeWorkspace, appMode]);

  const repository = useMemo(() => getRepository(), [getRepository]);

  return repository;
};
