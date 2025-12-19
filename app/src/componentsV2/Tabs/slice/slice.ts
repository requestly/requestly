import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TabState, TabServiceState, TabId, ActiveWorkflow } from "./types";
import { TabSource } from "../types";
import { ReducerKeys } from "store/constants";

export const tabsAdapter = createEntityAdapter<TabState>({
  selectId: (tab) => tab.id,
});

const initialState: TabServiceState = {
  tabs: tabsAdapter.getInitialState(),
  activeTabId: undefined,
  previewTabId: undefined,
};

export const tabsSlice = createSlice({
  name: ReducerKeys.TABS,
  initialState,
  reducers: {
    addTab(state, action: PayloadAction<TabState>) {
      tabsAdapter.addOne(state.tabs, action.payload);
      if (!state.activeTabId) {
        state.activeTabId = action.payload.id;
      }
    },

    removeTab(state, action: PayloadAction<TabId>) {
      const tabId = action.payload;
      const tabsArray = tabsAdapter.getSelectors().selectAll(state.tabs);
      const currentIndex = tabsArray.findIndex((t) => t.id === tabId);

      tabsAdapter.removeOne(state.tabs, tabId);

      if (state.previewTabId === tabId) {
        state.previewTabId = undefined;
      }

      if (state.activeTabId === tabId) {
        const remainingTabs = tabsAdapter.getSelectors().selectAll(state.tabs);
        if (remainingTabs.length > 0) {
          if (currentIndex >= remainingTabs.length) {
            state.activeTabId = remainingTabs[remainingTabs.length - 1]?.id;
          } else {
            state.activeTabId = remainingTabs[currentIndex]?.id;
          }
        } else {
          state.activeTabId = undefined;
        }
      }
    },

    setActiveTab(state, action: PayloadAction<TabId>) {
      const tabId = action.payload;
      const tab = tabsAdapter.getSelectors().selectById(state.tabs, tabId);
      if (tab) {
        state.activeTabId = tabId;
      }
    },

    setPreviewTab(state, action: PayloadAction<TabId | undefined>) {
      state.previewTabId = action.payload;
    },

    addActiveWorkflow(state, action: PayloadAction<{ tabId: TabId; workflow: ActiveWorkflow }>) {
      const { tabId, workflow } = action.payload;
      const tab = tabsAdapter.getSelectors().selectById(state.tabs, tabId);
      if (tab) {
        tab.activeWorkflows.push(workflow);
        tabsAdapter.updateOne(state.tabs, {
          id: tabId,
          changes: { activeWorkflows: tab.activeWorkflows },
        });
      }
    },

    removeActiveWorkflow(state, action: PayloadAction<{ tabId: TabId; workflow: ActiveWorkflow }>) {
      const { tabId, workflow } = action.payload;
      const tab = tabsAdapter.getSelectors().selectById(state.tabs, tabId);
      if (tab) {
        const activeWorkflows = tab.activeWorkflows.filter((w) => w !== workflow);
        tabsAdapter.updateOne(state.tabs, {
          id: tabId,
          changes: { activeWorkflows },
        });
      }
    },

    updateTabModeConfig(
      state,
      action: PayloadAction<{
        tabId: TabId;
        modeConfig: TabState["modeConfig"];
      }>
    ) {
      const { tabId, modeConfig } = action.payload;
      tabsAdapter.updateOne(state.tabs, {
        id: tabId,
        changes: { modeConfig },
      });
    },

    updateTab(
      state,
      action: PayloadAction<{
        tabId: TabId;
        source: TabSource;
        modeConfig?: TabState["modeConfig"];
      }>
    ) {
      const { tabId, source, modeConfig } = action.payload;
      const tab = tabsAdapter.getSelectors().selectById(state.tabs, tabId);
      if (tab) {
        tabsAdapter.updateOne(state.tabs, {
          id: tabId,
          changes: {
            source,
            ...(modeConfig ?? {}),
          },
        });
      }
    },

    resetTabs(state) {
      state.tabs = tabsAdapter.getInitialState();
      state.activeTabId = undefined;
      state.previewTabId = undefined;
    },
  },
});

export const tabsActions = tabsSlice.actions;
export const tabsReducer = tabsSlice.reducer;
