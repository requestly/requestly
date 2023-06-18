import { where, query, getDocs, Timestamp, collection, getFirestore } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { InviteStatus, InviteType, TeamInvite } from "types";
import { getDomainFromEmail } from "utils/FormattingHelper";

export const getPendingInvites = async (email: string): Promise<TeamInvite[] | null> => {
  if (!email) {
    return null;
  }

  const db = getFirestore(firebaseApp);
  const invitesRef = collection(db, "invites");
  const inviteQuery = query(
    invitesRef,
    where("email", "==", email),
    where("type", "==", InviteType.teams),
    where("status", "==", InviteStatus.pending),
    where("expireTs", ">", Timestamp.now().toMillis())
  );

  const querySnapshot = await getDocs(inviteQuery);

  return !querySnapshot.empty
    ? querySnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc?.id } as TeamInvite;
      })
    : [];
};

export const getTeamsWithPendingInvites = async (email: string, currentUserId: string) => {
  const pendingInvites = await getPendingInvites(email);

  const teamIds = pendingInvites.map((invite) => {
    return invite.metadata.teamId as string;
  });

  return await getNotJoinedTeams(teamIds, currentUserId);
};

export const getTeamsWithSameDomainEnabled = async (email: string, currentUserId: string) => {
  const db = getFirestore(firebaseApp);
  const domain = getDomainFromEmail(email);

  const invitesRef = collection(db, "invites");
  const inviteQuery = query(
    invitesRef,
    where("email", "==", null),
    where("type", "==", InviteType.teams),
    where("status", "==", InviteStatus.pending),
    where("expireTs", ">", Timestamp.now().toMillis()),
    where("domains", "array-contains", domain)
  );

  const querySnapshot = await getDocs(inviteQuery);

  const teamIds = querySnapshot.docs.map((doc) => {
    return doc.data().metadata.teamId as string;
  });

  return await getNotJoinedTeams(teamIds, currentUserId);
};

const getNotJoinedTeams = async (teamIds: string[], userId: string) => {
  if (teamIds.length === 0) {
    return [];
  }

  const db = getFirestore(firebaseApp);
  const teamsRef = collection(db, "teams");

  const teamsQuery = query(teamsRef, where("__name__", "in", teamIds));

  const querySnapshot = await getDocs(teamsQuery);

  const teams = querySnapshot.docs
    .map((doc) => {
      return doc.data();
    })
    .filter((team) => !team.access.includes(userId));

  return teams;
};
