import { UserIncentiveEvent } from "features/incentivization/types";
import { getFunctions, httpsCallable } from "firebase/functions";

export const claimIncentiveRewards = (event: UserIncentiveEvent) => {
  const claimRewards = httpsCallable<UserIncentiveEvent>(getFunctions(), "incentivization-claimIncentiveRewards");

  console.log("claimIncentiveRewards - event", event);
  return claimRewards(event);
};
