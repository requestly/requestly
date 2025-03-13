import React, { useMemo } from "react";
import { Tabs, TabsProps } from "antd";
import { useTabService } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";

export const TabsContainer: React.FC = () => {
  const { activeTabId, setActiveTabId, tabs, _version, openTab, closeTabById } = useTabService();

  const tabItems: TabsProps["items"] = useMemo(() => {
    return Array.from(tabs.values()).map((tabStore) => {
      const tabState = tabStore.getState();
      return {
        tabVersion: _version,
        key: tabState.id.toString(),
        label: tabState.title,
        children: <TabItem store={tabStore}>{tabState.source.render()}</TabItem>,
        closable: true,
      };
    });
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
