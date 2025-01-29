import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { TabsLayout } from "layouts/TabsLayout";
import { initialState } from "./initialState";
import { TabsLayoutState } from "./types";

export const resetState = () => initialState;

export const addTab: CaseReducer<TabsLayoutState, PayloadAction<{ featureId: string; tab: TabsLayout.Tab }>> = (
  state,
  action
) => {
  const { featureId, tab } = action.payload;
  state[featureId].tabs.push(tab);
};

export const updateTab: CaseReducer<
  TabsLayoutState,
  PayloadAction<{ featureId: string; tabId: TabsLayout.Tab["id"]; updatedTabData: Partial<TabsLayout.Tab> }>
> = (state, action) => {
  const { featureId, tabId, updatedTabData } = action.payload;
  state[featureId].tabs = state[featureId].tabs.map((tab) => (tab.id === tabId ? { ...tab, ...updatedTabData } : tab));
};

export const setActiveTab: CaseReducer<TabsLayoutState, PayloadAction<{ featureId: string; tab: TabsLayout.Tab }>> = (
  state,
  action
) => {
  const { featureId, tab } = action.payload;
  state[featureId].activeTab = { ...(state[featureId].activeTab ?? {}), ...tab };
};

export const setTabs: CaseReducer<TabsLayoutState, PayloadAction<{ featureId: string; tabs: TabsLayout.Tab[] }>> = (
  state,
  action
) => {
  const { featureId, tabs } = action.payload;
  state[featureId].tabs = tabs;

  if (tabs.length === 0) {
    state[featureId].activeTab = null;
  }
};
