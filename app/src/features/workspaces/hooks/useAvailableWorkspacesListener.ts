import { collection, getFirestore, onSnapshot, where, query } from "firebase/firestore";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { workspaceActions } from "store/slices/workspaces/slice";
import { Workspace, WorkspaceMemberRole, WorkspaceType } from "../types";
import firebaseApp from "firebase";
import { LoggedOutWorkspace } from "../utils";
import { getAllWorkspaces } from "services/fsManagerServiceAdapter";

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

const db = getFirestore(firebaseApp);

export const useAvailableWorkspacesListener = () => {
  const dispatch = useDispatch();

  const user = useSelector(getUserAuthDetails);

  const uid = user.details?.profile?.uid;
  // TODO-syncing: Needs to be uncommented
  // const isLocalSyncEnabled = useCheckLocalSyncSupport({ skipWorkspaceCheck: true });
  const isLocalSyncEnabled = false;

  useEffect(() => {
    console.log("[useAvailableTeamsListener] start");

    if (!uid) {
      console.log("[useAvailableTeamsListener] User not logged in");
      dispatch(workspaceActions.setAllWorkspaces([LoggedOutWorkspace]));
      dispatch(workspaceActions.setWorkspacesUpdatedAt(Date.now()));
      return () => {
        dispatch(workspaceActions.setAllWorkspaces([]));
        dispatch(workspaceActions.setWorkspacesUpdatedAt(0));
      };
    }

    try {
      const q = query(collection(db, "teams"), where(`members.${uid}.role`, "in", ["admin", "write", "read"]));

      const unsub = onSnapshot(q, async (querySnapshot) => {
        const records = querySnapshot.docs
          .map((teamDoc) => {
            const teamData = teamDoc.data() as Workspace;

            if (teamData.deleted) return null;

            if (!teamData.archived && teamData.appsumo) {
              submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.SESSION_REPLAY_LIFETIME_REDEEMED, true);
            }

            const membersPerRole = splitMembersBasedOnRoles(teamData.members);

            return {
              id: teamDoc.id,
              name: teamData.name,
              owner: teamData.owner,
              archived: teamData.archived,
              subscriptionStatus: teamData.subscriptionStatus,
              accessCount: Object.keys(teamData.members).length || 0,
              adminCount: membersPerRole.admin?.length || 0,
              members: teamData.members,
              appsumo: teamData?.appsumo || null,
              workspaceType: teamData?.workspaceType || WorkspaceType.SHARED,
              // @ts-ignore
              createdAt: teamData?.creationTime?.toMillis(),
              isSyncEnabled: teamData.isSyncEnabled,
            };
          })
          .filter(Boolean);

        console.log("[useAvailableTeamsListener] fetched teams", { records });

        let localRecords = [];
        if (isLocalSyncEnabled) {
          const allLocalWorkspacesResult = await getAllWorkspaces();
          const allLocalWorkspaces =
            allLocalWorkspacesResult.type === "success" ? allLocalWorkspacesResult.content : [];
          for (const partialWorkspace of allLocalWorkspaces) {
            const localWorkspace: Workspace = {
              id: partialWorkspace.id,
              name: partialWorkspace.name,
              owner: uid,
              accessCount: 1,
              adminCount: 1,
              members: {
                [uid]: {
                  role: WorkspaceMemberRole.admin,
                },
              },
              appsumo: null,
              workspaceType: WorkspaceType.LOCAL,
              rootPath: partialWorkspace.path,
            };

            localRecords.push(localWorkspace);
          }
        }

        // FIXME-syncing: private workspace should not be hardcoded like this here. It should automatically get fetched from db
        dispatch(workspaceActions.setAllWorkspaces([...records, ...localRecords]));
        dispatch(workspaceActions.setWorkspacesUpdatedAt(Date.now()));
      });

      return () => {
        console.log("[useAvailableWorkspacesListener] Unsubscribing Workspaces Listener");
        dispatch(workspaceActions.setAllWorkspaces([]));
        dispatch(workspaceActions.setWorkspacesUpdatedAt(0));
        unsub?.();
      };
    } catch (error) {
      console.error(error);
    }
  }, [dispatch, isLocalSyncEnabled, uid]);
};
