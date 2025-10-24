import { createSlice } from "@reduxjs/toolkit";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { ReducerKeys } from "store/constants";

const initialState = {
  availableBillingTeams: [] as BillingTeamDetails[],
  billingTeamMembers: {} as Record<string, any>,
  isBillingTeamsLoading: true,
};

const slice = createSlice({
  name: ReducerKeys.BILLING,
  initialState,
  reducers: {
    resetState: () => initialState,
    setAvailableBillingTeams: (state, action) => {
      state.availableBillingTeams = action.payload;
    },
    setBillingTeamMembers: (state, action) => {
      const { billingId, billingTeamMembers } = action.payload;
      state.billingTeamMembers[billingId] = billingTeamMembers;
    },
    setBillingTeamsLoading: (state, action) => {
      state.isBillingTeamsLoading = action.payload;
    },
  },
});

export const { actions: billingActions, reducer: billingReducer } = slice;
