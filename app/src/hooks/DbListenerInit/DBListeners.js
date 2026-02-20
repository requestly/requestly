import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getAuthInitialization } from "../../store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import syncingNodeListener from "./syncingNodeListener";
import userNodeListener from "./userNodeListener";
import { globalActions } from "store/slices/global/slice";
import { isArray } from "lodash";
import { useHasChanged } from "hooks/useHasChanged";
import { userSubscriptionDocListener } from "./userSubscriptionDocListener";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

window.isFirstSyncComplete = false;

const DBListeners = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const hasAuthInitialized = useSelector(getAuthInitialization);

  let unsubscribeUserNodeRef = useRef(null);
  window.unsubscribeSyncingNodeRef = useRef(null);

  const hasAuthStateChanged = useHasChanged(user?.loggedIn);

  // Listens to /users/{id} changes
  useEffect(() => {
    if (unsubscribeUserNodeRef.current) unsubscribeUserNodeRef.current(); // Unsubscribe existing user node listener before creating a new one
    if (user?.loggedIn) {
      unsubscribeUserNodeRef.current = userNodeListener(dispatch, user?.details?.profile.uid, appMode);
      /* CAN BE MOVED TO SEPARATE USE EFFECT AND SHOULD HAVE AN UNSUBSCRIBER TOO, will be useful when actually implementing premium */
      userSubscriptionDocListener(dispatch, user?.details?.profile.uid);
    }
  }, [dispatch, user?.details?.profile?.uid, user?.loggedIn, appMode]);

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
    user?.details?.profile?.uid,
    user?.details?.isSyncEnabled,
    hasAuthStateChanged,
  ]);

  return null;
};

export default DBListeners;
