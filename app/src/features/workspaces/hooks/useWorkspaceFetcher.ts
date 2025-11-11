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
  console.log("I am called");
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspace = useSelector(getActiveWorkspace);
  const appMode = useSelector(getAppMode);

  console.log("debug-1", activeWorkspace);
  const { fetchLocalWorkspaces } = useFetchLocalWorkspaces();
  const { sharedWorkspaces } = useFetchTeamWorkspaces();
  useActiveWorkspacesMembersListener();

  useEffect(() => {
    //fetch the local workspaces & team workspaces
    //fetching of all local workspaces is happening properly problems seems with loading
    fetchLocalWorkspaces().then((allLocalWorkspaces) => {
      console.log("TEST", allLocalWorkspaces);
      dispatch(workspaceActions.setAllWorkspaces([...allLocalWorkspaces, ...sharedWorkspaces]));
    });
  }, [dispatch, fetchLocalWorkspaces, sharedWorkspaces]);

  //this is for logged out state
  useEffect(() => {
    if (!user.loggedIn) {
      if (!activeWorkspace || activeWorkspace?.workspaceType === WorkspaceType.SHARED) {
        clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
    }
  }, [activeWorkspace, appMode, dispatch, user.loggedIn]);
};

//LOGS ORDER
//->customer service
//->private workspace
//->customer service

//->Noticed on multiworkspace view, dev testing workspace was not called when active workspace was debugged
//->for multivew , selected were dev & invoice but still customer service was coming in debug-1 log ?
