import { IncentivizeEvent, Milestones, UserMilestoneAndRewardDetails } from "../types";

export const getTotalCredits = (milestones: Milestones) => {
  const total = Object.values(milestones ?? {}).reduce(
    (result, milestone) => result + (milestone.reward.value as number),
    0
  );

  return total;
};

export const isTaskCompleted = (
  event: IncentivizeEvent,
  userMilestoneAndRewardDetails: UserMilestoneAndRewardDetails
) => {
  return userMilestoneAndRewardDetails?.claimedMilestoneLogs?.includes(event);
};
