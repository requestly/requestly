import { reduxStore } from "store";
import { BufferModeTab, getTabBufferedEntity } from "./hooks";
import { tabsSelectors } from "./selectors";
import { BufferEntry } from "features/apiClient/slices";

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

export function getHasAnyUnsavedChanges(): boolean {
  const tabs = getAllTabs();

  const hasUnsaved = tabs.some((tab) => {
    if (tab.modeConfig.mode !== "buffer") {
      return false;
    }

    const { primaryBuffer, secondaryBuffers } = getTabBufferedEntity(tab as BufferModeTab);
    return getIsBuffersDirty({ primaryBuffer, secondaryBuffers });
  });

  return hasUnsaved;
}

export function getHasActiveWorkflows() {
  const tabs = getAllTabs();
  return tabs.some((t) => t.activeWorkflows.size > 0);
}
