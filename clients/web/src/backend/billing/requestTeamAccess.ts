import { getFunctions, httpsCallable } from "firebase/functions";

export const requestBillingTeamAccess = async (billingId: string) => {
  const sendRequest = httpsCallable<{ billingId: string }, null>(
    getFunctions(),
    "premiumNotifications-requestEnterprisePlanFromAdmin"
  );
  return sendRequest({ billingId });
};
