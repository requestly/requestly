import { createSlice } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";
import INITIAL_GLOBAL_SLICE_STATE from "./constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

// FIXME: Needs refractoring
import * as userActions from "../../features/userActions";
import * as appModeAndThemeActions from "../../features/appModeAndThemeActions";
import * as searchActions from "../../features/searchActions";
import * as sharedListActions from "../../features/sharedListActions";
import * as rulesActions from "../../features/rulesActions";
import * as appModeSpecificActions from "../../features/appModeSpecificActions";
import * as editorToastActions from "../../features/editorToastActions";
import * as requestBotActions from "../../features/requestBotActions";
import * as miscActions from "../../features/miscActions";

// Refractored
import modalsCaseReducers from "./modals/case-reducers";

const globalSlice = createSlice({
  name: ReducerKeys.GLOBAL,
  initialState: INITIAL_GLOBAL_SLICE_STATE,
  reducers: {
    ...modalsCaseReducers,

    // FIXME: These are actually case reducer functions
    ...userActions,
    ...appModeAndThemeActions,
    ...searchActions,
    ...sharedListActions,
    ...rulesActions,
    ...appModeSpecificActions,
    ...editorToastActions,
    ...requestBotActions,
    ...miscActions,
  },
});

const { actions, reducer } = globalSlice;

const globalReducersWithLocal = getReducerWithLocalStorageSync("root", reducer, [
  "user",
  "appMode",
  "appTheme",
  "isExtensionEnabled",
  "hasConnectedApp",
  "workspaceOnboarding",
  "appOnboarding",
  "onboarding",
  "userPersona",
  "country",
  "userPreferences",
  "userAttributes",
  "misc.persist",
  "rules.currentlySelectedRule.showDetailsPanel",
  "rules.isSampleRulesImported",
  "bottomSheetOrientation",
]);

export const globalActions = actions;
export const globalReducers = globalReducersWithLocal;
