import { autoBatchEnhancer, configureStore } from "@reduxjs/toolkit";

//FEATURES
import { sessionRecordingReducer } from "./features/session-recording/slice";

import { ReducerKeys } from "./constants";
import { desktopTrafficTableReducerWithLocalSync } from "./features/desktop-traffic-table/slice";
import { recordsReducer } from "./features/rules/slice";
import { billingReducer } from "./features/billing/slice";
import { harPreviewReducer } from "./features/network-sessions/slice";
import { workspaceReducerWithLocal } from "./slices/workspaces/slice";
import { variablesReducer } from "./features/variables/slice";

import { globalReducers } from "./slices/global/slice";
import { workspaceViewReducerWithLocal } from "features/apiClient/slices";
import { runtimeVariablesReducerWithPersist } from "features/apiClient/slices/runtimeVariables";
import { tabsReducerWithPersist, tabBufferMiddleware } from "componentsV2/Tabs/slice";
import { exampleCollectionsReducerWithPersist } from "features/apiClient/slices/exampleCollections";

export const reduxStore = configureStore({
  reducer: {
    [ReducerKeys.GLOBAL]: globalReducers,
    [ReducerKeys.SESSION_RECORDING]: sessionRecordingReducer,
    [ReducerKeys.HAR_PREVIEW]: harPreviewReducer,
    [ReducerKeys.DESKTOP_TRAFFIC_TABLE]: desktopTrafficTableReducerWithLocalSync,
    [ReducerKeys.RULES]: recordsReducer, // SLICE ALSO CONTAINS GROUP RECORDS
    [ReducerKeys.BILLING]: billingReducer,
    [ReducerKeys.WORKSPACE]: workspaceReducerWithLocal,
    [ReducerKeys.VARIABLES]: variablesReducer,
    [ReducerKeys.WORKSPACE_VIEW]: workspaceViewReducerWithLocal,
    [ReducerKeys.TABS]: tabsReducerWithPersist,
    [ReducerKeys.RUNTIME_VARIABLES]: runtimeVariablesReducerWithPersist,
    [ReducerKeys.EXAMPLE_COLLECTIONS]: exampleCollectionsReducerWithPersist,
  },
  middleware: (getDefaultMiddleware) => {
    // In development mode redux-toolkit will
    // check for non-serializable values in actions,
    // in our case we have functions in payload,
    // so avoiding this check.
    const middlewares = getDefaultMiddleware({ serializableCheck: false });
    return middlewares.concat(tabBufferMiddleware);
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
