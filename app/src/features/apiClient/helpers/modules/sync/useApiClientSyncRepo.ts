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
  const user: Record<string, any> = useSelector(getUserAuthDetails);
  const appMode: string = useSelector(getAppMode);
  const workspace: Record<string, any> = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceLocal: boolean = useSelector(getIsWorkspaceLocal);
  const workspaceRootPath: string = useSelector(getWorkspaceRootPath);

  const getRepository:  () => ApiClientRepositoryInterface = useCallback(() => {
		if (!user.loggedIn) {
			throw new Error('Data can not be synced unless you log in!');
		};
    if (isWorkspaceLocal && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
			return new ApiClientLocalRepository({
				rootPath: workspaceRootPath,
			});
    } else {
      return new ApiClientCloudRepository({ uid: user.details.profile.uid, teamId: workspace?.id });
    }
  }, [isWorkspaceLocal, user?.details?.profile?.uid, user.loggedIn, workspace?.id, workspaceRootPath, appMode]);

  const repository = useMemo(() => getRepository(), [getRepository]);

  return repository;
};
