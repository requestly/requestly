import { Milestones, UserMilestone } from "features/incentivization/types";
import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";

export const getIncentivizationMilestones = (state: RootState): Milestones => {
  return state[ReducerKeys.INCENTIVIZATION].milestones;
};

export const getIncentivizationUserMilestoneDetails = (state: RootState): UserMilestone => {
  return state[ReducerKeys.INCENTIVIZATION].userMilestoneDetails;
};

export const getIsIncentivizationDetailsLoading = (state: RootState): boolean => {
  return state[ReducerKeys.INCENTIVIZATION].isIncentivizationDetailsLoading;
};
