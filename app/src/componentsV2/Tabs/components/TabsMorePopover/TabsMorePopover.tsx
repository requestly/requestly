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
  getTabBufferedEntity,
  useTabTitle,
  useIsTabDirty,
  BufferModeTab,
} from "componentsV2/Tabs/slice";
import { TabState, TabId } from "componentsV2/Tabs/slice/types";
import { getApiClientFeatureContext } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry/hooks";

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

  // Helper to get tab title for filtering (non-reactive, just for filtering)
  const getTabTitle = useCallback((tab: TabState): string => {
    if (tab.modeConfig.mode !== "buffer") {
      return tab.source.getDefaultTitle();
    }

    try {
      const workspaceId = tab.source.metadata.context?.id;
      if (!workspaceId) return tab.source.getDefaultTitle();

      const { store } = getApiClientFeatureContext(workspaceId);
      const { entity } = getTabBufferedEntity(tab as BufferModeTab);
      return entity.getName(store.getState()) || tab.source.getDefaultTitle();
    } catch {
      return tab.source.getDefaultTitle();
    }
  }, []);

  // Helper to check if tab is dirty (non-reactive, just for counting)
  const isTabDirty = useCallback((tab: TabState): boolean => {
    if (tab.modeConfig.mode !== "buffer") {
      return false;
    }

    try {
      const workspaceId = tab.source.metadata.context?.id;
      if (!workspaceId) return false;

      const { buffer } = getTabBufferedEntity(tab as BufferModeTab);
      return buffer.isDirty;
    } catch {
      return false;
    }
  }, []);

  const filteredTabs = useMemo(
    () => (query.trim() ? tabs.filter((tab) => getTabTitle(tab).toLowerCase().includes(query.toLowerCase())) : tabs),
    [tabs, query, getTabTitle]
  );

  const unSavedTabsCount = useMemo(() => {
    return tabs.filter(isTabDirty).length;
  }, [tabs, isTabDirty]);

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
