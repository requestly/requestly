import { useEffect } from "react";
import { useFetchLocalWorkspaces } from "./useFetchLocalWorkspaces";
import { useFetchTeamWorkspaces } from "./useFetchTeamWorkspaces";
import { useDispatch, useSelector } from "react-redux";
import { workspaceActions } from "store/slices/workspaces/slice";
import { useActiveWorkspacesMembersListener } from "./useActiveWorkspaceMembersListener";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { WorkspaceType } from "features/workspaces/types";
import { getAppMode } from "store/selectors";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";

export const useWorkspaceFetcher = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const appMode = useSelector(getAppMode);

  const { localWorkspaces } = useFetchLocalWorkspaces();
  const { sharedWorkspaces } = useFetchTeamWorkspaces();
  useActiveWorkspacesMembersListener();

  useEffect(() => {
    dispatch(workspaceActions.setAllWorkspaces([...localWorkspaces, ...sharedWorkspaces]));
  }, [dispatch, localWorkspaces, sharedWorkspaces]);

  useEffect(() => {
    if (!user.loggedIn) {
      if (activeWorkspace?.id && activeWorkspace?.workspaceType === WorkspaceType.SHARED) {
        clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
    }
  }, [activeWorkspace?.id, activeWorkspace?.workspaceType, appMode, dispatch, user.loggedIn]);
};
