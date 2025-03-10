import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabsLayout, TabsLayoutContextInterface } from "../types";
import { useDispatch } from "react-redux";
import { tabsLayoutActions } from "store/slices/tabs-layout";
import { TabsProps } from "antd";
import { usePatchedTabs } from "./usePatchedTabs";
import { toast } from "utils/Toast";
import { RBAC, useRBAC } from "features/rbac";

const TabsLayoutContext = createContext<TabsLayoutContextInterface>({
  tabs: [],
  activeTab: undefined,
  closeTab: (tabId: TabsLayout.Tab["id"]) => {},
  switchToTab: (tabId: TabsLayout.Tab["id"]) => {},
  deleteTabs: (tabIds: TabsLayout.Tab["id"][]) => {},
  openTab: (tabId: TabsLayout.Tab["id"], tabDetails: TabsLayout.OpenTabArgs) => {},
  updateTab: (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => {},
  replaceTab: (tabId: TabsLayout.Tab["id"], newTabData?: Partial<TabsLayout.Tab>) => {},
  onTabsEdit: (e: React.MouseEvent | React.KeyboardEvent | string, action: "add" | "remove") => {},
  updateAddTabBtnCallback: (cb: () => void) => {},
  tabOutletElementsMap: undefined,
});

interface TabsLayoutProviderProps {
  id: string;
  children: React.ReactElement;
}

export const TabsLayoutProvider: React.FC<TabsLayoutProviderProps> = ({ children, id }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addTabBtnCallback, setAddTabBtnCallback] = useState(() => () => {});
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("tabs_layout", "create");

  // This is used to keep track of elements rendered in each tab which is needed by TabOutletHOC
  const tabOutletElementsMap = React.useRef<{ [tabId: string]: React.ReactElement }>({});

  const { tabs, activeTab } = usePatchedTabs(id);

  useEffect(() => {
    if (!activeTab) {
      return;
    }
    delete tabOutletElementsMap.current[activeTab.id];
    navigate(activeTab.url);
  }, [navigate, activeTab]);

  const updateActivetab = useCallback(
    (tab: TabsLayout.Tab) => {
      navigate(tab.url);
      dispatch(tabsLayoutActions.setActiveTab({ featureId: id, tab }));
    },
    [navigate, dispatch, id]
  );

  const closeTab = useCallback(
    (tabId: TabsLayout.Tab["id"]) => {
      const copiedTabs = [...tabs];
      const targetTabIndex = copiedTabs.findIndex((tab) => tab.id === tabId);

      if (targetTabIndex === -1) {
        return;
      }

      const targetTab = copiedTabs[targetTabIndex];

      if (targetTab.hasUnsavedChanges) {
        // TODO: Trigger a warning modal
        const result = window.confirm("Discard changes? Changes you made will not be saved.");

        if (!result) {
          return;
        }
      }

      const updatedTabs = copiedTabs.filter((tab) => tab.id !== tabId);
      dispatch(tabsLayoutActions.setTabs({ featureId: id, tabs: updatedTabs }));

      if (updatedTabs.length && targetTab.id === activeTab?.id) {
        const nextActiveTab = updatedTabs[targetTabIndex === updatedTabs.length ? targetTabIndex - 1 : targetTabIndex];
        updateActivetab(nextActiveTab);
      }

      delete tabOutletElementsMap.current[tabId];
    },
    [tabs, activeTab?.id, updateActivetab, dispatch, id]
  );

  const updateTab = useCallback(
    (tabId: TabsLayout.Tab["id"], updatedTabData?: Partial<TabsLayout.Tab>) => {
      if (!tabId) {
        return;
      }

      dispatch(tabsLayoutActions.updateTab({ featureId: id, tabId, updatedTabData }));
    },
    [dispatch, id]
  );

  const replaceTab = useCallback(
    (tabId: TabsLayout.Tab["id"], newTabData: Partial<TabsLayout.Tab>) => {
      updateTab(tabId, newTabData);

      if (tabId === activeTab?.id) {
        updateActivetab({ ...activeTab, ...newTabData } as TabsLayout.Tab);
      }
    },
    [activeTab, updateTab, updateActivetab]
  );

  const switchToTab = useCallback(
    (tabId: TabsLayout.Tab["id"]) => {
      const tab = tabs.find((item) => item.id === tabId);
      if (tab) {
        updateActivetab(tab);
      }
    },
    [tabs, updateActivetab]
  );

  const openTab = useCallback(
    (tabId: TabsLayout.Tab["id"], tabDetails: TabsLayout.OpenTabArgs) => {
      const tab = tabs.find((item) => item.id === tabId);
      if (tab) {
        updateActivetab(tab);
        return;
      }

      const newTabDetails: TabsLayout.Tab = {
        id: tabId,
        title: tabDetails.title,
        url: tabDetails.url,
        isPreview: tabDetails.isPreview ?? false,
        hasUnsavedChanges: false,
        timeStamp: Date.now(),
      };

      if (tabDetails?.isPreview) {
        // Find existing preview tab if any
        const tab = tabs.find((item) => item.isPreview);

        if (tab) {
          updateTab(tab.id, newTabDetails);
          updateActivetab(newTabDetails);
          return;
        }
      }

      dispatch(tabsLayoutActions.addTab({ featureId: id, tab: newTabDetails }));
      updateActivetab(newTabDetails);
    },
    [tabs, updateTab, updateActivetab, dispatch, id]
  );

  const deleteTabs = useCallback(
    (tabIds: TabsLayout.Tab["id"][]) => {
      if (tabIds.length === 0) {
        return;
      }

      const updatedTabs = tabs.filter((tab) => {
        const shouldFilter = tabIds.includes(tab.id);

        if (shouldFilter) {
          delete tabOutletElementsMap.current[tab.id];
        }

        return !shouldFilter;
      });

      dispatch(tabsLayoutActions.setTabs({ featureId: id, tabs: updatedTabs }));

      if (updatedTabs.length && tabIds.includes(activeTab?.id)) {
        const nextActiveTab = updatedTabs[updatedTabs.length - 1];
        updateActivetab(nextActiveTab);
      }
    },
    [tabs, activeTab?.id, updateActivetab, dispatch, id]
  );

  const onTabsEdit: TabsProps["onEdit"] = useCallback(
    (event, action) => {
      if (action === "add") {
        if (!isValidPermission && ["apiClient"].includes(id)) {
          toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.create, "request"), 5);
          return;
        }

        addTabBtnCallback?.();
      }
    },
    [addTabBtnCallback, isValidPermission, id, getRBACValidationFailureErrorMessage]
  );

  const updateAddTabBtnCallback = useCallback((cb: () => void) => {
    setAddTabBtnCallback(() => cb);
  }, []);

  const value = {
    activeTab,
    tabs,
    openTab,
    switchToTab,
    closeTab,
    deleteTabs,
    updateTab,
    replaceTab,
    onTabsEdit,
    updateAddTabBtnCallback,
    tabOutletElementsMap,
  };

  return <TabsLayoutContext.Provider value={value}>{children}</TabsLayoutContext.Provider>;
};

export const useTabsLayoutContext = () => useContext(TabsLayoutContext);
