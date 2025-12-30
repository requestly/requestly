import { reduxStore } from "store";
import { BufferModeTab, getTabBufferedEntity } from "./hooks";
import { tabsSelectors } from "./selectors";

export function getAllTabs() {
  return tabsSelectors.selectAll(reduxStore.getState());
}

export function getHasAnyUnsavedChanges(): boolean {
  const tabs = getAllTabs();

  const hasUnsaved = tabs.some((tab) => {
    if (tab.modeConfig.mode !== "buffer") {
      return false;
    }

    const { buffer } = getTabBufferedEntity(tab as BufferModeTab);
    return buffer.isDirty;
  });

  return hasUnsaved;
}

export function getHasActiveWorkflows() {
  const tabs = getAllTabs();
  return tabs.some((t) => t.activeWorkflows.size > 0);
}
