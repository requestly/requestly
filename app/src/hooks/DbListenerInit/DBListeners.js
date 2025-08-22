import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getAuthInitialization } from "../../store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import availableTeamsListener from "./availableTeamsListener";
import syncingNodeListener from "./syncingNodeListener";
import userNodeListener from "./userNodeListener";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { getAuth } from "firebase/auth";
import firebaseApp from "../../firebase";
import Logger from "lib/logger";
import { globalActions } from "store/slices/global/slice";
import { isArray } from "lodash";
import { useHasChanged } from "hooks/useHasChanged";
import { userSubscriptionDocListener } from "./userSubscriptionDocListener";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";
import { workspaceActions } from "store/slices/workspaces/slice";
import { getActiveWorkspaceId, getActiveWorkspacesMembers } from "store/slices/workspaces/selectors";

window.isFirstSyncComplete = false;

const DBListeners = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const currentTeamMembers = useSelector(getActiveWorkspacesMembers);
  const hasAuthInitialized = useSelector(getAuthInitialization);
  const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });

  let unsubscribeUserNodeRef = useRef(null);
  window.unsubscribeSyncingNodeRef = useRef(null);
  let unsubscribeAvailableTeams = useRef(null);

  const hasAuthStateChanged = useHasChanged(user?.loggedIn);

  // Listens to /users/{id} changes
  useEffect(() => {
    if (unsubscribeUserNodeRef.current) unsubscribeUserNodeRef.current(); // Unsubscribe existing user node listener before creating a new one
    if (user?.loggedIn) {
      unsubscribeUserNodeRef.current = userNodeListener(dispatch, user?.details?.profile.uid, appMode);
      /* CAN BE MOVED TO SEPARATE USE EFFECT AND SHOULD HAVE AN UNSUBSCRIBER TOO, will be useful when actually implementing premium */
      userSubscriptionDocListener(dispatch, user?.details?.profile.uid);
    }
  }, [dispatch, user?.details?.profile.uid, user?.loggedIn, appMode]);

  // Listens to /sync/{id}/metadata or /teamSync/{id}/metadata changes
  useEffect(() => {
    if (!hasAuthInitialized) return;
    if (hasAuthStateChanged || !window.isFirstSyncComplete) {
      dispatch(globalActions.updateIsRulesListLoading(true));
    }

    // Unsubscribe any existing listener
    if (window.unsubscribeSyncingNodeRef.current && isArray(window.unsubscribeSyncingNodeRef.current)) {
      window.unsubscribeSyncingNodeRef.current.forEach((removeFirebaseListener) => {
        removeFirebaseListener && removeFirebaseListener();
      });
    }

    if (user?.loggedIn && user?.details?.profile?.uid) {
      if (activeWorkspaceId || user?.details?.isSyncEnabled) {
        // This is a team or individual sync
        // Set the db node listener
        window.unsubscribeSyncingNodeRef.current = syncingNodeListener(
          dispatch,
          user?.details?.profile.uid,
          activeWorkspaceId,
          appMode,
          user?.details?.isSyncEnabled
        );
      } else {
        // Do it here if syncing is not enabled. Else syncing would have triggered this.
        window.isFirstSyncComplete = true;
        dispatch(globalActions.updateIsRulesListLoading(false));
      }
    } else {
      // Do it here if syncing is not enabled. Else syncing would have triggered this.
      window.isFirstSyncComplete = true;
      dispatch(globalActions.updateIsRulesListLoading(false));
    }
  }, [
    hasAuthInitialized,
    appMode,
    activeWorkspaceId,
    dispatch,
    user?.loggedIn,
    user?.details?.profile.uid,
    user?.details?.isSyncEnabled,
    hasAuthStateChanged,
  ]);

  // Listens to teams available to the user
  // Also listens to changes to the currently active workspace /* TODO: THIS SHOULD BE DONE IN A SEPARATE USEEFFECT */
  useEffect(() => {
    if (unsubscribeAvailableTeams.current) unsubscribeAvailableTeams.current(); // Unsubscribe any existing listener
    if (user?.loggedIn && user?.details?.profile?.uid) {
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
  }, [appMode, activeWorkspaceId, dispatch, user?.details?.profile?.uid, user?.loggedIn, isLocalSyncEnabled]);

  /* Force refresh custom claims in auth token */
  useEffect(() => {
    getAuth(firebaseApp)
      .currentUser?.getIdTokenResult(true)
      ?.then((status) => {
        Logger.log("force updated auth token");
      });
  }, [user?.details?.profile?.uid, user?.loggedIn, activeWorkspaceId, currentTeamMembers, dispatch]);

  return null;
};

export default DBListeners;
