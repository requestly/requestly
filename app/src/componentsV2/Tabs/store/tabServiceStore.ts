import { create, StoreApi, UseBoundStore, useStore } from "zustand";
import { persist, StorageValue } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { createTabStore, TabState } from "./tabStore";
import { AbstractTabSource } from "../helpers/tabSource";
import { createContext, ReactNode, useContext } from "react";
import { TAB_SOURCES_MAP } from "../constants";

type TabId = number;
type SourceName = string;
type SourceId = string;
type SourceMap = Map<SourceId, TabId>;

type TabStore = StoreApi<TabState>;
type TabConfig = {
  preview: boolean;
};

type TabServiceState = {
  tabIdSequence: TabId;
  activeTabId: TabId | undefined;
  activeTabSource: AbstractTabSource | null;
  previewTabId: TabId | undefined;
  previewTabSource: AbstractTabSource | null;
  tabsIndex: Map<SourceName, SourceMap>; // Type: SourceName -> sourceId -> tabId eg: Request -> [requestId,tabId]
  tabs: Map<TabId, TabStore>;

  _version: number;
};

type TabActions = {
  reset: () => void;
  upsertTabSource: (tabId: TabId, source: AbstractTabSource, config?: TabConfig) => void;
  updateTabBySourceId: (sourceId: SourceId, updates: Partial<Pick<TabState, "preview" | "unsaved" | "title">>) => void;
  openTab: (source: AbstractTabSource, config?: TabConfig) => void;
  closeTab: (source: AbstractTabSource, skipUnsavedPrompt?: boolean) => void;
  closeAllTabs: (skipUnsavedPrompt?: boolean) => void;
  closeTabById: (tabId: TabId, skipUnsavedPrompt?: boolean) => void;
  resetPreviewTab: () => void;
  setPreviewTab: (tabId: TabId) => void;
  setActiveTab: (tabId: TabId) => void;
  _generateNewTabId: () => TabId;
  incrementVersion: () => void;
  getSourceByTabId: (tabId: TabId) => AbstractTabSource | undefined;
  getTabIdBySourceId: (sourceId: SourceId) => TabId | undefined;
};

export type TabServiceStore = TabServiceState & TabActions;

const initialState: TabServiceState = {
  tabIdSequence: 0,
  activeTabId: undefined,
  activeTabSource: null,
  previewTabId: undefined,
  previewTabSource: null,
  tabsIndex: new Map(),
  tabs: new Map(),

  _version: 0,
};

const createTabServiceStore = () => {
  const tabServiceStore = create<TabServiceStore>()(
    persist(
      (set, get) => ({
        ...initialState,

        reset() {
          set(initialState);
          tabServiceStore.persist.clearStorage();
        },

        upsertTabSource(tabId, source, config) {
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
          });
        },

        updateTabBySourceId(sourceId, updates) {
          const { tabs, getTabIdBySourceId } = get();
          const tabId = getTabIdBySourceId(sourceId);

          const tabStore = tabs.get(tabId);
          if (!tabStore) {
            return;
          }

          const tabState = tabStore.getState();
          const updatedTitle = updates?.title ?? tabState.title;
          const updatedPreview = updates?.preview ?? tabState.preview;

          const updatedTabStore = createTabStore(tabId, tabState.source, updatedTitle, updatedPreview);

          tabs.set(tabId, updatedTabStore);
          set({ tabs: new Map(tabs) });
        },

        openTab(source, config) {
          const {
            _generateNewTabId,
            tabsIndex,
            setActiveTab,
            upsertTabSource,
            previewTabId,
            previewTabSource,
            setPreviewTab,
          } = get();
          const sourceId = source.getSourceId();
          const sourceName = source.getSourceName();

          const existingTabId = tabsIndex.get(sourceName)?.get(sourceId);
          if (existingTabId) {
            setActiveTab(existingTabId);
            return;
          }

          if (config?.preview) {
            if (previewTabId) {
              // Remove previous preview tab source from tabsIndex
              tabsIndex.get(previewTabSource.getSourceName())?.delete(previewTabSource.getSourceId());
            }

            const tabId = previewTabId ?? _generateNewTabId();
            upsertTabSource(tabId, source, config);
            setPreviewTab(tabId);
            return;
          }

          const newTabId = _generateNewTabId();
          upsertTabSource(newTabId, source);
        },

        closeTab(source, skipUnsavedPrompt = false) {
          const { tabsIndex, closeTabById } = get();
          const sourceId = source.getSourceId();
          const sourceName = source.getSourceName();

          const existingTabId = tabsIndex.get(sourceName)?.get(sourceId);
          if (!existingTabId) {
            return;
          }

          closeTabById(existingTabId, skipUnsavedPrompt);
        },

        closeAllTabs(skipUnsavedPrompt) {
          const { tabs, closeTabById } = get();
          tabs.forEach((_, tabId) => {
            closeTabById(tabId, skipUnsavedPrompt);
          });
        },

        closeTabById(tabId, skipUnsavedPrompt) {
          const { tabs, tabsIndex, activeTabId, setActiveTab } = get();
          const tabStore = tabs.get(tabId);
          if (!tabStore) {
            return;
          }

          const tabState = tabStore.getState();
          const sourceName = tabState.source.getSourceName();
          const sourceId = tabState.source.getSourceId();

          if (tabState.unsaved && !skipUnsavedPrompt) {
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

        resetPreviewTab() {
          set({
            previewTabId: undefined,
            previewTabSource: null,
          });
        },

        setPreviewTab(id: TabId) {
          const { tabs, resetPreviewTab } = get();

          if (tabs.has(id)) {
            set({ previewTabId: id, previewTabSource: tabs.get(id).getState().source });
          } else {
            resetPreviewTab();
          }
        },

        setActiveTab(id: TabId) {
          const { tabs } = get();
          if (tabs.has(id)) {
            set({ activeTabId: id, activeTabSource: tabs.get(id).getState().source });
          } else {
            set({
              activeTabId: undefined,
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
            return;
          }

          return tab.getState().source;
        },

        getTabIdBySourceId(sourceId: SourceId) {
          const { tabs } = get();
          for (const [id, tab] of tabs) {
            if (tab.getState().source.getSourceId() === sourceId) {
              return id;
            }
          }
          return;
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
          setItem: (name, newValue: StorageValue<TabServiceStore>) => {
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

            const tabsIndex: TabServiceStore["tabsIndex"] = new Map(
              existingValue.state.tabsIndex.map(
                // eslint-disable-next-line
                ([sourceName, sourceMap]: [string, MapIterator<[SourceId, TabId]>]) => [sourceName, new Map(sourceMap)]
              )
            );

            const tabs: TabServiceStore["tabs"] = new Map(
              existingValue.state.tabs.map(([tabId, tabState]: [TabId, TabState]) => {
                const source = new TAB_SOURCES_MAP[tabState.source.type](tabState.source.metadata);
                return [tabId, createTabStore(tabId, source, tabState.title)];
              })
            );

            const activeTabId = existingValue.state.activeTabId;
            const activeTabSource = activeTabId ? tabs.get(activeTabId).getState().source : null;

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

  return tabServiceStore;
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

export const tabServiceStore = createTabServiceStore();
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
export const useTabServiceWithSelector = <T>(selector: (state: TabServiceStore) => T) => {
  const store = useContext(TabServiceStoreContext);
  return useStore(store, useShallow(selector));
};
