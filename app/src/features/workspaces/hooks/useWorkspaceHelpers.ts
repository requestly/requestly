import { StorageService } from "init";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";

export const useWorkspaceHelpers = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  const switchToPrivateWorkspace = () => {};

  const switchWorkspace = (workspaceId: string) => {
    // TODO-Syncing: 1. Offload things that needs to be saved

    // 2. Clear
    StorageService(appMode).clearDB();

    // 3. Switch Workspace
    dispatch(workspaceActions.setActiveWorkspaceId(workspaceId));
  };

  return { switchWorkspace };
};
