import { collection, getFirestore, onSnapshot, where, query } from "firebase/firestore";
import Logger from "lib/logger";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";
import { Workspace } from "../types";
import firebaseApp from "firebase";
import { getPrivateWorkspace, LoggedOutWorkspace } from "../utils";

const db = getFirestore(firebaseApp);

export const useAvailableWorkspacesListener = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);

  const uid = user.details?.profile?.uid;

  useEffect(() => {
    Logger.log("[useAvailableTeamsListener] start");

    if (!uid) {
      Logger.log("[useAvailableTeamsListener] User not logged in");
      dispatch(workspaceActions.setAllWorkspaces([LoggedOutWorkspace]));
      return;
    }

    try {
      const collectionRef = collection(db, "teams");
      const q = query(collectionRef, where("access", "array-contains", uid));

      const unsub = onSnapshot(q, (querySnapshot) => {
        const records = querySnapshot.docs
          .map((teamDoc) => {
            const teamData = teamDoc.data() as Workspace;

            if (teamData.deleted) return null;

            if (!teamData.archived && teamData.appsumo) {
              submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_LIFETIME_REDEEMED, true);
            }
            return {
              id: teamDoc.id,
              name: teamData.name,
              owner: teamData.owner,
              archived: teamData.archived,
              subscriptionStatus: teamData.subscriptionStatus,
              accessCount: teamData.accessCount,
              adminCount: teamData.adminCount,
              members: teamData.members,
              appsumo: teamData?.appsumo || null,
              // @ts-ignore
              createdAt: teamData?.creationTime?.toMillis(),
            };
          })
          .filter(Boolean);

        Logger.log("[useAvailableTeamsListener] fetched teams", { records });

        dispatch(workspaceActions.setAllWorkspaces([...records, getPrivateWorkspace(uid)]));
      });

      return () => {
        Logger.log("[useAvailableTeamsListener] Unsubscribing Workspaces Listener");
        unsub?.();
      };
    } catch (error) {
      Logger.error(error);
    }
  }, [dispatch, uid]);
};
