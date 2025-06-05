import { getFunctions, httpsCallable } from "firebase/functions";
import firebaseApp from "../../firebase";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Logger from "lib/logger";
import { BillingTeamDetails, BillingTeamRoles } from "features/settings/components/BillingTeam/types";
import PATHS from "config/constants/sub/paths";

// TODO: remove this index.ts file and move the functions to the appropriate files refer mocks directory for reference
export const getBillingTeamInvoices = async (billingId: string) => {
  if (!billingId) {
    return null;
  }

  const db = getFirestore(firebaseApp);
  const billingTeamInvoices = await getDocs(collection(db, "billing", billingId, "invoices"));
  const billingTeamInvoiceDetails = billingTeamInvoices.docs.map((billingTeamInvoice) => {
    return billingTeamInvoice.data();
  });

  return billingTeamInvoiceDetails;
};

export const getBillingTeamMembersProfile = async (billingId: string) => {
  if (!billingId) {
    return null;
  }

  const getMembersProfile = httpsCallable<
    { billingId: string },
    { success: boolean; billingTeamMembers: Record<string, any> }
  >(getFunctions(), "billing-getMembersProfile");
  return getMembersProfile({ billingId })
    .then((res) => {
      if (!res.data.success) {
        return null;
      }
      return res.data.billingTeamMembers;
    })
    .catch((err) => {
      Logger.log("Error while fetching billing team members profile", err);
    });
};

export const addUsersToBillingTeam = async (billingId: string, userEmails: string[]) => {
  if (!billingId || !userEmails) {
    return null;
  }

  const addUsers = httpsCallable<{ billingId: string; userEmails: string[] }>(getFunctions(), "billing-addUsers");

  return addUsers({ billingId, userEmails });
};

export const removeMemberFromBillingTeam = async (billingId: string, userId: string) => {
  if (!billingId || !userId) {
    return null;
  }

  const removeUser = httpsCallable<{ billingId: string; userId: string }>(getFunctions(), "billing-removeUser");

  return removeUser({ billingId, userId });
};

export const updateBillingTeamMemberRole = async (billingId: string, userId: string, role: BillingTeamRoles) => {
  if (!billingId || !userId || !role) {
    return null;
  }

  const updateUserRole = httpsCallable<{ billingId: string; userId: string; role: BillingTeamRoles }>(
    getFunctions(),
    "billing-updateUserRole"
  );

  return updateUserRole({ billingId, userId, role });
};

export const fetchBillingIdByOwner = async (ownerId: string, uid: string) => {
  if (!ownerId || !uid)
    return {
      billingId: null,
      mappedWorkspaces: [],
    };

  const billingQuery = query(collection(getFirestore(firebaseApp), "billing"), where("owner", "==", ownerId));

  const snapshot = await getDocs(billingQuery);

  if (snapshot.empty) {
    return {
      billingId: null,
      mappedWorkspaces: [],
    };
  }

  const billingId = snapshot.docs[0].id;
  return { billingId, mappedWorkspaces: snapshot.docs[0].data().billedWorkspaces };
};

export const toggleWorkspaceMappingInBillingTeam = async (
  billingId: string,
  workspaceId: string,
  toBeMapped: boolean
) => {
  if (!billingId || !workspaceId) {
    return;
  }

  const billingRef = doc(getFirestore(firebaseApp), "billing", billingId);

  await updateDoc(billingRef, {
    billedWorkspaces: toBeMapped ? arrayUnion(workspaceId) : arrayRemove(workspaceId),
  }).catch((err) => {
    throw new Error(err.message);
  });
};

export const getBillingTeamRedirectURL = async (ownerId: string): Promise<string | null> => {
  const db = getFirestore(firebaseApp);
  const billingTeamsQuery = query(collection(db, "billing"), where(`owner`, "==", ownerId));
  const billingTeamsSnapshot = await getDocs(billingTeamsQuery);

  const billingTeams = billingTeamsSnapshot.docs.map((doc) => {
    return { data: doc?.data() as BillingTeamDetails, id: doc?.id };
  });

  if (billingTeams.length === 0) {
    return null;
  }

  if (billingTeams.length === 1) {
    return `${PATHS.SETTINGS.BILLING.RELATIVE}/${billingTeams[0].id}`;
  } else {
    const sortedTeams = billingTeams.sort(
      (a: any, b: any) =>
        b.data.subscriptionDetails?.subscriptionCreated - a.data.subscriptionDetails?.subscriptionCreated
    );
    return `${PATHS.SETTINGS.BILLING.RELATIVE}/${sortedTeams[0].id}`;
  }
};

export const fetchBillingInformation = async (billingId: string) => {
  const billingInfo = httpsCallable<{ billingId: string }>(getFunctions(), "billing-getBillingInfo");
  return billingInfo({ billingId }).then((res) => {
    if (!res.data) {
      return null;
    }
    return res.data;
  });
};

export const revokeBillingTeamInvite = async (inviteId: string, email: string) => {
  if (!inviteId || !email) {
    return null;
  }
  const revokeInvite = httpsCallable(getFunctions(), "billing-revokeBillingTeamInvite");
  return revokeInvite({ inviteId, userEmail: email });
};

export const inviteUsersToBillingTeam = async (billingId: string, userEmails: string[]) => {
  if (!billingId || !userEmails) {
    return null;
  }

  const inviteUsers = httpsCallable(getFunctions(), "billing-createBillingTeamInvites");

  return inviteUsers({ userEmails, billingId });
};

interface CancellationParams {
  billingId?: string;
  currentPlan: string;
  reason?: string;
}
export const cancelSubscription = ({ billingId, currentPlan, reason }: CancellationParams) => {
  const cancelSubscription = httpsCallable<
    CancellationParams,
    {
      success: boolean;
      message: string;
    }
  >(getFunctions(), "subscription-cancelSubscription");

  return cancelSubscription({
    reason,
    currentPlan,
    billingId,
  });
};
