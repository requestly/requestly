import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { Outlet, unstable_useBlocker } from "react-router-dom";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { useSetUrl } from "../hooks/useSetUrl";
import PATHS from "config/constants/sub/paths";
import { trackTabReordered } from "modules/analytics/events/misc/apiClient";
import { Typography } from "antd";
import "./tabsContainer.scss";
import { TabState } from "../store/tabStore";
import { StoreApi } from "zustand";

interface TabItemProps {
  tabId: number;
  index: number;
  moveTab: (fromIndex: number, toIndex: number) => void;
  tabStore: StoreApi<TabState>;
  setActiveTab: (tabId: number) => void;
  closeTabById: (tabId: number, skipUnsavedPrompt?: boolean) => void;
  incrementVersion: () => void;
  resetPreviewTab: () => void;
  activeTabId?: number;
}

const TabItemComponent: React.FC<TabItemProps> = ({
  tabId,
  index,
  moveTab,
  tabStore,
  setActiveTab,
  closeTabById,
  incrementVersion,
  resetPreviewTab,
  activeTabId,
}) => {
  const tabState = tabStore.getState();
  const [{ isDragging }, drag] = useDrag({
    type: "tab",
    item: { tabId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "tab",
    hover: (item: { tabId: number; index: number }) => {
      if (item.index !== index) {
        moveTab(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <li
      id={`tab-${tabId}`}
      ref={(node) => drag(drop(node))}
      className={`ant-tabs-tab tab-item ${tabId === activeTabId ? "ant-tabs-tab-active" : ""} ${
        isDragging ? "dragging" : ""
      }`}
      role="tab"
      aria-selected={tabId === activeTabId}
      aria-controls={`tabpanel-${tabId}`}
      tabIndex={0}
      onClick={() => setActiveTab(tabId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActiveTab(tabId);
        }
      }}
    >
      <div
        className="tab-title-container"
        onDoubleClick={() => {
          if (tabState.preview) {
            tabState.setPreview(false);
            incrementVersion();
            resetPreviewTab();
            setActiveTab(tabId);
          }
        }}
      >
        <div className="tab-title ant-tabs-tab-btn">
          {tabState.icon && <div className="icon">{tabState.icon}</div>}
          <Typography.Text
            ellipsis={{
              tooltip: { title: tabState.title, placement: "bottom", color: "#000", mouseEnterDelay: 0.5 },
            }}
            className="title"
          >
            {tabState.preview ? <i>{tabState.title}</i> : tabState.title}
          </Typography.Text>
        </div>
        <div className="tab-actions">
          {tabState.closable && (
            <RQButton
              size="small"
              type="transparent"
              className="tab-close-button"
              onClick={(e) => {
                e.stopPropagation();
                closeTabById(tabState.id);
              }}
              icon={<MdClose />}
            />
          )}
          {tabState.unsaved ? <div className="unsaved-changes-indicator" /> : null}
        </div>
      </div>
    </li>
  );
};

export const TabsContainer: React.FC = () => {
  const [
    activeTabId,
    activeTabSource,
    setActiveTab,
    tabs,
    _version,
    openTab,
    closeTabById,
    incrementVersion,
    resetPreviewTab,
    consumeIgnorePath,
    cleanupCloseBlockers,
    getTabIdBySource,
    setTabs,
  ] = useTabServiceWithSelector((state) => [
    state.activeTabId,
    state.activeTabSource,
    state.setActiveTab,
    state.tabs,
    state._version,
    state.openTab,
    state.closeTabById,
    state.incrementVersion,
    state.resetPreviewTab,
    state.consumeIgnorePath,
    state.cleanupCloseBlockers,
    state.getTabIdBySource,
    state.setTabs,
  ]);

  const { setUrl } = useSetUrl();

  const hasUnsavedChanges = Array.from(tabs.values()).some(
    (tab) => tab.getState().unsaved || !tab.getState().canCloseTab()
  );

  useEffect(() => {
    const unloadListener = (e: any) => {
      e.preventDefault();
      e.returnValue = "Are you sure?";
    };
    if (hasUnsavedChanges) window.addEventListener("beforeunload", unloadListener);
    return () => window.removeEventListener("beforeunload", unloadListener);
  }, [hasUnsavedChanges]);

  unstable_useBlocker(({ nextLocation }) => {
    const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");
    const shouldBlock = !isNextLocationApiClientView && hasUnsavedChanges;
    if (isNextLocationApiClientView) return false;
    if (shouldBlock) {
      const blockedTab = Array.from(tabs.values()).find((t) => t.getState().getActiveBlocker());
      const blocker = blockedTab?.getState().getActiveBlocker();
      const shouldDiscardChanges = window.confirm(
        blocker?.details?.title || "Discard changes? Changes you made will not be saved."
      );
      const blockNavigation = !shouldDiscardChanges;
      if (!blockNavigation) cleanupCloseBlockers();
      return blockNavigation;
    }
    return false;
  });

  const matchedTabSource = useMatchedTabSource();
  useEffect(() => {
    const ignorePath = consumeIgnorePath();
    if (!matchedTabSource || ignorePath) return;

    const source = matchedTabSource.sourceFactory(matchedTabSource.matchedPath);
    const existingTabId = getTabIdBySource(source.getSourceId(), source.getSourceName());
    if (!existingTabId) {
      openTab(source);
    } else {
      setActiveTab(existingTabId);
    }
  }, [matchedTabSource, openTab, consumeIgnorePath, getTabIdBySource, setActiveTab]);

  const isInitialLoadRef = useRef(true);
  useEffect(() => {
    if (activeTabSource) {
      const newPath = activeTabSource.getUrlPath();
      if (newPath !== window.location.pathname + window.location.search) {
        setUrl(newPath, isInitialLoadRef.current);
      }
      if (isInitialLoadRef.current) isInitialLoadRef.current = false;
    } else {
      setUrl(PATHS.API_CLIENT.ABSOLUTE, isInitialLoadRef.current);
    }
  }, [activeTabSource, setUrl]);

  const moveTab = useCallback(
    (fromIndex: number, toIndex: number) => {
      const tabIds = Array.from(tabs.keys());
      const [moved] = tabIds.splice(fromIndex, 1);
      tabIds.splice(toIndex, 0, moved);

      const newTabs = new Map();
      tabIds.forEach((id) => newTabs.set(id, tabs.get(id)));

      setTabs(newTabs);
      sessionStorage.setItem("rq-api-client-tabs-order", JSON.stringify(tabIds));
      trackTabReordered(tabIds);
    },
    [tabs, setTabs]
  );

  const tabItems = useMemo(() => {
    return Array.from(tabs.entries()).map(([tabId, tabStore], index) => {
      const tabState = tabStore.getState();
      return {
        key: tabState.id.toString(),
        tabId,
        label: (
          <TabItemComponent
            tabId={tabId}
            index={index}
            moveTab={moveTab}
            tabStore={tabStore}
            setActiveTab={setActiveTab}
            closeTabById={closeTabById}
            incrementVersion={incrementVersion}
            resetPreviewTab={resetPreviewTab}
            activeTabId={activeTabId}
          />
        ),
        children: <TabItem store={tabStore}>{tabState.source.render()}</TabItem>,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, moveTab, setActiveTab, closeTabById, incrementVersion, resetPreviewTab, activeTabId, _version]);

  return tabs.size === 0 ? (
    <div className="tabs-outlet-container">
      <Outlet />
    </div>
  ) : (
    <div className="tabs-container">
      <DndProvider backend={HTML5Backend}>
        <ul className="ant-tabs tabs-content" role="tablist">
          {tabItems.map((item) => (
            <React.Fragment key={item.tabId}>{item.label}</React.Fragment>
          ))}
          <li className="ant-tabs-nav-add">
            <RQButton
              type="transparent"
              size="small"
              className="add-tab-button"
              onClick={() => openTab(new DraftRequestContainerTabSource())}
              icon={<span>+</span>}
            />
          </li>
        </ul>
      </DndProvider>
      <div className="tabs-outlet-container" id={`tabpanel-${activeTabId}`} role="tabpanel">
        {tabItems.find((item) => item.key === activeTabId?.toString())?.children || <Outlet />}
      </div>
    </div>
  );
};
