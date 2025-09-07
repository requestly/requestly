import { useEffect } from "react";
import { useFetchLocalWorkspaces } from "./useFetchLocalWorkspaces";
import { useFetchTeamWorkspaces } from "./useFetchTeamWorkspaces";
import { useDispatch, useSelector } from "react-redux";
import { workspaceActions } from "store/slices/workspaces/slice";
import { useActiveWorkspacesMembersListener } from "./useActiveWorkspaceMembersListener";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

import { LoggedOutWorkspace } from "../utils";

export const useWorkspaceFetcher = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const {
    fetchLocalWorkspaces,
    localWorkspaces,
    isInitialized: isLocalWorkspacesInitialized,
  } = useFetchLocalWorkspaces();
  const { sharedWorkspaces, isInitialized: isSharedWorkspacesInitialized } = useFetchTeamWorkspaces();
  useActiveWorkspacesMembersListener();

  useEffect(() => {
    fetchLocalWorkspaces();
  }, [sharedWorkspaces, fetchLocalWorkspaces]);

  useEffect(() => {
    // Don't override until we've fetched both local and shared workspaces
    if (!isLocalWorkspacesInitialized || !isSharedWorkspacesInitialized) {
      // Do nothing
    } else {
      if (!user.loggedIn) {
        dispatch(workspaceActions.setAllWorkspaces([LoggedOutWorkspace, ...localWorkspaces]));
        dispatch(workspaceActions.setWorkspacesUpdatedAt(Date.now()));
      } else {
        dispatch(workspaceActions.setAllWorkspaces([...localWorkspaces, ...sharedWorkspaces]));
        dispatch(workspaceActions.setWorkspacesUpdatedAt(Date.now()));
      }
    }

    return () => {
      dispatch(workspaceActions.setWorkspacesUpdatedAt(0));
    };
  }, [
    dispatch,
    sharedWorkspaces,
    localWorkspaces,
    user.loggedIn,
    isLocalWorkspacesInitialized,
    isSharedWorkspacesInitialized,
  ]);
};
