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
import { apiClientContextRegistry } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/ApiClientContextRegistry";
import { BufferedEntityFactory } from "features/apiClient/slices/entities";
import { selectActiveTab, selectActiveTabId } from "./selectors";
import { getIsBuffersDirty } from "./utils";

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
  return useSelector(selectActiveTabId);
}

export function useActiveTab() {
  return useSelector(selectActiveTab);
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
  const bufferState = store.getState().buffer;

  const primaryBuffer = bufferState.entities[bufferId];

  if (!primaryBuffer) {
    throw new EntityNotFound(bufferId, "Primary buffer not found!");
  }

  const secondaryBuffers = Array.from(tab.secondaryBufferIds).map((id) => {
    const buffer = bufferState.entities[id];

    if (!buffer) {
      throw new EntityNotFound(id, "Secondary buffer not found").addContext({ tabId: tab.id, bufferId: id });
    }

    return buffer;
  });

  const entity = BufferedEntityFactory.from(
    {
      id: primaryBuffer.id,
      type: primaryBuffer.entityType,
    },
    store.dispatch
  );

  return {
    store,
    entity,
    primaryBuffer,
    secondaryBuffers,
  };
}

export function useTabBuffer<T>(
  tab: BufferModeTab,
  selector: (params: {
    entity: ReturnType<typeof getTabBufferedEntity>["entity"];
    primaryBuffer: BufferEntry;
    secondaryBuffers: BufferEntry[];
    state: ReturnType<ReturnType<typeof getApiClientFeatureContext>["store"]["getState"]>;
  }) => T
): T | null {
  const workspaceId = tab.source.metadata.context.id;
  const context = workspaceId != null ? apiClientContextRegistry.getContext(workspaceId) : undefined;
  const store = context?.store ?? null;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!store) return () => {};
      return store.subscribe(onStoreChange);
    },
    [store]
  );

  const getSnapshot = useCallback(() => {
    if (!store) return null;
    const { entity, primaryBuffer, secondaryBuffers } = getTabBufferedEntity(tab);

    return selector({
      entity,
      primaryBuffer,
      state: store.getState(),
      secondaryBuffers,
    });
  }, [selector, store, tab]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useIsTabDirty(tab: BufferModeTab) {
  return (
    useTabBuffer(tab, ({ primaryBuffer, secondaryBuffers }) => {
      return getIsBuffersDirty({ primaryBuffer, secondaryBuffers });
    }) ?? false
  );
}

export function useTabTitle(tab: BufferModeTab) {
  const title = useTabBuffer(tab, ({ entity, state }) => {
    if (tab.singleton) {
      return tab.source.getDefaultTitle();
    }
    return entity.getName(state);
  });

  return title ?? tab.source.getDefaultTitle();
}
