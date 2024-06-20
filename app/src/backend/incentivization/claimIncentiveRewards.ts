import { UserIncentiveEvent, UserMilestoneAndRewardDetails } from "features/incentivization/types";
import { getFunctions, httpsCallable } from "firebase/functions";

export type ClaimIncentiveRewardsResponse =
  | { success: true; data: UserMilestoneAndRewardDetails }
  | { success: false; data: null };

export const claimIncentiveRewards = (event: UserIncentiveEvent) => {
  const claimRewards = httpsCallable<UserIncentiveEvent, ClaimIncentiveRewardsResponse>(
    getFunctions(),
    "incentivization-claimIncentiveRewards"
  );
  return claimRewards(event);
};
