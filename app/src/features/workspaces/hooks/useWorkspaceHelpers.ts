import { workspaceManager } from "../helpers/workspaceManager";
import { useDispatch, useSelector } from "react-redux";
import { trackWorkspaceSwitched } from "modules/analytics/events/common/teams";
import { variablesActions } from "store/features/variables/slice";
import { getPersonalWorkspaceId } from "../utils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import clientRuleStorageService from "services/clientStorageService/features/rule";

export const useWorkspaceHelpers = () => {
  const dispatch = useDispatch();
  const userId = useSelector(getUserAuthDetails)?.details?.profile?.uid;

  const switchToPersonalWorkspace = async () => {
    return switchWorkspace(getPersonalWorkspaceId(userId));
  };

  const switchWorkspace = async (workspaceId: string, source?: string) => {
    // // TODO-Syncing: 1. Offload things that needs to be saved
    // // 2. Clear
    // StorageService(appMode).clearDB();
    if (!workspaceId) {
      console.error("Invalid workspaceId while switching", { workspaceId });
    }

    trackWorkspaceSwitched(source);
    console.log("[useWorkspaceHelpers.switchWorkspace]", { workspaceId });
    dispatch(variablesActions.resetState());
    await clientRuleStorageService.resetRulesAndGroups();
    return workspaceManager.initActiveWorkspaces([workspaceId]);
  };

  return { switchWorkspace, switchToPersonalWorkspace };
};
