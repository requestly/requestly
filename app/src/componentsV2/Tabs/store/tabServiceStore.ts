import { createContext, useContext } from "react";
import { create, StoreApi, UseBoundStore, useStore } from "zustand";
import { persist, StorageValue } from "zustand/middleware";
import * as Sentry from "@sentry/react";
import { useShallow } from "zustand/shallow";
import { createTabStore, TabState } from "./tabStore";
import { AbstractTabSource } from "../helpers/tabSource";
import { TAB_SOURCES_MAP } from "../constants";
import {
  ResetTabSource,
  trackResetTabServiceStore,
  trackTabActionEarlyReturn,
  trackTabCloseById,
  trackTabCloseClicked,
  trackTabClosed,
  trackTabClosedById,
  trackTabLocalStorageGetItemCalled,
  trackTabLocalStorageSetItemCalled,
  trackTabOpenClicked,
  trackTabOpened,
  trackTabsRehydrationCompleted,
  trackTabsRehydrationError,
  trackTabsRehydrationStarted,
  trackUpsertTabSourceCalled,
  trackUpsertTabSourceCompleted,
} from "../analytics";

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
  reset: (source: ResetTabSource) => void;
  upsertTabSource: (tabId: TabId | undefined, source: AbstractTabSource, config?: TabConfig) => void;
  updateTabBySource: (
    sourceId: SourceId,
    sourceName: SourceName,
    updates: Partial<Pick<TabState, "preview" | "unsaved" | "title">>
  ) => void;
  openTab: (source: AbstractTabSource, config?: TabConfig) => void;
  closeTab: (source: AbstractTabSource, skipUnsavedPrompt?: boolean) => void;
  closeAllTabs: (skipUnsavedPrompt?: boolean) => void;
  closeTabById: (tabId: TabId, skipUnsavedPrompt?: boolean) => void;
  closeTabBySource: (sourceId: SourceId, sourceName: SourceName, skipUnsavedPrompt?: boolean) => void;
  resetPreviewTab: () => void;
  setPreviewTab: (tabId: TabId) => void;
  setActiveTab: (tabId: TabId) => void;
  _generateNewTabId: () => TabId;
  incrementVersion: () => void;
  getTabIdBySource: (sourceId: SourceId, sourceName: SourceName) => TabId | undefined;
  getTabStateBySource: (sourceId: SourceId, sourceName: SourceName) => TabState | undefined;
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

        reset(source) {
          set(initialState);
          tabServiceStore.persist.clearStorage();
          trackResetTabServiceStore(source);
        },

        upsertTabSource(tabId, source, config) {
          const sourceId = source.getSourceId();
          const sourceName = source.getSourceName();
          trackUpsertTabSourceCalled(sourceId, sourceName);

          const { tabsIndex, tabs, setActiveTab } = get();

          if (!tabId) {
            return;
          }

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

          trackUpsertTabSourceCompleted(sourceId, sourceName);
        },

        updateTabBySource(sourceId, sourceName, updates) {
          const { tabs, getTabIdBySource, incrementVersion } = get();
          const tabId = getTabIdBySource(sourceId, sourceName);

          const tabStore = tabs.get(tabId);
          if (!tabStore) {
            trackTabActionEarlyReturn("updateTabBySourceId", "Tab store not found.");
            return;
          }

          const tabState = tabStore.getState();
          const updatedTitle = updates?.title ?? tabState.title;
          const updatedPreview = updates?.preview ?? tabState.preview;

          tabStore.getState().setTitle(updatedTitle);
          tabStore.getState().setPreview(updatedPreview);
          incrementVersion();
        },

        openTab(source, config) {
          const sourceId = source.getSourceId();
          const sourceName = source.getSourceName();
          trackTabOpenClicked(sourceId, sourceName, config?.preview);

          const {
            _generateNewTabId,
            tabsIndex,
            setActiveTab,
            upsertTabSource,
            previewTabId,
            previewTabSource,
            setPreviewTab,
            getTabIdBySource,
          } = get();

          const existingTabId = getTabIdBySource(sourceId, sourceName);
          if (existingTabId) {
            setActiveTab(existingTabId);
            trackTabOpened(sourceId, sourceName, config?.preview);
            trackTabActionEarlyReturn("openTab", "Tab found.");
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
            trackTabActionEarlyReturn("openTab", "Registering preview tab.");
            return;
          }

          const newTabId = _generateNewTabId();
          upsertTabSource(newTabId, source);
          trackTabOpened(sourceId, sourceName, config?.preview);
        },

        closeTab(source, skipUnsavedPrompt = false) {
          const sourceId = source.getSourceId();
          const sourceName = source.getSourceName();
          trackTabCloseClicked(sourceId, sourceName);

          const { closeTabById, getTabIdBySource } = get();

          const existingTabId = getTabIdBySource(sourceId, sourceName);
          if (!existingTabId) {
            trackTabActionEarlyReturn("closeTab", "Tab id not found.");
            return;
          }

          closeTabById(existingTabId, skipUnsavedPrompt);
          trackTabClosed(sourceId, sourceName);
        },

        closeAllTabs(skipUnsavedPrompt) {
          const { tabs, closeTabById } = get();
          tabs.forEach((_, tabId) => {
            closeTabById(tabId, skipUnsavedPrompt);
          });
        },

        closeTabBySource(sourceId, sourceName, skipUnsavedPrompt) {
          trackTabCloseClicked(sourceId, sourceName);
          const { closeTabById, getTabIdBySource } = get();

          const tabId = getTabIdBySource(sourceId, sourceName);
          if (!tabId) {
            trackTabActionEarlyReturn("closeTabBySource", "Tab id not found.");
            return;
          }

          closeTabById(tabId, skipUnsavedPrompt);
        },

        closeTabById(tabId, skipUnsavedPrompt) {
          const { tabs, tabsIndex, activeTabId, setActiveTab } = get();
          const tabStore = tabs.get(tabId);
          if (!tabStore) {
            trackTabActionEarlyReturn("closeTabById", "Tab store not found.");
            return;
          }

          const tabState = tabStore.getState();
          const sourceName = tabState.source.getSourceName();
          const sourceId = tabState.source.getSourceId();
          trackTabCloseById(sourceId, sourceName);

          if (tabState.unsaved && !skipUnsavedPrompt) {
            // TODO: update alert message for RBAC viewer role
            const result = window.confirm("Discard changes? Changes you made will not be saved.");

            if (!result) {
              trackTabActionEarlyReturn("closeTabById", `Unsaved prompt discarded.`);
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
          trackTabClosedById(sourceId, sourceName);
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

        getTabIdBySource(sourceId, sourceName) {
          const { tabsIndex } = get();
          if (!sourceId) {
            trackTabActionEarlyReturn("getTabIdBySource", `For source: ${sourceName}, source Id id not found.`);
            return;
          }

          return tabsIndex.get(sourceName)?.get(sourceId);
        },

        getTabStateBySource(sourceId, sourceName) {
          const { tabs, getTabIdBySource } = get();
          const tabId = getTabIdBySource(sourceId, sourceName);

          if (!tabId) {
            trackTabActionEarlyReturn("getTabStateBySource", `For source: ${sourceName}, tab id not found.`);
            return;
          }

          return tabs.get(tabId)?.getState();
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

        onRehydrateStorage: (store) => {
          trackTabsRehydrationStarted();

          return (store, error: Error) => {
            if (error) {
              trackTabsRehydrationError(error?.message);

              Sentry.withScope((scope) => {
                scope.setTag("error_type", "tabs_rehydration_failed");
                scope.setContext("tab_service_store_details", {
                  tabServiceStore: store,
                });
                Sentry.captureException(new Error(`Tabs rehydration failed - error:${error}`));
              });
            } else {
              trackTabsRehydrationCompleted();
            }
          };
        },

        storage: {
          setItem: (name, newValue: StorageValue<TabServiceState>) => {
            try {
              trackTabLocalStorageSetItemCalled();
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
            } catch (error) {
              throw new Error(`Tab service setItem failed - error: ${error}`);
            }
          },

          getItem: (name) => {
            try {
              trackTabLocalStorageGetItemCalled();
              const stateString = localStorage.getItem(name);

              if (!stateString) {
                return null;
              }

              const existingValue = JSON.parse(stateString);

              const tabsIndex: TabServiceStore["tabsIndex"] = new Map(
                existingValue.state.tabsIndex.map(([sourceName, sourceMap]: [string, Iterable<[SourceId, TabId]>]) => [
                  sourceName,
                  new Map(sourceMap),
                ])
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
            } catch (error) {
              throw new Error(`Tab service getItem failed - error: ${error}`);
            }
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
export const tabServiceStoreWithAutoSelectors = createSelectors(tabServiceStore);

// Creating and passing the store through context to ensure context's value can be mocked easily
export const TabServiceStoreContext = createContext(tabServiceStoreWithAutoSelectors);

/**
 * Usage: const [a, b] = useTabServiceSelector(state => [ state.a, state.b ])
 * @param selector
 * @returns selector
 */
export const useTabServiceWithSelector = <T>(selector: (state: TabServiceStore) => T) => {
  const store = useContext(TabServiceStoreContext);
  return useStore(store, useShallow(selector));
};
