import React, { useMemo } from "react";
import { Tabs, TabsProps } from "antd";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";

export const TabsContainer: React.FC = () => {
  const [
    activeTabId,
    setActiveTabId,
    tabs,
    _version,
    openTab,
    closeTabById,
    tabsIndex,
  ] = useTabServiceWithSelector((state) => [
    state.activeTabId,
    state.setActiveTabId,
    state.tabs,
    state._version,
    state.openTab,
    state.closeTabById,
    state.tabsIndex,
  ]);

  // const activeTabId = useTabServiceStore().use.activeTabId();
  // const setActiveTabId = useTabServiceStore().use.setActiveTabId();
  // const tabs = useTabServiceStore().use.tabs();
  // const _version = useTabServiceStore().use._version();
  // const openTab = useTabServiceStore().use.openTab();
  // const closeTabById = useTabServiceStore().use.closeTabById();

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
      activeKey={activeTabId?.toString()}
      onChange={(key) => {
        const tabId = parseInt(key);
        setActiveTabId(tabId);
        const sourceId = tabs.get(tabId).getState().sourceId;
        console.log("!!!debug", "keyy", key, sourceId);
        window.history.pushState({}, "", `api-client/collection/${sourceId}`);
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
