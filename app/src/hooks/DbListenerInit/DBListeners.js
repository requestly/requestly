import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace, getCurrentlyActiveWorkspaceMembers } from "store/features/teams/selectors";
import { getAppMode, getUserAuthDetails } from "../../store/selectors";
import availableTeamsListener from "./availableTeamsListener";
import syncingNodeListener from "./syncingNodeListener";
import userNodeListener from "./userNodeListener";
import { teamsActions } from "store/features/teams/slice";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { getAuth } from "firebase/auth";
import firebaseApp from "../../firebase";
import Logger from "lib/logger";
import { actions } from "store";
import { isArray } from "lodash";
import { useHasChanged } from "hooks/useHasChanged";

window.isFirstSyncComplete = false;

const DBListeners = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const currentTeamMembers = useSelector(getCurrentlyActiveWorkspaceMembers);
  let unsubscribeUserNodeRef = useRef(null);
  window.unsubscribeSyncingNodeRef = useRef(null);
  let unsubscribeAvailableTeams = useRef(null);

  const hasAuthStateChanged = useHasChanged(user?.loggedIn);

  // Listens to /users/{id} changes
  useEffect(() => {
    if (unsubscribeUserNodeRef.current) unsubscribeUserNodeRef.current(); // Unsubscribe existing user node listener before creating a new one
    if (user?.loggedIn) {
      unsubscribeUserNodeRef.current = userNodeListener(dispatch, user?.details?.profile.uid, appMode);
    }
  }, [dispatch, user?.details?.profile.uid, user?.loggedIn, appMode]);

  // Listens to /sync/{id}/metadata or /teamSync/{id}/metadata changes
  useEffect(() => {
    if (hasAuthStateChanged || !window.isFirstSyncComplete) {
      dispatch(actions.updateIsRulesListLoading(true));
    }

    // Unsubscribe any existing listener
    if (window.unsubscribeSyncingNodeRef.current && isArray(window.unsubscribeSyncingNodeRef.current)) {
      window.unsubscribeSyncingNodeRef.current.forEach((removeFirebaseListener) => {
        removeFirebaseListener && removeFirebaseListener();
      });
    }

    if (user?.loggedIn && user?.details?.profile?.uid) {
      if (currentlyActiveWorkspace.id || user?.details?.isSyncEnabled) {
        // This is a team or individual sync
        // Set the db node listener
        window.unsubscribeSyncingNodeRef.current = syncingNodeListener(
          dispatch,
          user?.details?.profile.uid,
          currentlyActiveWorkspace?.id,
          appMode,
          user?.details?.isSyncEnabled
        );
      } else {
        // Do it here if syncing is not enabled. Else syncing would have triggered this.
        window.isFirstSyncComplete = true;
        dispatch(actions.updateIsRulesListLoading(false));
      }
    } else {
      // Do it here if syncing is not enabled. Else syncing would have triggered this.
      window.isFirstSyncComplete = true;
      dispatch(actions.updateIsRulesListLoading(false));
    }
  }, [
    appMode,
    currentlyActiveWorkspace.id,
    dispatch,
    user?.loggedIn,
    user?.details?.profile.uid,
    user?.details?.isSyncEnabled,
    hasAuthStateChanged,
  ]);

  // Listens to teams available to the user
  // Also listens to changes to the currently active workspace
  useEffect(() => {
    if (unsubscribeAvailableTeams.current) unsubscribeAvailableTeams.current(); // Unsubscribe any existing listener
    if (user?.loggedIn && user?.details?.profile?.uid) {
      unsubscribeAvailableTeams.current = availableTeamsListener(
        dispatch,
        user?.details?.profile?.uid,
        currentlyActiveWorkspace,
        appMode
      );
    } else {
      dispatch(teamsActions.setAvailableTeams(null));
      // Very edge case
      if (currentlyActiveWorkspace.id) {
        clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
    }
  }, [appMode, currentlyActiveWorkspace, dispatch, user?.details?.profile?.uid, user?.loggedIn]);

  /* Force refresh custom claims in auth token */
  useEffect(() => {
    getAuth(firebaseApp)
      .currentUser?.getIdTokenResult(true)
      ?.then((status) => {
        Logger.log("force updated auth token");
      });
  }, [user?.details?.profile?.uid, user?.loggedIn, currentlyActiveWorkspace, currentTeamMembers, dispatch]);

  return null;
};

export default DBListeners;
