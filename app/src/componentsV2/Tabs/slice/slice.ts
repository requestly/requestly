import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TabState, TabServiceState, TabId, ActiveWorkflow, TabModeConfig } from "./types";
import { TabSource } from "../types";
import { ReducerKeys } from "store/constants";
import { v4 as uuidv4 } from "uuid";
import { enableMapSet } from "immer";
import persistReducer from "redux-persist/es/persistReducer";
import { tabsPersistTransform } from "./persistTransform";
import storage from "redux-persist/lib/storage";
import { EntityNotFound } from "features/apiClient/slices";

enableMapSet();

export const tabsAdapter = createEntityAdapter<TabState>({
  selectId: (tab) => tab.id,
});

const initialState: TabServiceState = {
  tabs: tabsAdapter.getInitialState(),
  activeTabId: undefined,
  previewTabId: undefined,
  singletonTabIdsBySourceType: {},
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

      // Cleanup singleton mapping
      Object.keys(state.singletonTabIdsBySourceType).forEach((sourceType) => {
        if (state.singletonTabIdsBySourceType[sourceType] === tabId) {
          delete state.singletonTabIdsBySourceType[sourceType];
        }
      });

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

      if (!tab) {
        throw new EntityNotFound(tabId, "Tab");
      }

      tab.activeWorkflows.add(workflow);
    },

    removeActiveWorkflow(state, action: PayloadAction<{ tabId: TabId; workflow: ActiveWorkflow }>) {
      const { tabId, workflow } = action.payload;
      const tab = state.tabs.entities[tabId];

      if (!tab) {
        return;
      }
      tab.activeWorkflows.delete(workflow);
    },

    registerSecondaryBuffer(state, action: PayloadAction<{ tabId: TabId; bufferId: string }>) {
      const { tabId, bufferId } = action.payload;
      const tab = state.tabs.entities[tabId];
      if (!tab) {
        throw new EntityNotFound(tabId, "Tab");
      }

      tab.secondaryBufferIds.add(bufferId);
    },

    unregisterSecondaryBuffer(state, action: PayloadAction<{ tabId: TabId; bufferId: string }>) {
      const { tabId, bufferId } = action.payload;
      const tab = state.tabs.entities[tabId];

      if (!tab) {
        return;
      }

      tab.secondaryBufferIds.delete(bufferId);
    },

    clearSecondaryBuffers(state, action: PayloadAction<{ tabId: TabId }>) {
      const { tabId } = action.payload;
      const tab = state.tabs.entities[tabId];

      if (!tab) {
        throw new EntityNotFound(tabId, "Tab");
      }
      tab.secondaryBufferIds.clear();
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
      state.singletonTabIdsBySourceType = {};
    },

    openTab(
      state,
      action: PayloadAction<{
        source: TabSource;
        modeConfig: TabModeConfig;
        preview?: boolean;
        singleton?: boolean;
      }>
    ) {
      const { source, modeConfig, preview = true, singleton } = action.payload;
      const sourceId = source.getSourceId();
      const sourceName = source.getSourceName();
      const sourceType = source.type;

      if (singleton) {
        const existingSingletonId = state.singletonTabIdsBySourceType[sourceType];
        if (existingSingletonId) {
          const existingSingletonTab = tabsAdapter.getSelectors().selectById(state.tabs, existingSingletonId);
          if (existingSingletonTab) {
            tabsAdapter.updateOne(state.tabs, {
              id: existingSingletonId,
              changes: { source, modeConfig },
            });
            state.activeTabId = existingSingletonId;
            state.previewTabId = undefined;
            return;
          }

          // Stale mapping, remove and fallthrough to create.
          delete state.singletonTabIdsBySourceType[sourceType];
        }

        const tabId = uuidv4();
        const newTab: TabState = {
          id: tabId,
          source,
          modeConfig,
          activeWorkflows: new Set(),
          secondaryBufferIds: new Set(),
          singleton: true,
        };
        tabsAdapter.addOne(state.tabs, newTab);
        state.singletonTabIdsBySourceType[sourceType] = tabId;
        state.activeTabId = tabId;
        state.previewTabId = undefined;
        return;
      }

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
        secondaryBufferIds: new Set(),
        singleton: false,
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
