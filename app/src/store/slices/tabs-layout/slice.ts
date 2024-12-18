import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TabsLayout } from "layouts/TabsLayout";
import { ReducerKeys } from "store/constants";
import getReducerWithLocalStorageSync from "store/getReducerWithLocalStorageSync";

export type TabsLayoutState = Record<
  string,
  {
    tabs: TabsLayout.Tab[];
    activeTab: TabsLayout.Tab | null;
  }
>;

const initialState: TabsLayoutState = {
  apiClient: {
    activeTab: null,
    tabs: [],
  },
};

const slice = createSlice({
  name: ReducerKeys.TABS_LAYOUT,
  initialState,
  reducers: {
    resetState: () => initialState,
    addTab: (state, action: PayloadAction<{ featureId: string; tab: TabsLayout.Tab }>) => {
      const { featureId, tab } = action.payload;
      state[featureId].tabs.push(tab);
    },
    updateTab: (
      state,
      action: PayloadAction<{ featureId: string; tabId: TabsLayout.Tab["id"]; updatedTabData: Partial<TabsLayout.Tab> }>
    ) => {
      const { featureId, tabId, updatedTabData } = action.payload;
      state[featureId].tabs = state[featureId].tabs.map((tab) =>
        tab.id === tabId ? { ...tab, ...updatedTabData } : tab
      );
    },
    setActiveTab: (state, action: PayloadAction<{ featureId: string; tab: TabsLayout.Tab }>) => {
      const { featureId, tab } = action.payload;
      state[featureId].activeTab = { ...(state[featureId].activeTab ?? {}), ...tab };
    },
    setTabs: (state, action: PayloadAction<{ featureId: string; tabs: TabsLayout.Tab[] }>) => {
      const { featureId, tabs } = action.payload;
      state[featureId].tabs = tabs;
    },
  },
});

export const { actions, reducer } = slice;

export const tabsLayoutActions = actions;
export const tabsLayoutReducerWithLocalSync = getReducerWithLocalStorageSync(ReducerKeys.TABS_LAYOUT, reducer, [
  "apiClient",
]);
