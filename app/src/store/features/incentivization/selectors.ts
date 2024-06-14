import { IncentivizeEvent, Milestones, UserMilestoneAndRewardDetails } from "features/incentivization/types";
import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";

export const getIncentivizationMilestones = (state: RootState): Milestones => {
  return state[ReducerKeys.INCENTIVIZATION].milestones;
};

export const getUserIncentivizationDetails = (state: RootState): UserMilestoneAndRewardDetails => {
  return state[ReducerKeys.INCENTIVIZATION].userMilestoneAndRewardDetails;
};

export const getIsIncentivizationDetailsLoading = (state: RootState): boolean => {
  return state[ReducerKeys.INCENTIVIZATION].isIncentivizationDetailsLoading;
};

export const getLocalIncentivizationEventsState = (state: RootState): IncentivizeEvent[] => {
  return state[ReducerKeys.INCENTIVIZATION].localIncentivizationEventsState;
};
