import { reduxStore } from "store";
import { BufferModeTab, getTabBufferedEntity } from "./hooks";
import { tabsSelectors } from "./selectors";
import { getApiClientFeatureContext } from "features/apiClient/slices";

export function getAllTabs() {
  return tabsSelectors.selectAll(reduxStore.getState());
}

export function getHasAnyUnsavedChanges(): boolean {
  const tabs = getAllTabs();

  const hasUnsaved = tabs.some((tab) => {
    if (tab.modeConfig.mode !== "buffer") {
      return false;
    }

    // Check primary buffer
    const { buffer } = getTabBufferedEntity(tab as BufferModeTab);
    if (buffer.isDirty) {
      return true;
    }

    // Check secondary buffers
    if (tab.secondaryBufferIds.size > 0) {
      const workspaceId = tab.source.metadata.context.id;
      const { store } = getApiClientFeatureContext(workspaceId);
      const bufferState = store.getState().buffer;

      for (const bufferId of tab.secondaryBufferIds) {
        const secondaryBuffer = bufferState.entities[bufferId];
        if (secondaryBuffer?.isDirty) {
          return true;
        }
      }
    }

    return false;
  });

  return hasUnsaved;
}

export function getHasActiveWorkflows() {
  const tabs = getAllTabs();
  return tabs.some((t) => t.activeWorkflows.size > 0);
}
