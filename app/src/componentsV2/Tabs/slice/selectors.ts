import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "store/types";
import { tabsAdapter } from "./slice";
import { EntityType } from "features/apiClient/slices/types";

const selectTabsSlice = (state: RootState) => state.tabs;

const tabsSelectors = tabsAdapter.getSelectors<RootState>((state) => state.tabs.tabs);

export const selectAllTabs = tabsSelectors.selectAll;
export const selectTabById = tabsSelectors.selectById;
export const selectTabsEntities = tabsSelectors.selectEntities;
export const selectTabIds = tabsSelectors.selectIds;
export const selectTotalTabs = tabsSelectors.selectTotal;

export const selectActiveTabId = createSelector(selectTabsSlice, (slice) => slice.activeTabId);

export const selectPreviewTabId = createSelector(selectTabsSlice, (slice) => slice.previewTabId);

export const selectActiveTab = createSelector([selectTabsSlice, selectActiveTabId], (slice, activeTabId) => {
  if (!activeTabId) {
    return;
  }

  return tabsAdapter.getSelectors().selectById(slice.tabs, activeTabId);
});

export const selectPreviewTab = createSelector([selectTabsSlice, selectPreviewTabId], (slice, previewTabId) => {
  if (!previewTabId) {
    return;
  }

  return tabsAdapter.getSelectors().selectById(slice.tabs, previewTabId);
});

export const selectTabBySource = createSelector(
  [selectAllTabs, (_state: RootState, sourceId: string, sourceName: string) => ({ sourceId, sourceName })],
  (tabs, { sourceId, sourceName }) => {
    return tabs.find((tab) => tab.source.getSourceId() === sourceId && tab.source.getSourceName() === sourceName);
  }
);

export const selectTabsByEntityType = createSelector(
  [selectAllTabs, (_state: RootState, entityType: EntityType) => entityType],
  (tabs, entityType) => {
    return tabs.filter((tab) => tab.modeConfig.entityType === entityType);
  }
);
