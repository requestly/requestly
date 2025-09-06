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

  const { fetchLocalWorkspaces, localWorkspaces } = useFetchLocalWorkspaces();
  const { sharedWorkspaces } = useFetchTeamWorkspaces();
  useActiveWorkspacesMembersListener();

  useEffect(() => {
    fetchLocalWorkspaces();
  }, [sharedWorkspaces, fetchLocalWorkspaces]);

  useEffect(() => {
    if (!user.loggedIn) {
      dispatch(workspaceActions.setAllWorkspaces([LoggedOutWorkspace, ...localWorkspaces]));
      dispatch(workspaceActions.setWorkspacesUpdatedAt(Date.now()));
    } else {
      dispatch(workspaceActions.setAllWorkspaces([...localWorkspaces, ...sharedWorkspaces]));
      dispatch(workspaceActions.setWorkspacesUpdatedAt(Date.now()));
    }

    return () => {
      dispatch(workspaceActions.setAllWorkspaces([]));
      dispatch(workspaceActions.setWorkspacesUpdatedAt(0));
    };
  }, [dispatch, sharedWorkspaces, localWorkspaces, user.loggedIn]);
};
