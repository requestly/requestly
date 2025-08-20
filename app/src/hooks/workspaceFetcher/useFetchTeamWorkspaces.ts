import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import availableTeamsListener from "hooks/DbListenerInit/availableTeamsListener";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";

export const useFetchTeamWorkspaces = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const appMode = useSelector(getAppMode);

  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  const unsubscribeAvailableTeams = useRef(null);

  // Listens to teams available to the user
  useEffect(() => {
    // This effect is triggered also on activeWorkspace changes, so do not subscribe again if listener is already active
    if (unsubscribeAvailableTeams.current) {
      return;
    }

    if (user?.loggedIn && user?.details?.profile?.uid) {
      unsubscribeAvailableTeams.current?.();
      unsubscribeAvailableTeams.current = availableTeamsListener(
        dispatch,
        user?.details?.profile?.uid,
        activeWorkspaceId,
        appMode,
        isLocalSyncEnabled
      );
    } else {
      dispatch(workspaceActions.setAllWorkspaces([]));
      // Very edge case
      if (activeWorkspaceId) {
        clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
    }

    return () => {
      unsubscribeAvailableTeams.current?.();
      unsubscribeAvailableTeams.current = null;
    };
  }, [appMode, activeWorkspaceId, dispatch, user?.details?.profile?.uid, user?.loggedIn, isLocalSyncEnabled]);
};
