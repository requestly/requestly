import { createSlice } from "@reduxjs/toolkit";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import { ReducerKeys } from "store/constants";

const initialState = {
  availableBillingTeams: [] as BillingTeamDetails[],
};

const slice = createSlice({
  name: ReducerKeys.BILLING,
  initialState,
  reducers: {
    resetState: () => initialState,
    setAvailableBillingTeams: (state, action) => {
      state.availableBillingTeams = action.payload;
    },
  },
});

export const { actions: billingActions, reducer: billingReducer } = slice;
