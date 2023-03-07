import { configureStore, createSlice } from "@reduxjs/toolkit";
import getReducerWithLocalStorageSync from "./getReducerWithLocalStorageSync";

//FEATURES
import * as userActions from "./features/userActions";
import * as appModeAndThemeActions from "./features/appModeAndThemeActions";
import * as searchActions from "./features/searchActions";
import * as modalActions from "./features/modalActions";
import * as sharedListActions from "./features/sharedListActions";
import * as rulesActions from "./features/rulesActions";
import * as marketplaceActions from "./features/marketplaceActions";
import * as appModeSpecificActions from "./features/appModeSpecificActions";
import { sessionRecordingReducer } from "./features/session-recording/slice";
import { teamsReducer } from "./features/teams/slice";

import INITIAL_STATE from "./initial-state";
import { ReducerKeys } from "./constants";
import { desktopLogsReducer } from "./features/desktop-network-logs/slice";

const globalSlice = createSlice({
  name: ReducerKeys.GLOBAL,
  initialState: INITIAL_STATE,
  reducers: {
    ...userActions,
    ...appModeAndThemeActions,
    ...searchActions,
    ...modalActions,
    ...sharedListActions,
    ...rulesActions,
    ...marketplaceActions,
    ...appModeSpecificActions,
  },
});

export const { actions } = globalSlice;

const globalReducer = getReducerWithLocalStorageSync(
  "root",
  globalSlice.reducer,
  [
    "user",
    "appMode",
    "appTheme",
    // "rules",
    // "desktopSpecificDetails.appsList",
    "country",
    "mobileDebugger",
    "initializations",
    "userPreferences",
  ]
);

export const reduxStore = configureStore({
  reducer: {
    [ReducerKeys.GLOBAL]: globalReducer,
    [ReducerKeys.SESSION_RECORDING]: sessionRecordingReducer,
    [ReducerKeys.TEAMS]: teamsReducer,
    [ReducerKeys.DESKTOP_TRAFFIC]: desktopLogsReducer,
  },
  middleware: (getDefaultMiddleware) => {
    // In development mode redux-toolkit will
    // check for non-serializable values in actions,
    // in our case we have functions in payload,
    // so avoiding this check.
    return getDefaultMiddleware({ serializableCheck: false });
  },
});
