import { createAsyncThunk } from "@reduxjs/toolkit";
import { tabsActions, tabsAdapter } from "./slice";
import { TabId, ActiveWorkflow, TabState } from "./types";
import { RootState } from "store/types";
import { ReducerKeys } from "store/constants";
import { reduxStore } from "store";
import { getIsTabDirty } from "./utils";
import { HistoryViewTabSource } from "features/apiClient/screens/apiClient/components/views/components/request/HistoryView/historyViewTabSource";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { RQAPI } from "features/apiClient/types";
import { bufferActions, getApiClientFeatureContext } from "features/apiClient/slices";
import { findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";

const SLICE_NAME = ReducerKeys.TABS;

function cleanupTabActiveWorkflows(tab: TabState) {
  tab.activeWorkflows.forEach((w) => {
    w.workflow.abort();
    reduxStore.dispatch(tabsActions.removeActiveWorkflow({ tabId: tab.id, workflow: w }));
  });
}

function checkTabUnsavedChanges(tab: TabState): boolean {
  const hasUnsavedChanges = getIsTabDirty(tab);
  if (hasUnsavedChanges) {
    const canClose = window.confirm("Discard changes? Changes you made will not be saved.");
    return canClose;
  }
  return true;
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

  if (!skipUnsavedPrompt) {
    const canClose = checkTabUnsavedChanges(tab);
    if (!canClose) {
      return rejectWithValue("User cancelled tab close due to unsaved changes");
    }

    if (tab.activeWorkflows.size > 0) {
      const firstWorkflow = tab.activeWorkflows.values().next().value as ActiveWorkflow;
      if (firstWorkflow) {
        const canClose = window.confirm(firstWorkflow.cancelWarning || "Close this tab?");
        if (!canClose) {
          return rejectWithValue("User cancelled tab close due to active workflow");
        }

        cleanupTabActiveWorkflows(tab);
      }
    }
  }

  dispatch(tabsActions.closeTab(tabId));
  return { tab };
});

export const closeTabByEntityId = createAsyncThunk<
  { tab: TabState } | void,
  { entityId: string; skipUnsavedPrompt?: boolean },
  { state: RootState }
>(
  `${SLICE_NAME}/closeTabByEntityId`,
  async ({ entityId, skipUnsavedPrompt }, { dispatch, getState, rejectWithValue }) => {
    const state = getState();
    const allTabs = tabsAdapter.getSelectors().selectAll(state.tabs.tabs);

    const tab = allTabs.find((t) => t.source.getSourceId() === entityId);

    if (!tab) {
      return;
    }

    if (!skipUnsavedPrompt) {
      const canClose = checkTabUnsavedChanges(tab);
      if (!canClose) {
        return rejectWithValue("User cancelled tab close due to unsaved changes");
      }
    }

    return dispatch(closeTab({ tabId: tab.id, skipUnsavedPrompt: true })).unwrap();
  }
);

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

export const openOrSwitchHistoryTab = createAsyncThunk<
  void,
  { workspaceId?: string; record?: RQAPI.ApiRecord },
  { state: RootState }
>(`${SLICE_NAME}/openOrSwitchHistoryTab`, async ({ workspaceId, record }, { dispatch, getState, rejectWithValue }) => {
  const state = getState();
  const allTabs = tabsAdapter.getSelectors().selectAll(state.tabs.tabs);

  const historyTab = allTabs.find((t) => t.source.getSourceId() === "history" && t.source.getSourceName() === "history");

  const targetWorkspaceId = workspaceId ?? getApiClientFeatureContext().workspaceId;
  const targetEntryType = record?.data?.type ?? RQAPI.ApiEntryType.HTTP;
  const isSingleWorkspaceMode = Boolean(record);
  const targetEntityType =
    targetEntryType === RQAPI.ApiEntryType.GRAPHQL ? ApiClientEntityType.GRAPHQL_RECORD : ApiClientEntityType.HTTP_RECORD;

  const referenceId = `history:${targetWorkspaceId}:${targetEntryType}`;
  const source = new HistoryViewTabSource({
    context: {
      id: targetWorkspaceId,
    },
  });

  // Direct navigation: open/focus History tab without creating buffers.
  if (!record) {
    if (!historyTab) {
      dispatch(
        tabsActions.openTab({
          source,
          modeConfig: { mode: "entity", entityId: "history" },
          preview: false,
        })
      );
      return;
    }

    dispatch(
      tabsActions.updateTab({
        tabId: historyTab.id,
        source,
        modeConfig: { mode: "entity", entityId: "history" },
      })
    );
    dispatch(tabsActions.setActiveTab(historyTab.id));
    return;
  }

  const data = record;

  const targetContext = getApiClientFeatureContext(targetWorkspaceId);
  const targetStore = targetContext.store;
  const targetStoreState = targetStore.getState();

  const existingTargetBuffer = findBufferByReferenceId(targetStoreState.buffer.entities, referenceId);
  const targetBufferId = (() => {
    if (existingTargetBuffer) {
      return existingTargetBuffer.id;
    }
    const openAction = targetStore.dispatch(
      bufferActions.open({
        entityType: targetEntityType,
        isNew: false,
        referenceId,
        data,
      })
    );
    return (openAction as any).meta.id as string;
  })();

  // When switching/overwriting due to a new history selection, confirm discarding any unsaved changes.
  const shouldPrompt = isSingleWorkspaceMode;
  if (shouldPrompt) {
    const currentBufferIsDirty = (() => {
      if (!historyTab || historyTab.modeConfig.mode !== "buffer") {
        return false;
      }
      const currentWorkspaceId = historyTab.source.metadata.context?.id;
      if (currentWorkspaceId === undefined) {
        return false;
      }
      const currentStore = getApiClientFeatureContext(currentWorkspaceId).store;
      const currentBuffer = currentStore.getState().buffer.entities[historyTab.modeConfig.entityId];
      return currentBuffer?.isDirty ?? false;
    })();

    const targetBufferIsDirty = existingTargetBuffer?.isDirty ?? false;

    if (currentBufferIsDirty || targetBufferIsDirty) {
      const canDiscard = window.confirm("Discard changes? Changes you made will not be saved.");
      if (!canDiscard) {
        return rejectWithValue("User cancelled history selection due to unsaved changes");
      }
    }
  }

  if (!historyTab) {
    dispatch(
      tabsActions.openTab({
        source,
        modeConfig: { mode: "buffer", entityId: targetBufferId },
        preview: false,
      })
    );
  } else {
    dispatch(
      tabsActions.updateTab({
        tabId: historyTab.id,
        source,
        modeConfig: { mode: "buffer", entityId: targetBufferId },
      })
    );
    dispatch(tabsActions.setActiveTab(historyTab.id));
  }

  if (record) {
    // Only required when we are reusing an existing stable buffer. For a newly created buffer, `open` already seeded it.
    if (existingTargetBuffer) {
      targetStore.dispatch(bufferActions.revertChanges({ referenceId, sourceData: data }));
    }
  }
});
