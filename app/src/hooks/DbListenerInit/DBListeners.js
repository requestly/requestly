import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "../../store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import userNodeListener from "./userNodeListener";
import { getAuth } from "firebase/auth";
import firebaseApp from "../../firebase";
import Logger from "lib/logger";
import { userSubscriptionDocListener } from "./userSubscriptionDocListener";
import { getActiveWorkspaceId, getActiveWorkspacesMembers } from "store/slices/workspaces/selectors";

window.isFirstSyncComplete = false;

const DBListeners = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const currentTeamMembers = useSelector(getActiveWorkspacesMembers);

  let unsubscribeUserNodeRef = useRef(null);
  window.unsubscribeSyncingNodeRef = useRef(null);

  // Listens to /users/{id} changes
  useEffect(() => {
    if (unsubscribeUserNodeRef.current) unsubscribeUserNodeRef.current(); // Unsubscribe existing user node listener before creating a new one
    if (user?.loggedIn) {
      unsubscribeUserNodeRef.current = userNodeListener(dispatch, user?.details?.profile.uid, appMode);
      /* CAN BE MOVED TO SEPARATE USE EFFECT AND SHOULD HAVE AN UNSUBSCRIBER TOO, will be useful when actually implementing premium */
      userSubscriptionDocListener(dispatch, user?.details?.profile.uid);
    }
  }, [dispatch, user?.details?.profile.uid, user?.loggedIn, appMode]);

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
