import { getFunctions, httpsCallable } from "firebase/functions";
import { BillingTeamJoinRequestAction } from "features/settings/components/BillingTeam/components/BillingDetails/types";

export const reviewBillingTeamJoiningRequest = async (
  billingId: string,
  requestAction: BillingTeamJoinRequestAction,
  userId: string
) => {
  if (!billingId || !requestAction || !userId) {
    return {
      success: false,
      result: {
        status: "error",
        message: "Invalid request parameters",
      },
    };
  }

  const reviewRequest = httpsCallable(getFunctions(), "billing-reviewBillingTeamJoiningRequest");
  return reviewRequest({
    billingId,
    action: requestAction,
    userId,
  });
};
