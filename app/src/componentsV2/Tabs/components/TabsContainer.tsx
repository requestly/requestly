import React, { useEffect, useMemo } from "react";
import { Tabs, TabsProps } from "antd";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { updateUrlPath } from "../utils";
import { Outlet } from "react-router-dom";
import "./tabsContainer.scss";

export const TabsContainer: React.FC = () => {
  const [activeTabId, setActiveTabId, tabs, _version, openTab, closeTabById, getSourceByTabId] =
    useTabServiceWithSelector((state) => [
      state.activeTabId,
      state.setActiveTabId,
      state.tabs,
      state._version,
      state.openTab,
      state.closeTabById,
      state.getSourceByTabId,
    ]);

  const matchedTabSource = useMatchedTabSource();

  useEffect(() => {
    if (!matchedTabSource) {
      return;
    }

    openTab(matchedTabSource.sourceFactory(matchedTabSource.matchedPath));
  }, [matchedTabSource, openTab]);

  useEffect(() => {
    if (activeTabId) {
      const tabSource = getSourceByTabId(activeTabId);
      const newPath = tabSource.getUrlPath();
      updateUrlPath(newPath);
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

  return tabItems.length === 0 ? (
    <Outlet />
  ) : (
    <div className="tabs-container">
      <Tabs
        type="editable-card"
        items={tabItems}
        activeKey={activeTabId.toString()}
        className="tabs-content"
        popupClassName="tabs-content-more-dropdown"
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
    </div>
  );
};
