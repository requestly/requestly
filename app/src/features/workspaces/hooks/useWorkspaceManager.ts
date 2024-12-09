import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { getActiveWorkspaceIds, getAllWorkspaces } from "store/slices/workspaces/selectors";
import { useAvailableWorkspacesListener } from "./useAvailableTeamsListener";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { workspaceManager } from "../helpers/workspaceManager";
import { getAppMode } from "store/selectors";
import { getPrivateWorkspaceId, LOGGED_OUT_WORKSPACE_ID } from "../utils";

export const useWorkspaceManager = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);
  const userId = user.details?.profile?.uid;
  const workspaces = useSelector(getAllWorkspaces);
  const appMode = useSelector(getAppMode);

  // This is only a cache. Only used for first init.
  const activeWorkspaceIds = useSelector(getActiveWorkspaceIds);
  const _activeWorkspaceIds = useRef(activeWorkspaceIds);

  useAvailableWorkspacesListener();

  // Updates workspaceManager with latest data about workspace
  useEffect(() => {
    console.log("[useWorkspaceManager] workspaceManager updater");
    workspaceManager.init(dispatch, workspaces, userId, appMode);
  }, [dispatch, workspaces, userId, appMode]);

  useEffect(() => {
    console.log("[useWorkspaceManager] First Time init");

    // TODO-syncing: Lazy init private workspace here
    if (_activeWorkspaceIds.current.length === 0) {
      _activeWorkspaceIds.current = userId ? [getPrivateWorkspaceId(userId)] : [LOGGED_OUT_WORKSPACE_ID];
    }

    workspaceManager.initActiveWorkspaces(_activeWorkspaceIds.current);

    return () => {
      console.log("[useWorkspaceManager] uid changed. resetActiveWorkspaces");
      workspaceManager.resetActiveWorkspaces();
    };
  }, [dispatch, userId]);

  return {};
};
