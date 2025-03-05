import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { query } from "firebase/database";
import { collection, getFirestore, onSnapshot, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { teamsActions } from "store/features/teams/slice";
import { toast } from "utils/Toast";
import firebaseApp from "../../firebase";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";

const db = getFirestore(firebaseApp);

const splitMembersBasedOnRoles = (members) => {
  const result = {};
  Object.values(members).forEach((member) => {
    if (!result[member.role]) {
      result[member.role] = [];
    }
    result[member.role].push(member);
  });
  return result;
};

const availableTeamsListener = (dispatch, uid, currentlyActiveWorkspace, appMode) => {
  if (!uid) {
    // Rare edge case
    if (currentlyActiveWorkspace.id) {
      clearCurrentlyActiveWorkspace(dispatch, appMode);
    }
    return null;
  }
  try {
    // const q = query(collection(db, "teams"), where(`members.${uid}.role`, "in", ["admin", "writer", "viewer"]));
    const q = query(collection(db, "teams"), where("access", "array-contains", uid));
    console.log("DBG: availableTeamsListener -> q", q);
    return onSnapshot(
      q,
      (querySnapshot) => {
        const records = querySnapshot.docs
          .map((team) => {
            const teamData = team.data();
            console.log("Fetched teamData", teamData);

            if (teamData.deleted) return null;

            if (!teamData.archived && teamData.appsumo) {
              submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_LIFETIME_REDEEMED, true);
            }
            const membersPerRole = splitMembersBasedOnRoles(teamData.members);
            return {
              id: team.id,
              name: teamData.name,
              owner: teamData.owner,
              archived: teamData.archived,
              subscriptionStatus: teamData.subscriptionStatus,
              accessCount: Object.keys(teamData.members).length || 0,
              adminCount: membersPerRole.admin?.length || 0,
              members: teamData.members,
              appsumo: teamData?.appsumo || null,
            };
          })
          .filter(Boolean);

        dispatch(teamsActions.setAvailableTeams(records));

        if (!currentlyActiveWorkspace?.id) return;

        const found = records.find((team) => team.id === currentlyActiveWorkspace.id);

        if (!found) {
          if (!window.hasUserRemovedHimselfRecently)
            alert("You no longer have access to this workspace. Please contact your team admin.");
          clearCurrentlyActiveWorkspace(dispatch, appMode);
          toast.info("Verifying storage checksum");
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        } else {
          // Incase team name, members, or anything has changed
          dispatch(
            teamsActions.setCurrentlyActiveWorkspace({
              id: found.id,
              name: found.name,
              membersCount: found.accessCount,
            })
          );

          // Update details of all team members
          const functions = getFunctions();
          const getTeamUsers = httpsCallable(functions, "teams-getTeamUsers");

          getTeamUsers({
            teamId: currentlyActiveWorkspace?.id,
          })
            .then((res) => {
              const response = res.data;
              if (response.success) {
                const users = {};
                response.users.forEach((user, index) => {
                  users[user.id] = response.users[index];
                });
                dispatch(teamsActions.setCurrentlyActiveWorkspaceMembers(users));
              } else {
                throw new Error(response.message);
              }
            })
            .catch((e) => Logger.error(e));
        }
      },
      (error) => {
        console.log("DBG: availableTeams Query -> error", error);
        Logger.error(error);
      }
    );
  } catch (e) {
    console.log("DBG: availableTeamsListener final catch -> e", e);
    return null;
  }
};

export default availableTeamsListener;
