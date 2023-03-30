import firebaseApp from "../../firebase";
import {
  where,
  query,
  getDocs,
  // Timestamp,
  collection,
  getFirestore,
} from "firebase/firestore";
// import { InviteStatus, InviteType } from "types";

export const getTeamInvites = async (email: string): Promise<any> => {
  const db = getFirestore(firebaseApp);
  const invitesRef = collection(db, "invites");
  const inviteQuery = query(
    invitesRef,
    where("email", "==", email)
    // where("type", "==", InviteType.teams),
    // where("status", "==", InviteStatus.pending),
    // where("expireTs", ">", Timestamp.now().toMillis())
  );

  const querySnapshot = await getDocs(inviteQuery);

  console.log("------ logging ------ ::", querySnapshot.docs);
  if (!querySnapshot.empty) {
    return querySnapshot.docs;
  } else {
    return null;
  }
};
