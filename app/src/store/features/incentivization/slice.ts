import { createSlice } from "@reduxjs/toolkit";
import { IncentivizeEvent, Milestones, UserMilestoneAndRewardDetails } from "features/incentivization/types";
import { ReducerKeys } from "store/constants";

const initialState = {
  milestones: {} as Milestones,
  userMilestoneAndRewardDetails: {} as UserMilestoneAndRewardDetails,
  isIncentivizationDetailsLoading: false,
  localIncentivizationEventsState: [] as IncentivizeEvent[],
};

const slice = createSlice({
  name: ReducerKeys.INCENTIVIZATION,
  initialState,
  reducers: {
    resetState: () => initialState,
    setMilestones: (state, action) => {
      const { milestones } = action.payload;
      state.milestones = milestones;
    },
    setUserMilestoneAndRewardDetails: (state, action) => {
      const { userMilestoneAndRewardDetails } = action.payload;
      state.userMilestoneAndRewardDetails = {
        ...state.userMilestoneAndRewardDetails,
        ...userMilestoneAndRewardDetails,
      };
    },
    setIsIncentivizationDetailsLoading: (state, action) => {
      const { isLoading } = action.payload;
      state.isIncentivizationDetailsLoading = isLoading;
    },
    setLocalIncentivizationEventsState: (state, action) => {
      const { type } = action.payload;

      if (!state.localIncentivizationEventsState.includes(type)) {
        state.localIncentivizationEventsState.push(type);
      }

      /**
       * - any event added in this should also update the userIncentivization details nodes
       */
    },
  },
});

export const { actions: incentivizationActions, reducer: incentivizationReducer } = slice;
