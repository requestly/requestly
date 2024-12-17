import { workspaceManager } from "../helpers/workspaceManager";
import { useDispatch } from "react-redux";
import { trackWorkspaceSwitched } from "modules/analytics/events/common/teams";
import { variablesActions } from "store/features/variables/slice";

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
    dispatch(variablesActions.resetState());
    return workspaceManager.initActiveWorkspaces([workspaceId]);
  };

  return { switchWorkspace };
};
