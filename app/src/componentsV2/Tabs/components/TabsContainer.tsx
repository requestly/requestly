import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { TabItemComponent } from "./TabItemComponent";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { Outlet, unstable_useBlocker } from "react-router-dom";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RQButton } from "lib/design-system-v2/components";
import { useSetUrl } from "../hooks/useSetUrl";
import PATHS from "config/constants/sub/paths";
import { trackTabReordered } from "modules/analytics/events/misc/apiClient";
import "./tabsContainer.scss";

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
      <div
        className="tabs-outlet-container"
        id={`tabpanel-${activeTabId}`}
        role="tabpanel"
        aria-labelledby={activeTabId != null ? `tab-${activeTabId}` : undefined}
      >
        {tabItems.find((item) => item.key === activeTabId?.toString())?.children || <Outlet />}
      </div>
    </div>
  );
};
