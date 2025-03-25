import React, { useEffect, useMemo } from "react";
import { Tabs, TabsProps } from "antd";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";

const updateUrlPath = (path: string) => {
  window.history.pushState({}, "", path);
};

export const TabsContainer: React.FC = () => {
  const [
    activeTabId,
    setActiveTabId,
    tabs,
    _version,
    openTab,
    closeTabById,
    getSourceByTabId,
  ] = useTabServiceWithSelector((state) => [
    state.activeTabId,
    state.setActiveTabId,
    state.tabs,
    state._version,
    state.openTab,
    state.closeTabById,
    state.getSourceByTabId,
  ]);

  useEffect(() => {
    if (activeTabId) {
      const tabSource = getSourceByTabId(activeTabId);
      tabSource.updateUrl();
    }
  }, [activeTabId, getSourceByTabId]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    return Array.from(tabs.values()).map((tabStore) => {
      const tabState = tabStore.getState();
      return {
        key: tabState.id.toString(),
        label: tabState.title,
        children: <TabItem store={tabStore}>{tabState.source.render()}</TabItem>,
        closable: true,
      };
    });
    // We need _version in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, _version]);

  return (
    <Tabs
      type="editable-card"
      items={tabItems}
      activeKey={activeTabId.toString()}
      onChange={(key) => {
        setActiveTabId(parseInt(key));
      }}
      onEdit={(key, action) => {
        if (action === "remove") {
          const id = parseInt(key as string);
          closeTabById(id);
        } else if (action === "add") {
          // openTab();
        }
      }}
    />
  );
};
