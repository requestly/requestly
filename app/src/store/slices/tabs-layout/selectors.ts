import { ReducerKeys } from "store/constants";
import { RootState } from "store/types";
import { TabsLayoutState } from "./reducers";

export const getTabsLayoutState = (state: RootState): TabsLayoutState => {
  return state[ReducerKeys.TABS_LAYOUT];
};

export const getTabs = (featureId: string) => {
  return (state: RootState): TabsLayoutState[string]["tabs"] => {
    return getTabsLayoutState(state)[featureId].tabs;
  };
};

export const getActiveTab = (featureId: string) => {
  return (state: RootState): TabsLayoutState[string]["activeTab"] => {
    return getTabsLayoutState(state)[featureId].activeTab;
  };
};
