import { createSlice } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";

const initialState = {
  logs: [],
};

const slice = createSlice({
  name: ReducerKeys.DESKTOP_TRAFFIC,
  initialState: initialState,
  reducers: {
    resetState: () => initialState,
    addNetworkLog: (state, action) => {
      const log = action.payload.log;
      state.logs.push(log);
    },
  },
});

export const {
  actions: desktopLogsActions,
  reducer: desktopLogsReducer,
} = slice;
