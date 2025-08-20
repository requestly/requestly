import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { query } from "firebase/database";
import { collection, getFirestore, onSnapshot, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import firebaseApp from "../../firebase";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { WorkspaceType } from "types";
import { workspaceActions } from "store/slices/workspaces/slice";
import * as Sentry from "@sentry/react";

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

const availableTeamsListener = (dispatch, uid, activeWorkspaceId, appMode, isLocalSyncEnabled) => {
  if (!uid) {
    // Rare edge case
    if (activeWorkspaceId) {
      clearCurrentlyActiveWorkspace(dispatch, appMode);
    }
    return null;
  }

  try {
    const q = query(collection(db, "teams"), where(`members.${uid}.role`, "in", ["admin", "write", "read"]));
    return onSnapshot(
      q,
      async (querySnapshot) => {
        // let localRecords = [];
        // if (isLocalSyncEnabled) {
        // const allLocalWorkspacesResult = await getAllWorkspaces();
        // const allLocalWorkspaces =
        //   allLocalWorkspacesResult.type === "success" ? allLocalWorkspacesResult.content : [];

        // submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_LOCAL_WORKSPACES, allLocalWorkspaces.length);

        // for (const partialWorkspace of allLocalWorkspaces) {
        //   const localWorkspace = {
        //     id: partialWorkspace.id,
        //     name: partialWorkspace.name,
        //     owner: uid,
        //     accessCount: 1,
        //     adminCount: 1,
        //     members: {
        //       [uid]: {
        //         role: "admin",
        //       },
        //     },
        //     appsumo: null,
        //     workspaceType: WorkspaceType.LOCAL,
        //     rootPath: partialWorkspace.path,
        //   };

        //   localRecords.push(localWorkspace);
        // }
        // }

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

            const formattedTeamData = {
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
        dispatch(workspaceActions.upsertManyWorkspaces(records));

        if (!activeWorkspaceId) return;

        const found = records.find((team) => team.id === activeWorkspaceId);

        Logger.log("DBG: availableTeamsListener", {
          teamFound: found,
          fetchedRecords: records,
          activeWorkspaceId,
          hasUserRemovedHimselfRecently: window.hasUserRemovedHimselfRecently,
        });

        if (!found) {
          Sentry.captureException(new Error(`No workspace found`), {
            extra: {
              activeWorkspaceId,
              hasUserRemovedHimselfRecently: window.hasUserRemovedHimselfRecently,
            },
          });

          if (!window.hasUserRemovedHimselfRecently) {
            alert("You no longer have access to this workspace. Please contact your team admin.");
          }

          clearCurrentlyActiveWorkspace(dispatch, appMode);
          toast.info("Verifying storage checksum");
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        } else {
          // Incase team name, members, or anything has changed
          // No need
          dispatch(workspaceActions.setActiveWorkspaceIds(found.id ? [found.id] : []));

          // Update details of all team members
          const functions = getFunctions();
          const getTeamUsers = httpsCallable(functions, "teams-getTeamUsers");

          getTeamUsers({
            teamId: activeWorkspaceId,
          })
            .then((res) => {
              const response = res.data;
              if (response.success) {
                const users = {};
                response.users.forEach((user, index) => {
                  users[user.id] = response.users[index];
                });
                dispatch(workspaceActions.setActiveWorkspacesMembers(users));
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
