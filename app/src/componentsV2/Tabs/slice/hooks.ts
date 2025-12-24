import { useSelector } from "react-redux";
import { tabsAdapter } from "./slice";
import { TabId, TabState } from "./types";
import { RootState } from "store/types";
import { selectTabsByEntityTypes } from "./selectors";
import { EntityType } from "features/apiClient/slices/types";
import { NativeError } from "errors/NativeError";

const tabsSelectors = tabsAdapter.getSelectors<RootState>((state) => state.tabs.tabs);

export function useTabs() {
  return useSelector(tabsSelectors.selectAll);
}

export function useTabById(id: TabId): TabState {
  const tab = useSelector((s: RootState) => tabsSelectors.selectById(s, id));

  if (!tab) {
    throw new NativeError("Tab not found!").addContext({ tabId: id });
  }

  return tab;
}

export function useTabsByEntityTypes(entityTypes: EntityType[]) {
  return useSelector((state: RootState) => selectTabsByEntityTypes(state, entityTypes));
}

export function useIsActiveTab(tabId: TabId): boolean {
  return useSelector((state: RootState) => state.tabs.activeTabId === tabId);
}
