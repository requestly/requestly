import { reduxStore } from "store";
import { BufferModeTab, getTabBufferedEntity } from "./hooks";
import { tabsSelectors } from "./selectors";
import { BufferEntry } from "features/apiClient/slices";
import { apiClientContextRegistry } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/ApiClientContextRegistry";
import { TabState } from "./types";

function isBufferModeTab(tab: TabState): tab is BufferModeTab {
  return tab.modeConfig.mode === "buffer";
}

export function getAllTabs() {
  return tabsSelectors.selectAll(reduxStore.getState());
}

export function getIsBuffersDirty(params: { primaryBuffer: BufferEntry; secondaryBuffers: BufferEntry[] }): boolean {
  const { primaryBuffer, secondaryBuffers } = params;
  if (primaryBuffer.isDirty) {
    return true;
  }

  return secondaryBuffers.some((buffer) => buffer.isDirty);
}

export function getIsTabDirty(tab: TabState) {
  if (!isBufferModeTab(tab)) {
    return false;
  }

  const workspaceId = tab.source.metadata.context?.id;
  if (!workspaceId || !apiClientContextRegistry.hasContext(workspaceId)) {
    return false;
  }

  const { primaryBuffer, secondaryBuffers } = getTabBufferedEntity(tab);
  return getIsBuffersDirty({ primaryBuffer, secondaryBuffers });
}

export function getHasAnyUnsavedChanges(): boolean {
  const tabs = getAllTabs();
  return tabs.some((tab) => getIsTabDirty(tab));
}

export function getHasActiveWorkflows() {
  const tabs = getAllTabs();
  return tabs.some((t) => t.activeWorkflows.size > 0);
}
