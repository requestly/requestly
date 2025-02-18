import { useCallback, useMemo } from "react";
import { getAppMode } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace, getIsWorkspaceLocal, getWorkspaceRootPath } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { ApiClientCloudRepository } from "./cloud";
import { ApiClientLocalRepository } from "./local";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { ApiClientRepositoryInterface } from "./interfaces";

export const useGetApiClientSyncRepo = () => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceLocal = useSelector(getIsWorkspaceLocal);
  const workspaceRootPath = useSelector(getWorkspaceRootPath);

  const getRepository:  () => ApiClientRepositoryInterface = useCallback(() => {
		if (!user.loggedIn) {
			throw new Error('Data can not be synced unless you log in!');
		};
    if (isWorkspaceLocal && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      return new ApiClientLocalRepository(workspaceRootPath);
    } else {
      return new ApiClientCloudRepository({ uid: user.details.profile.uid, teamId: workspace?.id });
    }
  }, [isWorkspaceLocal, user?.details?.profile?.uid, user.loggedIn, workspace?.id, workspaceRootPath, appMode]);

  const repository = useMemo(() => getRepository(), [getRepository]);

  return repository;
};
