import firebaseApp from "../../firebase";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
export * from "./getTeamInvites";

export const migrateCurrentWorkspacePublicInvite = (inviteId: string, publicEnabled: boolean) => {
  const db = getFirestore(firebaseApp);
  const inviteRef = doc(db, "invites", inviteId);
  updateDoc(inviteRef, {
    public: publicEnabled,
  });
};
