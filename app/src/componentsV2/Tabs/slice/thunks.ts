import { createAsyncThunk } from "@reduxjs/toolkit";
import { tabsActions, tabsAdapter } from "./slice";
import { TabId, ActiveWorkflow, TabState } from "./types";
import { RootState } from "store/types";
import { selectTabBySource } from "./selectors";
import { ReducerKeys } from "store/constants";
import { reduxStore } from "store";

const SLICE_NAME = ReducerKeys.TABS;

function cleanupTabActiveWorkflows(tab: TabState) {
  tab.activeWorkflows.forEach((w) => {
    w.workflow.abort();
    reduxStore.dispatch(tabsActions.removeActiveWorkflow({ tabId: tab.id, workflow: w }));
  });
}

export const closeTab = createAsyncThunk<void, { tabId: TabId; skipUnsavedPrompt?: boolean }, { state: RootState }>(
  `${SLICE_NAME}/closeTab`,
  async ({ tabId, skipUnsavedPrompt }, { dispatch, getState }) => {
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
          return;
        }

        cleanupTabActiveWorkflows(tab);
      }
    }

    dispatch(tabsActions.closeTab(tabId));
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
    return dispatch(closeTab({ tabId: tab.id, skipUnsavedPrompt })).unwrap();
  }
});

export const closeAllTabs = createAsyncThunk<void, { skipUnsavedPrompt?: boolean }, { state: RootState }>(
  `${SLICE_NAME}/closeAllTabs`,
  async ({ skipUnsavedPrompt }, { dispatch, getState }) => {
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
            return;
          }

          tabsWithWorkflows.forEach((tab) => cleanupTabActiveWorkflows(tab));
        }
      }
    }

    dispatch(tabsActions.resetTabs());
  }
);
