import { createSlice } from "@reduxjs/toolkit";
import { Milestones, UserMilestoneDetails } from "features/incentivization/types";
import { ReducerKeys } from "store/constants";

const initialState = {
  milestones: {} as Milestones,
  userMilestoneDetails: {} as UserMilestoneDetails,
  isIncentivizationDetailsLoading: false,
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
    setUserMilestoneDetails: (state, action) => {
      const { userMilestoneDetails } = action.payload;
      state.userMilestoneDetails = { ...state.userMilestoneDetails, ...userMilestoneDetails };
    },
    setIsIncentivizationDetailsLoading: (state, action) => {
      const { isLoading } = action.payload;
      state.isIncentivizationDetailsLoading = isLoading;
    },
  },
});

export const { actions: incentivizationActions, reducer: incentivizationReducer } = slice;
