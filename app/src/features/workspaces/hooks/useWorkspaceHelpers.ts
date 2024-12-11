import { environmentVariablesActions } from "store/features/environment/slice";
import { workspaceManager } from "../helpers/workspaceManager";
import { useDispatch } from "react-redux";
import { trackWorkspaceSwitched } from "modules/analytics/events/common/teams";

export const useWorkspaceHelpers = () => {
  const dispatch = useDispatch();

  const switchWorkspace = async (workspaceId: string, source?: string) => {
    // // TODO-Syncing: 1. Offload things that needs to be saved
    // // 2. Clear
    // StorageService(appMode).clearDB();
    if (!workspaceId) {
      console.error("Invalid workspaceId while switching", { workspaceId });
    }

    trackWorkspaceSwitched(source);
    console.log("[useWorkspaceHelpers.switchWorkspace]", { workspaceId });
    dispatch(environmentVariablesActions.resetState());
    return workspaceManager.initActiveWorkspaces([workspaceId]);
  };

  return { switchWorkspace };
};
