import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import Logger from "lib/logger";
import firebaseApp from "../../../firebase";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Workspace, WorkspaceType } from "features/workspaces/types";

const db = getFirestore(firebaseApp);

const splitMembersBasedOnRoles = (members: any) => {
  const result: any = {};
  Object.values(members).forEach((member: any) => {
    if (!result[member.role]) {
      result[member.role] = [];
    }
    result[member.role].push(member);
  });
  return result;
};

export const useFetchTeamWorkspaces = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const [sharedWorkspaces, setSharedWorkspaces] = useState<Workspace[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const unsubscribeAvailableTeams = useRef<(() => void) | null>(null);

  // Listens to teams available to the user
  useEffect(() => {
    // This effect is triggered also on activeWorkspace changes, so donot subscribe again if listener is already active
    if (unsubscribeAvailableTeams.current) {
      return;
    }

    const uid = user?.details?.profile?.uid;

    if (user?.loggedIn && uid) {
      try {
        const q = query(collection(db, "teams"), where(`members.${uid}.role`, "in", ["admin", "write", "read"]));
        unsubscribeAvailableTeams.current = onSnapshot(
          q,
          async (querySnapshot) => {
            const records = querySnapshot.docs
              .map((team) => {
                const teamData = team.data();

                if (teamData.deleted) return null;

                if (!teamData.archived && teamData.appsumo) {
                  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_LIFETIME_REDEEMED, true);
                }

                if (teamData?.workspaceType === WorkspaceType.LOCAL) {
                  return null;
                }

                const membersPerRole = splitMembersBasedOnRoles(teamData.members);

                const formattedTeamData: any = {
                  id: team.id,
                  name: teamData.name,
                  owner: teamData.owner,
                  archived: teamData.archived,
                  subscriptionStatus: teamData.subscriptionStatus,
                  accessCount: Object.keys(teamData.members).length || 0,
                  adminCount: membersPerRole.admin?.length || 0,
                  members: teamData.members,
                  appsumo: teamData?.appsumo || null,
                  workspaceType: teamData?.workspaceType || WorkspaceType.SHARED,
                  isSyncEnabled: teamData.isSyncEnabled || true, // Default to true for backward compatibility
                };

                if (teamData?.browserstackDetails) {
                  formattedTeamData.browserstackDetails = {
                    groupId: teamData.browserstackDetails?.groupId,
                    subGroupId: teamData.browserstackDetails?.subGroupId,
                  };
                }

                return formattedTeamData;
              })
              .filter(Boolean);
            setIsInitialized(true);
            setSharedWorkspaces(records);
          },
          (error) => {
            console.log("[Debug]: availableTeams Query -> error", error);
            Logger.error(error);
          }
        );
      } catch (e) {
        console.log("DBG: availableTeamsListener final catch -> e", e);
        unsubscribeAvailableTeams.current = null;
      }
    } else {
      setIsInitialized(true);
      setSharedWorkspaces([]);
    }

    return () => {
      setIsInitialized(false);
      setSharedWorkspaces([]);
      unsubscribeAvailableTeams.current?.();
      unsubscribeAvailableTeams.current = null;
    };

    // This effect shouldn't be triggered on change of activeWorkspaceId
    // So we can safely ignore it in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode, dispatch, user?.details?.profile?.uid, user?.loggedIn]);

  return {
    sharedWorkspaces,
    isInitialized,
  };
};
