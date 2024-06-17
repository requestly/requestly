import { IncentivizeEvent, Milestones, UserMilestoneAndRewardDetails } from "../types";

export const getTotalCredits = (milestones: Milestones) => {
  const total = Object.values(milestones ?? {}).reduce(
    (result, milestone) => result + (milestone.reward?.value as number),
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

export const checkIncentivesEligibility = (
  isUserLoggedIn: boolean,
  userAttributes: any,
  isFeatureFlagEnabled: boolean,
  completedTasks: IncentivizeEvent[]
): boolean => {
  const eligibilityDate = new Date("2024-06-17");
  const currentDate = new Date();

  if (currentDate < eligibilityDate) {
    return false;
  }

  if (isFeatureFlagEnabled) {
    if (!isUserLoggedIn) {
      return (
        completedTasks.length > 0 ||
        (userAttributes.install_date && new Date(userAttributes.install_date) > eligibilityDate)
      );
    } else {
      if (userAttributes.signup_date && new Date(userAttributes.signup_date) > eligibilityDate) {
        return !userAttributes.install_date || new Date(userAttributes.install_date) > eligibilityDate;
      }
    }
  }

  return false;
};
