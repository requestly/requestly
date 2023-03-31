import {
  where,
  query,
  orderBy,
  getDocs,
  Timestamp,
  collection,
  getFirestore,
} from "firebase/firestore";
import firebaseApp from "../../firebase";
import { InviteStatus, InviteType, TeamInvite } from "types";

export const getTeamInvites = async (
  email: string
): Promise<TeamInvite[] | null> => {
  const db = getFirestore(firebaseApp);
  const invitesRef = collection(db, "invites");
  const inviteQuery = query(
    invitesRef,
    where("email", "==", email),
    where("type", "==", InviteType.teams),
    where("status", "==", InviteStatus.pending),
    where("expireTs", ">", Timestamp.now().toMillis()),
    orderBy("expireTs", "desc"), // https://firebase.google.com/docs/firestore/query-data/order-limit-data#limitations
    orderBy("createdTs", "desc")
  );

  const querySnapshot = await getDocs(inviteQuery);

  return !querySnapshot.empty
    ? querySnapshot.docs.map((doc) => doc.data() as TeamInvite)
    : [];
};
