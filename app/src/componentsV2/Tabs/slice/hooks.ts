import { useDispatch, useSelector } from "react-redux";
import { tabsActions, tabsAdapter } from "./slice";
import { TabId, TabState } from "./types";
import { RootState } from "store/types";
import { NativeError } from "errors/NativeError";
import { openBufferedTab as _openBufferedTab } from "./actions";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  closeTab as _closeTab,
  closeAllTabs as _closeAllTabs,
  closeTabByEntityId as _closeTabByEntityId,
} from "./thunks";
import { BufferEntry, EntityNotFound, getApiClientFeatureContext } from "features/apiClient/slices";
import { BufferedEntityFactory } from "features/apiClient/slices/entities";

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

export function useIsActiveTab(tabId: TabId): boolean {
  return useSelector((state: RootState) => state.tabs.activeTabId === tabId);
}

export function useActiveTabId() {
  return useSelector((state: RootState) => state.tabs.activeTabId);
}

export function usePreviewTabId() {
  return useSelector((state: RootState) => state.tabs.previewTabId);
}

export function useTabActions() {
  const dispatch = useDispatch();

  const actions = useMemo(() => {
    return {
      openBufferedTab(params: Parameters<typeof _openBufferedTab>[0]) {
        return dispatch(_openBufferedTab(params));
      },

      closeTab(params: Parameters<typeof _closeTab>[0]) {
        return dispatch(_closeTab(params) as any);
      },

      closeAllTabs(params: Parameters<typeof _closeAllTabs>[0]) {
        return dispatch(_closeAllTabs(params) as any);
      },

      closeTabByEntityId(params: Parameters<typeof _closeTabByEntityId>[0]) {
        return dispatch(_closeTabByEntityId(params) as any);
      },

      setActiveTab(params: Parameters<typeof tabsActions.setActiveTab>[0]) {
        return dispatch(tabsActions.setActiveTab(params));
      },

      setPreviewTab(params: Parameters<typeof tabsActions.setPreviewTab>[0]) {
        return dispatch(tabsActions.setPreviewTab(params));
      },
    };
  }, [dispatch]);

  return actions;
}

export type BufferModeTab = TabState & { modeConfig: { mode: "buffer" } };

export function getTabBufferedEntity(tab: BufferModeTab) {
  const workspaceId = tab.source.metadata.context.id;
  const bufferId = tab.modeConfig.entityId;
  const { store } = getApiClientFeatureContext(workspaceId);

  const buffer = store.getState().buffer.entities[bufferId];

  if (!buffer) {
    throw new EntityNotFound(bufferId, "buffer");
  }

  const entity = BufferedEntityFactory.from(
    {
      id: buffer.id,
      type: buffer.entityType,
    },
    store.dispatch
  );

  return {
    store,
    entity,
    buffer,
  };
}

export function useTabBuffer<T>(
  tab: BufferModeTab,
  selector: (params: {
    entity: ReturnType<typeof getTabBufferedEntity>["entity"];
    buffer: BufferEntry;
    state: ReturnType<ReturnType<typeof getApiClientFeatureContext>["store"]["getState"]>;
  }) => T
): T {
  const workspaceId = tab.source.metadata.context.id;
  const { store } = getApiClientFeatureContext(workspaceId);

  const getSnapshot = useCallback(() => {
    const { entity, buffer } = getTabBufferedEntity(tab);

    return selector({
      entity,
      buffer,
      state: store.getState(),
    });
  }, [selector, store, tab]);

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

export function useIsTabDirty(tab: BufferModeTab) {
  return useTabBuffer(tab, ({ buffer }) => buffer.isDirty);
}

export function useTabTitle(tab: BufferModeTab) {
  return useTabBuffer(tab, ({ entity, state }) => entity.getName(state));
}

export function useHasAnyUnsavedChanges(): boolean {
  const tabs = useTabs();

  const hasUnsaved = tabs.some((tab) => {
    if (tab.modeConfig.mode !== "buffer") {
      return false;
    }

    try {
      const workspaceId = tab.source.metadata.context?.id;
      const { store } = getApiClientFeatureContext(workspaceId);
      const buffer = store.getState().buffer.entities[tab.modeConfig.entityId];

      return buffer?.isDirty;
    } catch {
      return false;
    }
  });

  return hasUnsaved;
}
