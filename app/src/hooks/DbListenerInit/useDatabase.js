import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentlyActiveWorkspace,
  getCurrentlyActiveWorkspaceMembers,
} from "store/features/teams/selectors";
import { getAppMode, getUserAuthDetails } from "../../store/selectors";
import availableTeamsListener from "./availableTeamsListener";
import syncingNodeListener from "./syncingNodeListener";
import userNodeListener from "./userNodeListener";
import userSubscriptionNodeListener from "./userSubscriptionNodeListener";
import { teamsActions } from "store/features/teams/slice";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { getAuth } from "firebase/auth";
import firebaseApp from "../../firebase";
import Logger from "lib/logger";

const useDatabase = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const currentTeamMembers = useSelector(getCurrentlyActiveWorkspaceMembers);
  let unsubscribeUserNodeRef = useRef(null);
  let unsubscribeSyncingNodeRef = useRef(null);
  let unsubscribeAvailableTeams = useRef(null);

  // Listens to /users/{id} changes
  useEffect(() => {
    if (unsubscribeUserNodeRef.current) unsubscribeUserNodeRef.current(); // Unsubscribe existing user node listener before creating a new one
    if (user?.loggedIn) {
      unsubscribeUserNodeRef.current = userNodeListener(
        dispatch,
        user?.details?.profile.uid,
        appMode
      );

      userSubscriptionNodeListener(dispatch);
    }
  }, [dispatch, user?.details?.profile.uid, user?.loggedIn, appMode]);

  // Listens to /sync/{id}/metadata or /teamSync/{id}/metadata changes
  useEffect(() => {
    if (unsubscribeSyncingNodeRef.current) unsubscribeSyncingNodeRef.current(); // Unsubscribe any existing listener
    if (user?.loggedIn && user?.details) {
      if (currentlyActiveWorkspace.id) {
        // This is a team sync
        // Set the db node listener
        unsubscribeSyncingNodeRef.current = syncingNodeListener(
          dispatch,
          "teamSync",
          user?.details?.profile.uid,
          currentlyActiveWorkspace.id,
          appMode
        );
      } else if (
        user?.details?.isSyncEnabled ||
        appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE
      ) {
        // This is individual syncing
        // Set the db node listener
        unsubscribeSyncingNodeRef.current = syncingNodeListener(
          dispatch,
          "sync",
          user?.details?.profile.uid,
          null,
          appMode
        );
      }
    }
  }, [
    appMode,
    currentlyActiveWorkspace.id,
    dispatch,
    user,
    user?.details?.isSyncEnabled,
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
  }, [
    appMode,
    currentlyActiveWorkspace,
    dispatch,
    user?.details?.profile?.uid,
    user?.loggedIn,
  ]);

  /* Force refresh custom claims in auth token */
  useEffect(() => {
    getAuth(firebaseApp)
      .currentUser?.getIdTokenResult(true)
      ?.then((status) => {
        Logger.log("force updated auth token");
      });
  }, [
    user?.details?.profile?.uid,
    user?.loggedIn,
    currentlyActiveWorkspace,
    currentTeamMembers,
    dispatch,
  ]);
};

export default useDatabase;
