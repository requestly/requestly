import { getFunctions, httpsCallable } from "firebase/functions";
import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import Logger from "lib/logger";

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
