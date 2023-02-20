import { createSlice } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

const initialState = {
  availableTeams: null,
  currentlyActiveWorkspace: {
    id: null,
    name: null,
    membersCount: null,
  },
  currentlyActiveWorkspaceMembers: {},
};

const slice = createSlice({
  name: ReducerKeys.TEAMS,
  initialState,
  reducers: {
    resetState: () => initialState,
    setAvailableTeams: (state, action) => {
      state.availableTeams = action.payload;
    },
    setCurrentlyActiveWorkspace: (state, action) => {
      const payload = action.payload;
      if (payload.id !== undefined)
        state.currentlyActiveWorkspace.id = payload.id;
      if (payload.name !== undefined)
        state.currentlyActiveWorkspace.name = payload.name;
      if (payload.membersCount !== undefined)
        state.currentlyActiveWorkspace.membersCount = payload.membersCount;
    },
    setCurrentlyActiveWorkspaceMembers: (state, action) => {
      state.currentlyActiveWorkspaceMembers = action.payload;
    },
  },
});
const { actions: teamsRawActions, reducer: teamsRawReducer } = slice;

export const teamsReducer = getReducerWithLocalStorageSync(
  ReducerKeys.TEAMS,
  teamsRawReducer,
  ["availableTeams", "currentlyActiveWorkspace"],
  []
);
export const teamsActions = teamsRawActions;
