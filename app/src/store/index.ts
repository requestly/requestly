import { autoBatchEnhancer, configureStore } from "@reduxjs/toolkit";

//FEATURES
import { incentivizationReducer } from "./features/incentivization/slice";
import { sessionRecordingReducer } from "./features/session-recording/slice";
import { teamsReducer } from "./features/teams/slice";

import { ReducerKeys } from "./constants";
import { desktopTrafficTableReducer } from "./features/desktop-traffic-table/slice";
import { recordsReducer } from "./features/rules/slice";
import { billingReducer } from "./features/billing/slice";
import { harPreviewReducer } from "./features/network-sessions/slice";
import { environmentVariablesReducer } from "./features/environment/slice";

import { globalReducers } from "./slices/global/slice";

export const reduxStore = configureStore({
  reducer: {
    [ReducerKeys.GLOBAL]: globalReducers,
    [ReducerKeys.SESSION_RECORDING]: sessionRecordingReducer,
    [ReducerKeys.HAR_PREVIEW]: harPreviewReducer,
    [ReducerKeys.TEAMS]: teamsReducer,
    [ReducerKeys.DESKTOP_TRAFFIC_TABLE]: desktopTrafficTableReducer,
    [ReducerKeys.RULES]: recordsReducer, // SLICE ALSO CONTAINS GROUP RECORDS
    [ReducerKeys.BILLING]: billingReducer,
    [ReducerKeys.INCENTIVIZATION]: incentivizationReducer,
    [ReducerKeys.ENVIRONMENT]: environmentVariablesReducer,
  },
  middleware: (getDefaultMiddleware) => {
    // In development mode redux-toolkit will
    // check for non-serializable values in actions,
    // in our case we have functions in payload,
    // so avoiding this check.
    return getDefaultMiddleware({ serializableCheck: false });
  },
  enhancers: (existingEnhancers) => {
    // Add the autobatch enhancer to the store setup
    return existingEnhancers.concat(
      autoBatchEnhancer(
        { type: "timer", timeout: 100 }
        // Timer seems to be these amongst other for now. Lets keep on iterating on this to improve the table performance
        // {type: 'raf'}
        // {type: 'tick'}
        // {type: "callback", queueNotification: (notify) => { console.log('queuing'); setTimeout(() => { console.log("notifying");notify()}, 5000)}}
      )
    );
  },
});
