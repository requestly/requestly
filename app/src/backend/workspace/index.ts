import { doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Invite } from "types";
import { RuleMetadataSyncType, UserWorkspaceConfig } from "./types";

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

export const setWorkspaceSyncState = async (workspaceId: string, state: boolean) => {
  const db = getFirestore();
  const teamRef = doc(db, "teams", workspaceId);

  return updateDoc(teamRef, {
    isSyncEnabled: state,
  });
};

export const getUserWorkspaceConfig = async (userId: string, workspaceId: string) => {
  const db = getFirestore();
  const userWorkspaceConfigRef = doc(db, "teams", workspaceId, "users", userId);

  return getDoc(userWorkspaceConfigRef).then((doc) => {
    if (doc.exists()) {
      return doc.data() as UserWorkspaceConfig;
    }

    return {};
  });
};

export const setUserWorkspaceRuleMetadataSyncType = async (
  userId: string,
  workspaceId: string,
  syncType: RuleMetadataSyncType
) => {
  const db = getFirestore();
  const userWorkspaceConfigRef = doc(db, "teams", workspaceId, "users", userId);

  return setDoc(
    userWorkspaceConfigRef,
    {
      ruleMetadataSyncType: syncType || RuleMetadataSyncType.GLOBAL,
    },
    { merge: true }
  );
};
