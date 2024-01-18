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
import { BillingTeamRoles } from "features/settings/components/BillingTeam/types";

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

  const billingQuery = query(
    collection(getFirestore(firebaseApp), "billing"),
    where("owner", "==", ownerId),
    where(`members.${uid}`, "!=", null)
  );
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
