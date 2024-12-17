import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabsLayout, TabsLayoutContextInterface } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { tabsLayoutActions } from "store/features/tabs-layout/slice";
import { getActiveTab, getTabs } from "store/features/tabs-layout/selectors";

export enum Feature {
  API_CLIENT = "api-client",
}

const TabsLayoutContext = createContext<TabsLayoutContextInterface>({
  tabs: [],
  activeTab: undefined,
  closeTab: (tabId: TabsLayout.Tab["id"]) => {},
  openTab: (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => {},
  updateTab: (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => {},
  replaceTab: (tabId: TabsLayout.Tab["id"], newTabData?: Partial<TabsLayout.Tab>) => {},
  tabOutletElementsMap: undefined,
});

interface TabsLayoutProviderProps {
  children: React.ReactElement;
  childFeatureName: Feature;
}

export const TabsLayoutProvider: React.FC<TabsLayoutProviderProps> = ({ children, childFeatureName }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const persistedTabs = useSelector((state: any) => getTabs(state, childFeatureName));
  const persistedActiveTab = useSelector((state: any) => getActiveTab(state, childFeatureName));

  // This is used to keep track of elements rendered in each tab which is needed by TabOutletHOC
  const tabOutletElementsMap = React.useRef<{ [tabId: string]: React.ReactElement }>({});

  // TODO: remove this local states when tabs persistence approached is finalised
  const [tabs, setTabs] = useState<TabsLayout.Tab[]>(persistedTabs);
  const [activeTab, setActiveTab] = useState<TabsLayout.Tab>(persistedActiveTab);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    if (!persistedActiveTab) {
      return;
    }

    delete tabOutletElementsMap.current[persistedActiveTab.id];
    navigate(persistedActiveTab.url);
  }, [navigate, persistedActiveTab]);

  // FIXME: Needs refactor, temp solution to update in store
  useEffect(() => {
    dispatch(tabsLayoutActions.updateTabs({ feature: childFeatureName, tabs: tabs }));
  }, [tabs, dispatch, childFeatureName]);

  // FIXME: Needs refactor, temp solution to update in store
  useEffect(() => {
    dispatch(tabsLayoutActions.setActiveTab({ feature: childFeatureName, tab: activeTab }));
  }, [activeTab, dispatch, childFeatureName]);

  const updateActivetab = useCallback(
    (tab: TabsLayout.Tab) => {
      navigate(tab.url);
      setActiveTab((prev) => ({ ...(prev ?? {}), ...tab }));
    },
    [navigate]
  );

  const closeTab = useCallback(
    (tabId: TabsLayout.Tab["id"]) => {
      const copiedTabs = [...tabs];
      const targetTabIndex = copiedTabs.findIndex((tab) => tab.id === tabId);

      if (targetTabIndex === -1) {
        return;
      }

      const targetTab = copiedTabs[targetTabIndex];
      const updatedTabs = copiedTabs.filter((tab) => tab.id !== tabId);

      setTabs(updatedTabs);

      if (updatedTabs.length && targetTab.id === activeTab?.id) {
        const nextActiveTab = updatedTabs[targetTabIndex === updatedTabs.length ? targetTabIndex - 1 : targetTabIndex];
        updateActivetab(nextActiveTab);
      }

      delete tabOutletElementsMap.current[tabId];
    },
    [tabs, activeTab?.id, updateActivetab]
  );

  const openTab = useCallback(
    (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => {
      const tab = tabs.find((item) => item.id === tabId);

      if (tab) {
        updateActivetab(tab);
        return;
      }

      const newTabDetails = {
        title: "Untitled",
        ...(tabDetails ?? {}),
        id: tabId,
        isSaved: false,
        hasUnsavedChanges: false,
        timeStamp: Date.now(),
      } as TabsLayout.Tab;

      setTabs((prev) => [...prev, newTabDetails]);
      updateActivetab(newTabDetails);
    },
    [tabs, updateActivetab]
  );

  const updateTab = useCallback((tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...updatedTabData, id: tabId } : tab)));
  }, []);

  const replaceTab = useCallback(
    (tabId: TabsLayout.Tab["id"], newTabData: Partial<TabsLayout.Tab>) => {
      const existingTab = tabs.find((tab) => tab.id === tabId);

      if (!existingTab) {
        openTab(newTabData.id, newTabData);
        return;
      }

      setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...newTabData } : tab)));

      if (tabId === activeTab?.id) {
        updateActivetab({ ...activeTab, ...newTabData } as TabsLayout.Tab);
      }
    },
    [tabs, activeTab, updateActivetab, openTab]
  );

  const value = { activeTab, tabs, openTab, closeTab, updateTab, replaceTab, tabOutletElementsMap };

  return <TabsLayoutContext.Provider value={value}>{children}</TabsLayoutContext.Provider>;
};

export const useTabsLayoutContext = () => useContext(TabsLayoutContext);
