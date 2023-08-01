import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Invite } from "types";

export const renameWorkspace = async (teamId: string, newName: string) => {
  const db = getFirestore();
  const teamRef = doc(db, "teams", teamId);

  return updateDoc(teamRef, {
    name: newName,
  });
};

export const getPendingInvites = async ({ email, domain }: { email: boolean; domain: boolean }) => {
  const getInvites = httpsCallable<{ email: boolean; domain: boolean }, { pendingInvites: Invite[]; success: boolean }>(
    getFunctions(),
    "teams-getPendingTeamInvites"
  );
  return getInvites({ email, domain })
    .then((res) => {
      return res?.data;
    })
    .catch((e) => {
      console.log("error", e);
      return [];
    });
};

export const acceptTeamInvite = async (inviteId: string) => {
  const acceptInvite = httpsCallable(getFunctions(), "invites-acceptInvite");

  return acceptInvite({ inviteId })
    .then((res: any) => {
      return res;
    })
    .catch((e) => {
      return null;
    });
};
