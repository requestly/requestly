import { createSlice } from "@reduxjs/toolkit";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";
import { addTab, resetState, setActiveTab, setTabs, updateTab } from "./case-reducers";
import { initialState } from "./initialState";

const slice = createSlice({
  name: ReducerKeys.TABS_LAYOUT,
  initialState,
  reducers: {
    resetState,
    addTab,
    updateTab,
    setActiveTab,
    setTabs,
  },
});

const { actions, reducer } = slice;
export const tabsLayoutActions = actions;
export const tabsLayoutReducerWithLocalSync = getReducerWithLocalStorageSync(ReducerKeys.TABS_LAYOUT, reducer, [
  "apiClient",
]);
