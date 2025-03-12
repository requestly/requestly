import { create, StoreApi, useStore } from "zustand";
import { useShallow } from "zustand/shallow";
import { createTabStore, TabState } from "./tabStore";
import { AbstractTabSource } from "../helpers/tabSource";

type TabId = number;
type SourceId = string;
type SourceMap = Map<SourceId, TabId>;
type TabServiceState = {
  tabIdSequence: TabId;
  activeTabId: TabId;
  tabsIndex: Map<string, SourceMap>; // Type: Source -> sourceId -> tabId eg: Request -> [requestId,tabId]
  tabs: Map<TabId, StoreApi<TabState>>;

  _version: number;

  openTab: (source: AbstractTabSource) => void;
  closeTab: (source: AbstractTabSource) => void;
  closeAllTabs: () => void;
  closeTabById: (tabId: TabId) => void;
  setActiveTabId: (tabId: TabId) => void;
  _generateNewTabId: () => TabId;
  _incrementVersion: () => void;
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
      const sourceId = source.getId();
      const sourceName = source.constructor.name;

      const existingTabId = tabsIndex.get(sourceName)?.get(sourceId);
      if (existingTabId) {
        setActiveTabId(existingTabId);
        return;
      }

      const newTabId = _generateNewTabId();
      const tab = createTabStore(newTabId, source, "Tab Title");

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
      const sourceId = source.getId();
      const sourceName = source.constructor.name;

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
      const sourceName = tabState.source.constructor.name;
      const sourceId = tabState.source.getId();
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
    _incrementVersion() {
      set({ _version: get()._version + 1 });
    },
  }));
};

const tabServiceStore = createTabServiceStore();
export const useTabService = <T = TabServiceState>(selector?: (state: TabServiceState) => T) => {
  return useStore(tabServiceStore, useShallow(selector ?? ((state) => state as T)));
};
