import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import { query } from "firebase/database";
import {
  collection,
  getFirestore,
  onSnapshot,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";
import { teamsActions } from "store/features/teams/slice";
// import { toast } from "utils/Toast";
import firebaseApp from "../../firebase";

const db = getFirestore(firebaseApp);

const availableTeamsListener = (
  dispatch,
  uid,
  currentlyActiveWorkspace,
  appMode
) => {
  if (!uid) {
    // Rare edge case
    if (currentlyActiveWorkspace.id) {
      clearCurrentlyActiveWorkspace(dispatch, appMode);
    }
    return null;
  }
  try {
    const q = query(
      collection(db, "teams"),
      where("access", "array-contains", uid)
    );
    return onSnapshot(
      q,
      (querySnapshot) => {
        const records = querySnapshot.docs.reduce((result, team) => {
          const teamData = team.data();

          if (teamData.delete) {
            return result;
          }

          return result.concat({
            id: team.id,
            name: teamData.name,
            subscriptionStatus: teamData.subscriptionStatus,
            accessCount: teamData.accessCount,
            adminCount: teamData.adminCount,
          });
        }, []);

        dispatch(teamsActions.setAvailableTeams(records));

        if (!currentlyActiveWorkspace?.id) return;

        const found = records.find(
          (team) => team.id === currentlyActiveWorkspace.id
        );
        if (!found) {
          alert(
            "You no longer have access to this workspace. Please contact your team admin or requestly."
          );
          clearCurrentlyActiveWorkspace(dispatch, appMode);
          // toast.info("Verifying storage checksum");
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
          const getTeamUsers = httpsCallable(functions, "getTeamUsers");

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
                dispatch(
                  teamsActions.setCurrentlyActiveWorkspaceMembers(users)
                );
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
