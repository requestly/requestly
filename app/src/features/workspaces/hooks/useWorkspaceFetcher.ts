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
import { captureException } from "@sentry/react";

export const useWorkspaceFetcher = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const appMode = useSelector(getAppMode);

  const { fetchLocalWorkspaces } = useFetchLocalWorkspaces();
  const { sharedWorkspaces } = useFetchTeamWorkspaces();
  useActiveWorkspacesMembersListener();

  useEffect(() => {
    (async () => {
      try {
        const allLocalWorkspaces = await fetchLocalWorkspaces();
        dispatch(workspaceActions.setAllWorkspaces([...allLocalWorkspaces, ...sharedWorkspaces]));
      } catch (e) {
        captureException(e);
      }
    })();
  }, [dispatch, fetchLocalWorkspaces, sharedWorkspaces]);

  useEffect(() => {
    if (!user.loggedIn) {
      if (!activeWorkspace || activeWorkspace?.workspaceType === WorkspaceType.SHARED) {
        clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
    }
  }, [activeWorkspace, appMode, dispatch, user.loggedIn]);
};
