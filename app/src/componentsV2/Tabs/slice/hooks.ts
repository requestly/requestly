import { useSelector } from "react-redux";
import { useSyncExternalStore, useCallback } from "react";
import { tabsAdapter } from "./slice";
import { TabId, TabModeConfig } from "./types";
import { RootState } from "store/types";
import { selectTabsByEntityTypes } from "./selectors";
import { EntityType } from "features/apiClient/slices/types";
import { findBufferByReferenceId } from "features/apiClient/slices/buffer/slice";
import { BUFFER_SLICE_NAME } from "features/apiClient/slices/common/constants";
import { Workspace } from "features/workspaces/types";
import { useApiClientStore } from "features/apiClient/slices";

const tabsSelectors = tabsAdapter.getSelectors<RootState>((state) => state.tabs.tabs);

export const useTabs = () => {
  return useSelector(tabsSelectors.selectAll);
};

export const useTabById = (id: TabId | undefined) => {
  return useSelector((state: RootState) => (id ? tabsSelectors.selectById(state, id) : undefined));
};

export const useActiveTab = () => {
  const activeTabId = useSelector((state: RootState) => state.tabs.activeTabId);
  return useTabById(activeTabId);
};

export const usePreviewTab = () => {
  const previewTabId = useSelector((state: RootState) => state.tabs.previewTabId);
  return useTabById(previewTabId);
};

export function useTabsByEntityTypes(entityTypes: EntityType[]) {
  return useSelector((state: RootState) => selectTabsByEntityTypes(state, entityTypes));
}

export function useTabBufferIsDirty(workspaceId: Workspace["id"], modeConfig: TabModeConfig): boolean {
  const store = useApiClientStore(workspaceId);

  const getSnapshot = useCallback(() => {
    if (!store || modeConfig.mode !== "buffer") {
      return false;
    }

    const bufferState = store.getState()[BUFFER_SLICE_NAME];
    const bufferEntry = findBufferByReferenceId(bufferState.entities, modeConfig.entityId);

    return bufferEntry?.isDirty ?? false;
  }, [modeConfig.entityId, modeConfig.mode, store]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}
