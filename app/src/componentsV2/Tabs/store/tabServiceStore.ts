import { create, StoreApi, UseBoundStore, useStore } from "zustand";
import { persist, StorageValue } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { createTabStore, TabState, tabStateSetters } from "./tabStore";
import { AbstractTabSource } from "../helpers/tabSource";
import { createContext, ReactNode, useContext } from "react";
import { tabSources } from "../constants";

type TabId = number;
type SourceName = string;
type SourceId = string;
type SourceMap = Map<SourceId, TabId>;
type TabConfig = {
  preview: boolean;
};

export type TabServiceState = {
  tabIdSequence: TabId;
  activeTabId: TabId;
  activeTabSource: AbstractTabSource;
  tabsIndex: Map<SourceName, SourceMap>; // Type: SourceName -> sourceId -> tabId eg: Request -> [requestId,tabId]
  tabs: Map<TabId, StoreApi<TabState>>;

  _version: number;

  _registerTab: (tabId: TabId, source: AbstractTabSource, config?: TabConfig) => void;
  openTab: (source: AbstractTabSource, config?: TabConfig) => void;
  closeTab: (source: AbstractTabSource) => void;
  closeAllTabs: () => void;
  closeTabById: (tabId: TabId) => void;
  setActiveTab: (tabId: TabId) => void;
  _generateNewTabId: () => TabId;
  incrementVersion: () => void;
  getSourceByTabId: (tabId: TabId) => AbstractTabSource;
  getTabIdBySourceId: (sourceId: SourceId) => TabId;
};

const createTabServiceStore = () => {
  return create<TabServiceState>()(
    persist(
      (set, get) => ({
        tabIdSequence: 0,
        activeTabId: 0,
        activeTabSource: null,
        tabsIndex: new Map(),
        tabs: new Map(),

        _version: 0,

        _registerTab(tabId, source, config) {
          const { tabsIndex, tabs, setActiveTab } = get();
          const sourceId = source.getSourceId();
          const sourceName = source.getSourceName();
          const tab = createTabStore(tabId, source, source.getDefaultTitle(), config?.preview);

          if (tabsIndex.has(sourceName)) {
            tabsIndex.get(sourceName)?.set(sourceId, tabId);
          } else {
            tabsIndex.set(sourceName, new Map().set(sourceId, tabId));
          }

          tabs.set(tabId, tab);
          setActiveTab(tabId);

          set({
            tabs: new Map(tabs),
            activeTabId: tabId,
          });
        },

        openTab(source, config) {
          const { _generateNewTabId, tabsIndex, tabs, setActiveTab, _registerTab } = get();
          const sourceId = source.getSourceId();
          const sourceName = source.getSourceName();

          const existingTabId = tabsIndex.get(sourceName)?.get(sourceId);
          if (existingTabId) {
            setActiveTab(existingTabId);
            return;
          }

          if (config?.preview) {
            const previousPreviewTab = Array.from(tabs.values()).find((tab) => tab.getState().preview);
            const tabId = previousPreviewTab ? previousPreviewTab.getState().id : _generateNewTabId();
            const previousPreviewTabSource = previousPreviewTab?.getState().source;
            if (previousPreviewTabSource) {
              tabsIndex.get(previousPreviewTabSource.getSourceName())?.delete(previousPreviewTabSource.getSourceId());
            }

            _registerTab(tabId, source, config);
            return;
          }

          const newTabId = _generateNewTabId();
          _registerTab(newTabId, source);
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
          const { tabs, tabsIndex, activeTabId, setActiveTab } = get();
          const tabStore = tabs.get(tabId);
          if (!tabStore) {
            return;
          }

          const tabState = tabStore.getState();
          const sourceName = tabState.source.getSourceName();
          const sourceId = tabState.source.getSourceId();

          if (tabState.saved) {
            // TODO: update alert message for RBAC viewer role
            const result = window.confirm("Discard changes? Changes you made will not be saved.");

            if (!result) {
              return;
            }
          }

          tabsIndex.get(sourceName)?.delete(sourceId);

          if (tabsIndex.get(sourceName)?.size === 0) {
            tabsIndex.delete(sourceName);
          }

          const newActiveTabId = (() => {
            if (activeTabId !== tabId) {
              return activeTabId;
            }

            const tabsArray = Array.from(tabs.keys());
            if (tabsArray.length - 1 === 0) {
              return null;
            }

            const currentIndex = tabsArray.indexOf(tabId);
            if (currentIndex === tabsArray.length - 1) {
              return tabsArray[currentIndex - 1];
            }
            return tabsArray[currentIndex + 1];
          })();
          tabs.delete(tabId);

          set({
            tabs: new Map(tabs),
          });
          setActiveTab(newActiveTabId);
        },

        setActiveTab(id: TabId) {
          const { tabs } = get();
          if (tabs.has(id)) {
            set({ activeTabId: id, activeTabSource: tabs.get(id).getState().source });
          } else {
            set({
              activeTabId: 0,
              activeTabSource: null,
            });
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

        getTabIdBySourceId(sourceId: SourceId): TabId {
          const { tabs } = get();
          for (const [id, tab] of tabs) {
            if (tab.getState().source.getSourceId() === sourceId) {
              return id;
            }
          }
          return null;
        },
      }),
      {
        name: "rq_tabs_store",
        partialize: (state) => ({
          tabIdSequence: state.tabIdSequence,
          activeTabId: state.activeTabId,
          tabsIndex: state.tabsIndex,
          tabs: state.tabs,
          _version: state._version,
        }),

        storage: {
          setItem: (name, newValue: StorageValue<TabServiceState>) => {
            const tabs = Array.from(newValue.state.tabs.entries()).map(([tabId, tabStore]) => [
              tabId,
              tabStore.getState(),
            ]);

            const tabsIndex = Array.from(newValue.state.tabsIndex.entries()).map(([sourceName, sourceMap]) => [
              sourceName,
              Array.from(sourceMap.entries()),
            ]);

            const stateString = JSON.stringify({
              ...newValue,
              state: {
                ...newValue.state,
                tabs,
                tabsIndex,
              },
            });
            localStorage.setItem(name, stateString);
          },

          getItem: (name) => {
            const stateString = localStorage.getItem(name);

            if (!stateString) {
              return null;
            }

            const existingValue = JSON.parse(stateString);

            const tabsIndex: TabServiceState["tabsIndex"] = new Map(
              existingValue.state.tabsIndex.map(
                // eslint-disable-next-line
                ([sourceName, sourceMap]: [string, MapIterator<[SourceId, TabId]>]) => [sourceName, new Map(sourceMap)]
              )
            );

            const tabs: TabServiceState["tabs"] = new Map(
              existingValue.state.tabs.map(([tabId, tabState]: [TabId, TabState]) => [
                tabId,
                create<TabState>((set) => ({
                  ...tabState,
                  source: new tabSources[tabState.source.type](tabState.source.metadata as any), // FIXME: fix type
                  ...tabStateSetters(set),
                })),
              ])
            );

            const activeTab = tabs.get(existingValue.state.activeTabId).getState();
            const activeTabSource = new tabSources[activeTab.source.type](activeTab.source.metadata as any);

            return {
              ...existingValue,
              state: {
                ...existingValue.state,
                tabs,
                tabsIndex,
                activeTabSource,
              },
            };
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    )
  );
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
