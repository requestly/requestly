import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { TabsLayoutState } from "./slice";
import { Feature } from "layouts/TabsLayout/contexts/tabsLayoutContext";

export const getTabsLayoutState = (state: RootState): TabsLayoutState => {
  return state[ReducerKeys.TABS_LAYOUT];
};

export const getTabs = (state: RootState, feature: Feature): TabsLayoutState[Feature]["tabs"] => {
  return getTabsLayoutState(state)[feature].tabs;
};

export const getActiveTab = (state: RootState, feature: Feature): TabsLayoutState[Feature]["activeTab"] => {
  return getTabsLayoutState(state)[feature].activeTab;
};
