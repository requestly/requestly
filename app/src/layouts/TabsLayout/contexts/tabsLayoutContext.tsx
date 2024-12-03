import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabsLayout } from "../types";

export interface TabsLayoutContextInterface {
  tabs: TabsLayout.Tab[];
  activeTab: TabsLayout.Tab;
  closeTab: (tabId: TabsLayout.Tab["id"]) => void;
  openTab: (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => void;
  updateTab: (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => void;
}

const TabsLayoutContext = createContext<TabsLayoutContextInterface>({
  tabs: [],
  activeTab: undefined,
  closeTab: (tabId: TabsLayout.Tab["id"]) => {},
  openTab: (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => {},
  updateTab: (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => {},
});

interface TabsLayoutProviderProps {
  children: React.ReactElement;
}

export const TabsLayoutProvider: React.FC<TabsLayoutProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const [tabs, setTabs] = useState<TabsLayout.Tab[]>([]); // TODO: Persist saved tabs
  const [activeTab, setActiveTab] = useState<TabsLayout.Tab>();

  const closeTab = useCallback(
    (tabId: TabsLayout.Tab["id"]) => {
      const tabIndex = tabs.findIndex((tab) => tab.id !== tabId);

      if (tabIndex !== -1 && tabIndex > 0) {
        setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
        // openTab(tabs[tabIndex - 1].id);
      } else {
        // Open new tab
      }

      // check if its active tab then make another tab as active and close this
      // Before closing check for the unsaved changes
    },
    [tabs]
  );

  const openTab = useCallback(
    (tabId: TabsLayout.Tab["id"], tabDetails?: Partial<TabsLayout.Tab>) => {
      const tab = tabs.find((item) => item.id === tabId);

      console.log("find tab", { tab });

      if (tab) {
        navigate(tab.url);
        setActiveTab(tab);
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
      setActiveTab(newTabDetails);
    },
    [tabs, navigate]
  );

  const updateTab = useCallback((tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...updatedTabData } : tab)));

    // if (tabId === activeTab?.id) {
    //   setActiveTab((prev) => ({ ...prev, ...updatedTabData }));
    // }
  }, []);

  const value = { activeTab, tabs, openTab, closeTab, updateTab };

  return <TabsLayoutContext.Provider value={value}>{children}</TabsLayoutContext.Provider>;
};

export const useTabsLayoutContext = () => useContext(TabsLayoutContext);
