import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabsLayout, TabsLayoutContextInterface } from "../types";

const TabsLayoutContext = createContext<TabsLayoutContextInterface>({
  tabs: [],
  activeTab: undefined,
  closeTab: (tabId: TabsLayout.Tab["id"]) => {},
  openTab: (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => {},
  updateTab: (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => {},
  replaceTab: (tabId: TabsLayout.Tab["id"], newTabData?: Partial<TabsLayout.Tab>) => {},
});

interface TabsLayoutProviderProps {
  children: React.ReactElement;
}

export const TabsLayoutProvider: React.FC<TabsLayoutProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const [tabs, setTabs] = useState<TabsLayout.Tab[]>([]); // TODO: Persist saved tabs
  const [activeTab, setActiveTab] = useState<TabsLayout.Tab>();

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
      const targetTab = copiedTabs[targetTabIndex];
      const updatedTabs = copiedTabs.filter((tab) => tab.id !== tabId);

      setTabs((prev) => prev.filter((tab) => tab.id !== tabId));

      if (updatedTabs.length && targetTab.id === activeTab?.id) {
        const nextActiveTab = updatedTabs[targetTabIndex === updatedTabs.length ? targetTabIndex - 1 : targetTabIndex];
        console.log({ nextActiveTab });
        updateActivetab(nextActiveTab);
      }
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
    (tabId: TabsLayout.Tab["id"], newTabData?: Partial<TabsLayout.Tab>) => {
      setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...newTabData } : tab)));

      if (tabId === activeTab?.id) {
        updateActivetab({ ...activeTab, ...newTabData } as TabsLayout.Tab);
      }
    },
    [activeTab, updateActivetab]
  );

  const value = { activeTab, tabs, openTab, closeTab, updateTab, replaceTab };

  return <TabsLayoutContext.Provider value={value}>{children}</TabsLayoutContext.Provider>;
};

export const useTabsLayoutContext = () => useContext(TabsLayoutContext);
