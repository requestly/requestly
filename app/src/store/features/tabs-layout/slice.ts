import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TabsLayout } from "layouts/TabsLayout";
import { Feature } from "layouts/TabsLayout/contexts/tabsLayoutContext";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

export type TabsLayoutState = Record<
  Feature,
  {
    tabs: TabsLayout.Tab[];
    activeTab: TabsLayout.Tab | null;
  }
>;

const initialState: TabsLayoutState = {
  [Feature.API_CLIENT]: {
    activeTab: null,
    tabs: [],
  },
};

const slice = createSlice({
  name: ReducerKeys.TABS_LAYOUT,
  initialState,
  reducers: {
    resetState: () => initialState,
    addTab: (state, action: PayloadAction<{ feature: Feature; tab: TabsLayout.Tab }>) => {
      const { feature, tab } = action.payload;
      state[feature].tabs.push(tab);
    },
    removeTab: (state, action: PayloadAction<{ feature: Feature; tabId: TabsLayout.Tab["id"] }>) => {
      const { feature, tabId } = action.payload;
      state[feature].tabs = state[feature].tabs.filter((tab) => tab.id !== tabId);
    },
    updateTabs: (state, action: PayloadAction<{ feature: Feature; tabs: TabsLayout.Tab[] }>) => {
      const { feature, tabs } = action.payload;
      state[feature].tabs = tabs;
    },
    setActiveTab: (state, action: PayloadAction<{ feature: Feature; tab: TabsLayout.Tab }>) => {
      const { feature, tab } = action.payload;
      state[feature].activeTab = tab;
    },
  },
});

export const { actions, reducer } = slice;

export const tabsLayoutActions = actions;
export const tabsLayoutReducerWithLocalSync = getReducerWithLocalStorageSync(ReducerKeys.TABS_LAYOUT, reducer, [
  `${Feature.API_CLIENT}`,
]);
