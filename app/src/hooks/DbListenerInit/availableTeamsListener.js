import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { query } from "firebase/database";
import { collection, getFirestore, onSnapshot, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { teamsActions } from "store/features/teams/slice";
import { toast } from "utils/Toast";
import firebaseApp from "../../firebase";
import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { WorkspaceType } from "types";
import { getAllWorkspaces } from "services/fsManagerServiceAdapter";

const db = getFirestore(firebaseApp);

const availableTeamsListener = (dispatch, uid, currentlyActiveWorkspace, appMode) => {
  if (!uid) {
    // Rare edge case
    if (currentlyActiveWorkspace.id) {
      clearCurrentlyActiveWorkspace(dispatch, appMode);
    }
    return null;
  }
  try {
    const q = query(collection(db, "teams"), where("access", "array-contains", uid));
    return onSnapshot(
      q,
      async (querySnapshot) => {
				let localRecords = [];
				if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
					const allLocalWorkspacesResult = await getAllWorkspaces();
					const allLocalWorkspaces = allLocalWorkspacesResult.type === "success" ? allLocalWorkspacesResult.content : [];
					for (const partialWorkspace of allLocalWorkspaces) {
						const localWorkspace = {
				        "id": partialWorkspace.id,
				        "name": partialWorkspace.name,
				        "owner": uid,
				        "accessCount": 1,
				        "adminCount": 1,
				        "members": {
				            [uid]: {
				                "role": "admin"
				            }
				        },
				        "appsumo": null,
				        "workspaceType": WorkspaceType.LOCAL,
				        "rootPath": partialWorkspace.path,
				    }

						localRecords.push(localWorkspace);
					}
				}
        const records = querySnapshot.docs
          .map((team) => {
            const teamData = team.data();

            if (teamData.deleted) return null;

            if (!teamData.archived && teamData.appsumo) {
              submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_LIFETIME_REDEEMED, true);
            }

            const formattedTeamData = {
              id: team.id,
              name: teamData.name,
              owner: teamData.owner,
              archived: teamData.archived,
              subscriptionStatus: teamData.subscriptionStatus,
              accessCount: teamData.accessCount,
              adminCount: teamData.adminCount,
              members: teamData.members,
              appsumo: teamData?.appsumo || null,
              workspaceType: teamData?.workspaceType || WorkspaceType.SHARED,
            };

            if (formattedTeamData.workspaceType === WorkspaceType.LOCAL) {
              formattedTeamData.rootPath = teamData.rootPath;
            }

            return formattedTeamData;
          })
          .filter(Boolean);
				records.push(...localRecords);
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
              workspaceType: found.workspaceType,
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
        Logger.error(error);
      }
    );
  } catch (e) {
    return null;
  }
};

export default availableTeamsListener;
