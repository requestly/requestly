import { IncentivizeEvent, Milestones, UserMilestoneDetails } from "../types";

export const getTotalCredits = (milestones: Milestones) => {
  const total = Object.values(milestones ?? {}).reduce(
    (result, milestone) => result + (milestone.reward.value as number),
    0
  );

  return total;
};

export const isTaskCompleted = (event: IncentivizeEvent, userMilestoneDetails: UserMilestoneDetails) => {
  return userMilestoneDetails?.claimedMilestoneLogs?.includes(event);
};
