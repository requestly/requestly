import React, { useState, useRef, useEffect, useMemo } from "react";
import { Input, List, Tooltip } from "antd";
import type { InputRef } from "antd";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./tabsMorePopover.scss";
import { TabsEmptyState } from "../TabsEmptyState";
import { StoreApi } from "zustand";
import { TabState } from "componentsV2/Tabs/store/tabStore";

type TabStore = StoreApi<TabState>;
type TabId = number;

interface TabsMorePopoverProps {
  tabs: Map<TabId, TabStore>;
  onTabItemClick: (id: number) => void;
  onCloseTab: (id: number) => void;
  isOpen: boolean;
}

export const TabsMorePopover: React.FC<TabsMorePopoverProps> = ({ tabs, onTabItemClick, onCloseTab, isOpen }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<InputRef>(null);
  const tabList = Array.from(tabs.values()).map((t) => t.getState());
  const filtered = useMemo(() => {
    return tabList.filter((tab) => (tab.title ?? "").toLowerCase().includes(query.toLowerCase()));
  }, [tabList, query]);

  useEffect(() => {
    // Auto-focus the input and reset search query when the popover opens
    if (isOpen) {
      setQuery("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const onClearFilter = () => {
    setQuery("");
  };

  return (
    <div className="tabs-operations-popover-content">
      <Input
        ref={inputRef}
        size="small"
        className="tabs-search-input"
        placeholder="Search tabs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <List
        size="small"
        dataSource={filtered}
        className="tabs-popover-list"
        renderItem={(tab) => (
          <List.Item className="tabs-ops-item" onClick={() => onTabItemClick(tab.id)}>
            <div className="tab-ops-item-container">
              {tab.icon ?? null}
              {(tab.title ?? "Untitled").length > 20 ? (
                <Tooltip
                  title={tab.title ?? "Untitled"}
                  mouseEnterDelay={0.5}
                  overlayClassName="tab-title-tooltip"
                  placement="top"
                >
                  <span className="tab-ops-item-title">{tab.title ?? "Untitled"}</span>
                </Tooltip>
              ) : (
                <span className="tab-ops-item-title">{tab.title ?? "Untitled"}</span>
              )}
            </div>

            <MdClose
              size={14}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent selecting the tab when clicking close
                onCloseTab(tab.id);
              }}
              className="tab-ops-item-close"
            />
          </List.Item>
        )}
        locale={{
          emptyText: <TabsEmptyState onClearFilter={onClearFilter} />,
        }}
      />
    </div>
  );
};
