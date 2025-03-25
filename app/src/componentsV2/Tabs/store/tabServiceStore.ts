import { create, StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { createTabStore, TabState } from "./tabStore";
import { AbstractTabSource } from "../helpers/tabSource";
import { createContext, ReactNode, useContext } from "react";

type TabId = number;
type SourceName = string;
type SourceId = string;
type SourceMap = Map<SourceId, TabId>;
type TabServiceState = {
  tabIdSequence: TabId;
  activeTabId: TabId;
  tabsIndex: Map<SourceName, SourceMap>; // Type: SourceName -> sourceId -> tabId eg: Request -> [requestId,tabId]
  tabs: Map<TabId, StoreApi<TabState>>;

  _version: number;

  openTab: (source: AbstractTabSource) => void;
  closeTab: (source: AbstractTabSource) => void;
  closeAllTabs: () => void;
  closeTabById: (tabId: TabId) => void;
  setActiveTabId: (tabId: TabId) => void;
  _generateNewTabId: () => TabId;
  incrementVersion: () => void;
  getSourceByTabId: (tabId: TabId) => AbstractTabSource;
};

const createTabServiceStore = () => {
  return create<TabServiceState>((set, get) => ({
    tabIdSequence: 0,
    activeTabId: 0,
    tabsIndex: new Map(),
    tabs: new Map(),

    _version: 0,

    openTab(source) {
      const { _generateNewTabId, tabsIndex, tabs, setActiveTabId } = get();
      const sourceId = source.getSourceId();
      const sourceName = source.getSourceName();

      const existingTabId = tabsIndex.get(sourceName)?.get(sourceId);
      if (existingTabId) {
        setActiveTabId(existingTabId);
        return;
      }

      const newTabId = _generateNewTabId();
      const tab = createTabStore(newTabId, source, source.getDefaultTitle());

      if (tabsIndex.has(sourceName)) {
        tabsIndex.get(sourceName)?.set(sourceId, newTabId);
      } else {
        tabsIndex.set(sourceName, new Map().set(sourceId, newTabId));
      }
      tabs.set(newTabId, tab);
      setActiveTabId(newTabId);

      set({
        tabs: new Map(tabs),
        activeTabId: newTabId,
      });
    },

    closeTab(source) {
      const { tabsIndex, closeTabById } = get();
      const sourceId = source.getSourceId();
      const sourceName = source.getSourceName();

      const existingTabId = tabsIndex.get(sourceName)?.get(sourceId);
      if (!existingTabId) {
        return;
      }

      closeTabById(existingTabId);
    },

    closeAllTabs() {
      const { tabs, closeTabById } = get();
      tabs.forEach((_, tabId) => {
        closeTabById(tabId);
      });
    },

    closeTabById(tabId) {
      const { tabs, tabsIndex, activeTabId } = get();
      const tabStore = tabs.get(tabId);
      if (!tabStore) {
        return;
      }

      const tabState = tabStore.getState();
      const sourceName = tabState.source.getSourceName();
      const sourceId = tabState.source.getSourceId();
      tabsIndex.get(sourceName)?.delete(sourceId);

      if (tabsIndex.get(sourceName)?.size === 0) {
        tabsIndex.delete(sourceName);
      }

      const newActiveTabId = (() => {
        if (activeTabId !== tabId) {
          return activeTabId;
        }

        const tabsArray = Array.from(tabs.keys());
        const currentIndex = tabsArray.indexOf(tabId);
        if (currentIndex === tabsArray.length - 1) {
          return tabsArray[currentIndex - 1];
        }
        return tabsArray[currentIndex + 1];
      })();
      tabs.delete(tabId);

      set({
        tabs: new Map(tabs),
        activeTabId: newActiveTabId,
      });
    },

    setActiveTabId(id: TabId) {
      const { tabs } = get();
      if (tabs.has(id)) {
        set({ activeTabId: id });
      }
    },

    _generateNewTabId() {
      const { tabIdSequence } = get();
      const nextId = tabIdSequence + 1;
      set({ tabIdSequence: nextId });
      return nextId;
    },

    incrementVersion() {
      set({ _version: get()._version + 1 });
    },

    getSourceByTabId(tabId) {
      const { tabs } = get();
      const tab = tabs.get(tabId);
      if (!tab) {
        throw new Error(`Tab with id ${tabId} not found`);
      }
      return tab.getState().source;
    },
  }));
};

// https://zustand.docs.pmnd.rs/guides/auto-generating-selectors
type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never;
const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

const tabServiceStore = createTabServiceStore();
const tabServiceStoreWithAutoSelectors = createSelectors(tabServiceStore);

// Creating and passing the store through context to ensure context's value can be mocked easily
const TabServiceStoreContext = createContext(tabServiceStoreWithAutoSelectors);

export const createTabServiceProvider = () => {
  return (props: { children: ReactNode }) => {
    return {
      type: TabServiceStoreContext.Provider,
      props: {
        value: tabServiceStoreWithAutoSelectors,
        children: props.children,
      },
    };
  };
};

/**
 * Usage: const [a, b] = useTabServiceSelector(state => [ state.a, state.b ])
 * @param selector
 * @returns selector
 */
export const useTabServiceWithSelector = <T>(selector: (state: TabServiceState) => T) => {
  const store = useContext(TabServiceStoreContext);
  return useStore(store, useShallow(selector));
};

/**
 * Usage: const openTab = useTabServiceStore().use.openTab()
 */
export const useTabServiceStore = () => {
  const store = useContext(TabServiceStoreContext);
  return store;
};
