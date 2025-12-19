import { createAsyncThunk } from "@reduxjs/toolkit";
import { tabsActions, tabsAdapter } from "./slice";
import { TabSource } from "../types";
import { TabState, TabId, TabModeConfig } from "./types";
import { RootState } from "store/types";
import { selectTabBySource } from "./selectors";
import { ReducerKeys } from "store/constants";
import { v4 as uuidv4 } from "uuid";

const SLICE_NAME = ReducerKeys.TABS;

export const openTab = createAsyncThunk<
  TabId,
  {
    source: TabSource;
    modeConfig: TabModeConfig;
    preview?: boolean;
  },
  { state: RootState }
>(`${SLICE_NAME}/openTab`, async ({ source, modeConfig, preview }, { dispatch, getState }) => {
  const state = getState();
  const sourceId = source.getSourceId();
  const sourceName = source.getSourceName();

  const existingTab = selectTabBySource(state, sourceId, sourceName);
  if (existingTab) {
    dispatch(tabsActions.setActiveTab(existingTab.id));
    if (preview) {
      dispatch(tabsActions.setPreviewTab(existingTab.id));
    }

    return existingTab.id;
  }

  const tabId = uuidv4();

  const newTab: TabState = {
    id: tabId,
    source,
    modeConfig,
    activeWorkflows: [],
  };

  dispatch(tabsActions.addTab(newTab));

  if (preview) {
    dispatch(tabsActions.setPreviewTab(tabId));
  }

  return tabId;
});

export const closeTab = createAsyncThunk<void, { tabId: TabId; skipUnsavedPrompt?: boolean }, { state: RootState }>(
  `${SLICE_NAME}/closeTab`,
  async ({ tabId, skipUnsavedPrompt }, { dispatch, getState }) => {
    const state = getState();
    const tab = tabsAdapter.getSelectors().selectById(state.tabs.tabs, tabId);

    if (!tab) {
      return;
    }

    if (!skipUnsavedPrompt && tab.activeWorkflows.length > 0) {
      const firstWorkflow = tab.activeWorkflows[0];
      if (firstWorkflow) {
        const canClose = window.confirm(firstWorkflow.cancelWarning || "Close this tab?");
        if (!canClose) {
          return;
        }

        // Abort all workflows
        tab.activeWorkflows.forEach((workflow) => workflow.workflow.abort());
      }
    }

    dispatch(tabsActions.removeTab(tabId));
  }
);

export const closeTabBySource = createAsyncThunk<
  void,
  { sourceId: string; sourceName: string; skipUnsavedPrompt?: boolean },
  { state: RootState }
>(`${SLICE_NAME}/closeTabBySource`, async ({ sourceId, sourceName, skipUnsavedPrompt }, { dispatch, getState }) => {
  const state = getState();
  const tab = selectTabBySource(state, sourceId, sourceName);
  if (tab) {
    dispatch(closeTab({ tabId: tab.id, skipUnsavedPrompt }));
  }
});

export const closeAllTabs = createAsyncThunk<void, { skipUnsavedPrompt?: boolean }, { state: RootState }>(
  `${SLICE_NAME}/closeAllTabs`,
  async ({ skipUnsavedPrompt }, { dispatch, getState }) => {
    const state = getState();
    const allTabs = tabsAdapter.getSelectors().selectAll(state.tabs.tabs);

    // Check for any active workflows
    if (!skipUnsavedPrompt) {
      const tabsWithWorkflows = allTabs.filter((tab) => tab.activeWorkflows.length > 0);
      if (tabsWithWorkflows.length > 0) {
        const firstWorkflow = tabsWithWorkflows[0]?.activeWorkflows[0];
        if (firstWorkflow) {
          const canClose = window.confirm(
            firstWorkflow.cancelWarning || "Close all tabs? Some operations are still running."
          );

          if (!canClose) {
            return;
          }

          tabsWithWorkflows.forEach((tab) => {
            tab.activeWorkflows.forEach((workflow) => workflow.workflow.abort());
          });
        }
      }
    }

    dispatch(tabsActions.resetTabs());
  }
);
