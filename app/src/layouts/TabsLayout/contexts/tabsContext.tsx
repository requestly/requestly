import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab } from "../types";

interface TabsLayoutContextInterface {
  tabs: Tab[];
  activeTab: Tab;
  openTab: (tabId: Tab["id"]) => void;
  closeTab: (tabId: Tab["id"]) => void;
}

const TabsLayoutContext = createContext<TabsLayoutContextInterface>({
  tabs: [],
  activeTab: undefined,
  openTab: (tabId: Tab["id"]) => {},
  closeTab: (tabId: Tab["id"]) => {},
});

interface TabsLayoutProviderProps {
  children: React.ReactElement;
}

const BLACKLISTED_ROUTES = ["/api-client"];

export const TabsLayoutProvider: React.FC<TabsLayoutProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Persist saved tabs
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>();

  const tabId = location.pathname; // TODO: generate a tab id/hash using pathname
  const isTabExist = tabs.find((tab) => tab.id === tabId);

  const createNewTab = useCallback(() => {
    const newTabDetails: Tab = {
      id: location.pathname, // TODO: update the id
      url: location.pathname,
      title: "Untitled", // TODO: generate title by path name
      isSaved: false,
      hasUnsavedChanges: false,
      timeStamp: Date.now(),
    };

    return newTabDetails;
  }, [location.pathname]);

  console.log({ tabId, tabs });

  useEffect(() => {
    if (BLACKLISTED_ROUTES.includes(location.pathname)) {
      // Filter the top level routes
      return;
    }

    // update the tabs map
    console.log("runnin....");
    if (isTabExist) {
      setActiveTab(isTabExist);
      return;
    }

    const newTabDetails = createNewTab();
    setTabs((prev) => [...prev, newTabDetails]);
  }, [location.pathname, isTabExist, createNewTab]);

  const openTab = useCallback(
    (tabId: Tab["id"]) => {
      const tab = tabs.find((item) => item.id === tabId);

      if (tab) {
        navigate(tab.url);
        setActiveTab(tab);
      }

      // check if the entry exist in the map and is YES the make it as active tab
      // else open or update the tabs map and set this as active tab
    },
    [tabs, navigate]
  );

  const closeTab = useCallback(
    (tabId: Tab["id"]) => {
      const tabIndex = tabs.findIndex((tab) => tab.id !== tabId);

      if (tabIndex !== -1 && tabIndex > 0) {
        setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
        setActiveTab(tabs[tabIndex - 1]);
      } else {
        // Open new tab
      }

      // check if its active tab then make another tab as active and close this
      // Before closing check for the unsaved changes
    },
    [tabs]
  );

  // const updateTab = (updatedTabItem: Partial<Tab>) => {
  //   // Updates the current tab in the map
  // };

  /**
   * - Register the route in a new tab
   * - have a map for tab items
   * - have active tabs
   * - have two way data flow
   */
  const value = { activeTab, tabs, openTab, closeTab };

  return <TabsLayoutContext.Provider value={value}>{children}</TabsLayoutContext.Provider>;
};

export const useTabsLayoutContext = () => useContext(TabsLayoutContext);
