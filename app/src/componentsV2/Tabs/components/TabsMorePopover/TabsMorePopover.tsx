import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Input, List, Tooltip } from "antd";
import type { InputRef } from "antd";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./tabsMorePopover.scss";
import { TabsEmptyState } from "../TabsEmptyState";
import { CloseAllTabsButton } from "../CloseAllTabsButton/CloseAllTabsButton";
import { RQButton } from "lib/design-system-v2/components";
import {
  useTabActions,
  useTabs,
  useTabTitle,
  useIsTabDirty,
  BufferModeTab,
  getTabBufferedEntity,
} from "componentsV2/Tabs/slice";
import { TabState, TabId } from "componentsV2/Tabs/slice/types";
import { getIsBuffersDirty } from "componentsV2/Tabs/slice/utils";

interface TabsMorePopoverProps {
  onTabItemClick: (id: TabId) => void;
}

const NonBufferedTabListItem: React.FC<{
  tab: TabState;
  onTabClick: (id: TabId) => void;
  onCloseTab: (id: TabId) => void;
}> = ({ tab, onTabClick, onCloseTab }) => {
  const title = tab.source.getDefaultTitle();

  return (
    <List.Item className="tabs-ops-item" onClick={() => onTabClick(tab.id)}>
      <div className="tab-ops-item-container">
        {title.length > 30 ? (
          <Tooltip title={title} overlayClassName="tab-title-tooltip" placement="top" showArrow={false}>
            <span className="tab-ops-item-title">{title}</span>
          </Tooltip>
        ) : (
          <span className="tab-ops-item-title">{title}</span>
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
      </div>
    </List.Item>
  );
};

const BufferedTabListItem: React.FC<{
  tab: BufferModeTab;
  onTabClick: (id: TabId) => void;
  onCloseTab: (id: TabId) => void;
}> = ({ tab, onTabClick, onCloseTab }) => {
  const title = useTabTitle(tab);
  const isDirty = useIsTabDirty(tab);

  return (
    <List.Item className="tabs-ops-item" onClick={() => onTabClick(tab.id)}>
      <div className="tab-ops-item-container">
        {title.length > 30 ? (
          <Tooltip title={title} overlayClassName="tab-title-tooltip" placement="top" showArrow={false}>
            <span className="tab-ops-item-title">{title}</span>
          </Tooltip>
        ) : (
          <span className="tab-ops-item-title">{title}</span>
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
        {isDirty ? <div className="unsaved-changes-indicator" /> : null}
      </div>
    </List.Item>
  );
};

export const TabsMorePopover: React.FC<TabsMorePopoverProps> = ({ onTabItemClick }) => {
  const { closeTab, closeAllTabs } = useTabActions();

  const closeAllOpenTabs = (mode: string) => {
    if (mode === "force") {
      closeAllTabs({ skipUnsavedPrompt: true }); // Skip unsaved prompt when closing all tabs
    } else {
      closeAllTabs({ skipUnsavedPrompt: false }); // Normal close all tabs
    }
  };

  const [query, setQuery] = useState("");
  const inputRef = useRef<InputRef>(null);
  const tabs = useTabs();

  const getTabTitleForFilter = useCallback((tab: TabState): string => {
    if (tab.modeConfig.mode === "buffer") {
      try {
        const { entity, store } = getTabBufferedEntity(tab as BufferModeTab);
        return entity.getName(store.getState());
      } catch {
        return tab.source.getDefaultTitle();
      }
    }

    return tab.source.getDefaultTitle();
  }, []);

  const filteredTabs = useMemo(
    () =>
      tabs.filter((tab) => {
        if (!query) return true;
        return getTabTitleForFilter(tab).toLowerCase().includes(query.toLowerCase());
      }),
    [tabs, query, getTabTitleForFilter]
  );

  const unSavedTabsCount = useMemo(() => {
    return tabs.filter((tab) => {
      if (tab.modeConfig.mode !== "buffer") {
        return false;
      }

      try {
        const { primaryBuffer, secondaryBuffers } = getTabBufferedEntity(tab as BufferModeTab);
        return getIsBuffersDirty({ primaryBuffer, secondaryBuffers });
      } catch {
        return false;
      }
    }).length;
  }, [tabs]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onClearFilter = () => {
    setQuery("");
  };

  const handleCloseTab = useCallback(
    (tabId: TabId) => {
      closeTab({ tabId });
    },
    [closeTab]
  );

  return (
    <div className="tabs-operations-popover-content">
      <div className="opened-tabs-header">
        <div className="header-left-section">
          <span className="opened-tabs-title">Opened tabs</span>
          <span className="opened-tabs-count">・{tabs.length}</span>
        </div>
        <CloseAllTabsButton unSavedTabsCount={unSavedTabsCount} closeAllOpenTabs={closeAllOpenTabs} />
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
        dataSource={filteredTabs}
        className="tabs-popover-list"
        renderItem={(tab) =>
          tab.modeConfig.mode === "buffer" ? (
            <BufferedTabListItem
              key={tab.id}
              tab={tab as BufferModeTab}
              onTabClick={onTabItemClick}
              onCloseTab={handleCloseTab}
            />
          ) : (
            <NonBufferedTabListItem key={tab.id} tab={tab} onTabClick={onTabItemClick} onCloseTab={handleCloseTab} />
          )
        }
        locale={{
          emptyText: <TabsEmptyState onClearFilter={onClearFilter} />,
        }}
      />
    </div>
  );
};
