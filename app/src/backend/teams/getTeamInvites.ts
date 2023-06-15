import { where, query, getDocs, Timestamp, collection, getFirestore } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { InviteStatus, InviteType, TeamInvite } from "types";

export const getTeamInvites = async (email: string): Promise<TeamInvite[] | null> => {
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
