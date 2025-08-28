import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import firebaseApp from "../../firebase";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { WorkspaceType } from "types";
import * as Sentry from "@sentry/react";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspace, getAllWorkspaces } from "store/slices/workspaces/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";

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
  const activeWorkspace = useSelector(getActiveWorkspace);
  const appMode = useSelector(getAppMode);
  const allWorkspaces = useSelector(getAllWorkspaces);

  const unsubscribeAvailableTeams = useRef<(() => void) | null>(null);

  // Listens to teams available to the user
  useEffect(() => {
    // This effect is triggered also on activeWorkspace changes, so do not subscribe again if listener is already active
    if (unsubscribeAvailableTeams.current) {
      return;
    }

    const activeWorkspaceId = activeWorkspace?.id;
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

            //FIX ME: the following code's intention is unclear
            //Showing an alert is unnecessary
            const found = [...allWorkspaces, ...records].find((team) => team.id === activeWorkspaceId);
            // concating because allWorkspaces can be stale here after dispatch (just a prevention, data isn't found to be stale), this effect needs to be refactored to fix this

            Logger.log("DBG: availableTeamsListener", {
              teamFound: found,
              fetchedRecords: records,
              activeWorkspaceId,
              hasUserRemovedHimselfRecently: (window as any).hasUserRemovedHimselfRecently,
            });

            if (!found) {
              Sentry.captureException(new Error(`No workspace found`), {
                extra: {
                  activeWorkspaceId,
                  hasUserRemovedHimselfRecently: (window as any).hasUserRemovedHimselfRecently,
                },
              });

              if (!(window as any).hasUserRemovedHimselfRecently) {
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
                  const response = res.data as any;
                  if (response.success) {
                    const users: any = {};
                    response.users.forEach((user: any, index: number) => {
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
        unsubscribeAvailableTeams.current = null;
      }
    } else {
      const localWorkspaces = allWorkspaces.filter((workspace) => workspace.workspaceType === WorkspaceType.LOCAL);
      dispatch(workspaceActions.setAllWorkspaces([]));
      dispatch(workspaceActions.upsertManyWorkspaces(localWorkspaces));
      // Very edge case
      if (activeWorkspaceId && activeWorkspace?.workspaceType === WorkspaceType.SHARED) {
        clearCurrentlyActiveWorkspace(dispatch, appMode);
      }
    }

    return () => {
      unsubscribeAvailableTeams.current?.();
      unsubscribeAvailableTeams.current = null;
    };
    // This useEffect shouldn't be triggered on any workspace change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode, dispatch, user?.details?.profile?.uid, user?.loggedIn]);
};
