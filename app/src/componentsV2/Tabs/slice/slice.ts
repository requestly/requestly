import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TabState, TabServiceState, TabId, ActiveWorkflow, TabModeConfig } from "./types";
import { TabSource } from "../types";
import { ReducerKeys } from "store/constants";
import { v4 as uuidv4 } from "uuid";
import { enableMapSet } from "immer";
import persistReducer from "redux-persist/es/persistReducer";
import { tabsPersistTransform } from "./persistTransform";
import storage from "redux-persist/lib/storage";

enableMapSet();

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
    closeTab(state, action: PayloadAction<TabId>) {
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
      const tab = state.tabs.entities[tabId];

      if (tab) {
        tab.activeWorkflows.add(workflow);
      }
    },

    removeActiveWorkflow(state, action: PayloadAction<{ tabId: TabId; workflow: ActiveWorkflow }>) {
      const { tabId, workflow } = action.payload;
      const tab = state.tabs.entities[tabId];

      if (tab) {
        tab.activeWorkflows.delete(workflow);
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
      action: PayloadAction<
        {
          tabId: TabId;
        } & Partial<{ source: TabSource; modeConfig: TabState["modeConfig"] }>
      >
    ) {
      const { tabId, ...changes } = action.payload;
      const tab = tabsAdapter.getSelectors().selectById(state.tabs, tabId);
      if (tab) {
        tabsAdapter.updateOne(state.tabs, {
          id: tabId,
          changes,
        });
      }
    },

    resetTabs(state) {
      state.tabs = tabsAdapter.getInitialState();
      state.activeTabId = undefined;
      state.previewTabId = undefined;
    },

    openTab(
      state,
      action: PayloadAction<{
        source: TabSource;
        modeConfig: TabModeConfig;
        preview?: boolean;
      }>
    ) {
      const { source, modeConfig, preview = true } = action.payload;
      const sourceId = source.getSourceId();
      const sourceName = source.getSourceName();

      const allTabs = tabsAdapter.getSelectors().selectAll(state.tabs);
      const existingTab = allTabs.find(
        (tab) => tab.source.getSourceId() === sourceId && tab.source.getSourceName() === sourceName
      );
      if (existingTab) {
        state.activeTabId = existingTab.id;
        return;
      }

      const tabId = uuidv4();
      const newTab: TabState = {
        id: tabId,
        source,
        modeConfig,
        activeWorkflows: new Set(),
      };

      if (preview) {
        if (!state.previewTabId) {
          tabsAdapter.addOne(state.tabs, newTab);
          state.activeTabId = tabId;
          state.previewTabId = tabId;
          return;
        }

        tabsSlice.reducer(
          state,
          tabsSlice.actions.updateTab({
            tabId: state.previewTabId,
            source: newTab.source,
            modeConfig: newTab.modeConfig,
          })
        );
        return;
      }

      tabsAdapter.addOne(state.tabs, newTab);
      state.activeTabId = tabId;
    },
  },
});

const tabsPersistConfig = {
  key: "rq_tabs_store",
  storage,
  throttle: 1000,
  transforms: [tabsPersistTransform],
};

export const tabsActions = tabsSlice.actions;
export const tabsReducerWithPersist = persistReducer<TabServiceState>(tabsPersistConfig, tabsSlice.reducer);
