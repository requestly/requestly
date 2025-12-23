import { useSelector } from "react-redux";
import { tabsAdapter } from "./slice";
import { TabId, TabState } from "./types";
import { RootState } from "store/types";
import { selectTabsByEntityTypes } from "./selectors";
import { EntityType } from "features/apiClient/slices/types";
import { NativeError } from "errors/NativeError";

const tabsSelectors = tabsAdapter.getSelectors<RootState>((state) => state.tabs.tabs);

export const useTabs = () => {
  return useSelector(tabsSelectors.selectAll);
};

export const useTabById = (id: TabId | undefined): TabState => {
  const tab = useSelector((state: RootState) => (id ? tabsSelectors.selectById(state, id) : undefined));

  if (!tab) {
    throw new NativeError("Tab not found!").addContext({ tabId: id });
  }

  return tab;
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
