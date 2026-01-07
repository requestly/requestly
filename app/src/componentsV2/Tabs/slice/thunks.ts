import { createAsyncThunk } from "@reduxjs/toolkit";
import { tabsActions, tabsAdapter } from "./slice";
import { TabId, ActiveWorkflow, TabState } from "./types";
import { RootState } from "store/types";
import { ReducerKeys } from "store/constants";
import { reduxStore } from "store";

const SLICE_NAME = ReducerKeys.TABS;

function cleanupTabActiveWorkflows(tab: TabState) {
  tab.activeWorkflows.forEach((w) => {
    w.workflow.abort();
    reduxStore.dispatch(tabsActions.removeActiveWorkflow({ tabId: tab.id, workflow: w }));
  });
}

function cleanupTabSecondaryBuffers(tab: TabState) {
  reduxStore.dispatch(tabsActions.clearSecondaryBuffers({ tabId: tab.id }));
}

export const closeTab = createAsyncThunk<
  { tab: TabState } | void,
  { tabId: TabId; skipUnsavedPrompt?: boolean },
  { state: RootState }
>(`${SLICE_NAME}/closeTab`, async ({ tabId, skipUnsavedPrompt }, { dispatch, getState, rejectWithValue }) => {
  const state = getState();
  const tab = tabsAdapter.getSelectors().selectById(state.tabs.tabs, tabId);

  if (!tab) {
    return;
  }

  if (!skipUnsavedPrompt && tab.activeWorkflows.size > 0) {
    const firstWorkflow = tab.activeWorkflows.values().next().value as ActiveWorkflow;
    if (firstWorkflow) {
      const canClose = window.confirm(firstWorkflow.cancelWarning || "Close this tab?");
      if (!canClose) {
        return rejectWithValue("User cancelled tab close due to active workflow");
      }

      cleanupTabActiveWorkflows(tab);
    }
  }

  // Clear secondary buffers before closing
  cleanupTabSecondaryBuffers(tab);

  dispatch(tabsActions.closeTab(tabId));
  return { tab };
});

export const closeTabByEntityId = createAsyncThunk<
  { tab: TabState } | void,
  { entityId: string; skipUnsavedPrompt?: boolean },
  { state: RootState }
>(`${SLICE_NAME}/closeTabByEntityId`, async ({ entityId, skipUnsavedPrompt }, { dispatch, getState }) => {
  const state = getState();
  const allTabs = tabsAdapter.getSelectors().selectAll(state.tabs.tabs);

  const tab = allTabs.find((t) => t.source.getSourceId() === entityId);

  if (!tab) {
    return;
  }

  return dispatch(closeTab({ tabId: tab.id })).unwrap();
});

export const closeAllTabs = createAsyncThunk<
  { tabs: TabState[] } | void,
  { skipUnsavedPrompt?: boolean },
  { state: RootState }
>(`${SLICE_NAME}/closeAllTabs`, async ({ skipUnsavedPrompt }, { dispatch, getState, rejectWithValue }) => {
  const state = getState();
  const allTabs = tabsAdapter.getSelectors().selectAll(state.tabs.tabs);

  // Check for any active workflows
  if (!skipUnsavedPrompt) {
    const tabsWithWorkflows = allTabs.filter((tab) => tab.activeWorkflows.size > 0);
    if (tabsWithWorkflows.length > 0) {
      const firstWorkflow = tabsWithWorkflows[0]?.activeWorkflows.values().next().value as ActiveWorkflow;
      if (firstWorkflow) {
        const canClose = window.confirm(
          firstWorkflow.cancelWarning || "Close all tabs? Some operations are still running."
        );

        if (!canClose) {
          return rejectWithValue("User cancelled close all tabs due to active workflow");
        }

        tabsWithWorkflows.forEach((tab) => cleanupTabActiveWorkflows(tab));
      }
    }
  }

  dispatch(tabsActions.resetTabs());
  return { tabs: allTabs };
});
