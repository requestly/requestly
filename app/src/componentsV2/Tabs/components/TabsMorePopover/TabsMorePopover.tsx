import React, { useState, useRef, useEffect } from "react";
import { Input, List, Tooltip } from "antd";
import type { InputRef } from "antd";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./tabsMorePopover.scss";
import { TabsEmptyState } from "../TabsEmptyState";

interface Tab {
  getState: () => { id: number; title: string; icon?: React.ReactNode };
}

interface TabsMorePopoverProps {
  tabs: Map<number, Tab>;
  setActiveTab: (id: number) => void;
  closeTabById: (id: number) => void;
}

export const TabsMorePopover: React.FC<TabsMorePopoverProps> = ({ tabs, setActiveTab, closeTabById }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<InputRef>(null);
  const tabList = Array.from(tabs.values()).map((t) => t.getState());
  const filtered = tabList.filter((tab) => (tab.title ?? "").toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    // Auto-focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
          <List.Item className="tabs-ops-item" onClick={() => setActiveTab(tab.id)}>
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
                closeTabById(tab.id);
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
