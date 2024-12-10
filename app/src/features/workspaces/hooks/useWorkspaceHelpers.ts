import { environmentVariablesActions } from "store/features/environment/slice";
import { workspaceManager } from "../helpers/workspaceManager";
import { useDispatch } from "react-redux";

export const useWorkspaceHelpers = () => {
  const dispatch = useDispatch();

  const switchWorkspace = (workspaceId: string) => {
    // // TODO-Syncing: 1. Offload things that needs to be saved
    // // 2. Clear
    // StorageService(appMode).clearDB();

    console.log("[useWorkspaceHelpers.switchWorkspace]", { workspaceId });
    dispatch(environmentVariablesActions.resetState());
    workspaceManager.initActiveWorkspaces([workspaceId]);
  };

  return { switchWorkspace };
};
