import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";

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
