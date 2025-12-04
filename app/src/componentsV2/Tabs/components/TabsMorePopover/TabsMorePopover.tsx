import React, { useState, useRef, useEffect, useMemo } from "react";
import { Input, List, Tooltip } from "antd";
import type { InputRef } from "antd";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./tabsMorePopover.scss";
import { TabsEmptyState } from "../TabsEmptyState";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { CloseAllTabsButton } from "../CloseAllTabsButton/CloseAllTabsButton";
import { RQButton } from "lib/design-system-v2/components";
interface TabsMorePopoverProps {
  onTabItemClick: (id: number) => void;
  onCloseTab: (id: number) => void;
  closeAllOpenTabs: (type: string) => void;
}

export const TabsMorePopover: React.FC<TabsMorePopoverProps> = ({ onTabItemClick, onCloseTab, closeAllOpenTabs }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<InputRef>(null);
  const tabs = useTabServiceWithSelector((state) => state.tabs);
  const tabList = useMemo(() => {
    return Array.from(tabs.values()).map((t) => t.getState());
  }, [tabs.size]);

  const filtered = tabList.filter((tab) => (tab.title ?? "").toLowerCase().includes(query.toLowerCase()));
  const unSavedTabs = useMemo(() => {
    return tabList.filter((tab) => tab.unsaved);
  }, [tabList]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onClearFilter = () => {
    setQuery("");
  };

  return (
    <div className="tabs-operations-popover-content">
      <div className="opened-tabs-header">
        <div className="header-left-section">
          <span className="opened-tabs-title">Opened tabs</span>
          <span className="opened-tabs-count">・{tabList?.length}</span>
        </div>
        <CloseAllTabsButton unSavedTabsCount={unSavedTabs?.length} closeAllOpenTabs={closeAllOpenTabs} />
      </div>
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
              {(tab.title ?? "Untitled").length > 30 ? (
                <Tooltip title={tab.title ?? "Untitled"} overlayClassName="tab-title-tooltip" placement="top">
                  <span className="tab-ops-item-title">{tab.title ?? "Untitled"}</span>
                </Tooltip>
              ) : (
                <span className="tab-ops-item-title">{tab.title ?? "Untitled"}</span>
              )}
            </div>

            <div className="tab-ops-item-actions">
              <RQButton
                size="small"
                type="transparent"
                className="tab-ops-item-close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                icon={<MdClose />}
              />
              {tab.unsaved ? <div className="unsaved-changes-indicator" /> : null}
            </div>
          </List.Item>
        )}
        locale={{
          emptyText: <TabsEmptyState onClearFilter={onClearFilter} />,
        }}
      />
    </div>
  );
};
