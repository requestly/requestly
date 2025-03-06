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

  try {
    const res = await getInvites({ email, domain });
    return res?.data;
  } catch (e) {
    console.log("getPendingInvites:error", e);
    return { pendingInvites: [], success: false };
  }
};

export const acceptTeamInvite = async (inviteId: string) => {
  const acceptInvite = httpsCallable<
    { inviteId: string },
    { data?: { invite: Invite }; success: boolean; message: string }
  >(getFunctions(), "invites-acceptInvite");

  try {
    const res = await acceptInvite({ inviteId });
    return res?.data;
  } catch (error) {
    console.log("acceptTeamInvite: error", error);
    return { success: false, message: "Error while accepting invite" };
  }
};
