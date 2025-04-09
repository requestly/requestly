import React, { useEffect, useMemo, useRef } from "react";
import { Tabs, TabsProps } from "antd";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { Outlet, unstable_useBlocker } from "react-router-dom";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/clientView/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { useSetUrl } from "../hooks/useSetUrl";
import PATHS from "config/constants/sub/paths";
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
  ]);

  const isInitialLoadRef = useRef(true);
  const matchedTabSource = useMatchedTabSource();
  const { setUrl } = useSetUrl();

  const hasUnsavedChanges = Array.from(tabs.values()).some((tab) => tab.getState().unsaved);

  unstable_useBlocker(({ nextLocation }) => {
    const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");
    const shouldBlock = !isNextLocationApiClientView && hasUnsavedChanges;

    if (isNextLocationApiClientView) {
      return false;
    }

    if (shouldBlock) {
      const shouldDiscardChanges = window.confirm("Discard changes? Changes you made will not be saved.");
      const blockNavigation = !shouldDiscardChanges;
      return blockNavigation;
    }

    return false;
  });

  useEffect(() => {
    if (!matchedTabSource) {
      return;
    }

    openTab(matchedTabSource.sourceFactory(matchedTabSource.matchedPath));
  }, [matchedTabSource, openTab]);

  useEffect(() => {
    if (activeTabSource) {
      const newPath = activeTabSource.getUrlPath();
      if (newPath !== window.location.pathname) {
        setUrl(newPath, isInitialLoadRef.current);
      }
    } else {
      setUrl(PATHS.API_CLIENT.ABSOLUTE, isInitialLoadRef.current);
    }

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [activeTabSource, setUrl]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    return Array.from(tabs.values()).map((tabStore) => {
      const tabState = tabStore.getState();
      return {
        key: tabState.id.toString(),
        closable: false,
        label: (
          <div
            title={tabState.title}
            className="tab-title-container"
            onDoubleClick={() => {
              if (tabState.preview) {
                tabState.setPreview(false);
                incrementVersion();
                resetPreviewTab();
              }
            }}
          >
            <div className="tab-title">
              {<div className="icon">{tabState.source.getIcon()}</div>}
              <div className="title">{tabState.preview ? <i>{tabState.title}</i> : tabState.title}</div>
            </div>

            <div className="tab-actions">
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
              {tabState.unsaved ? <div className="unsaved-changes-indicator" /> : null}
            </div>
          </div>
        ),
        children: <TabItem store={tabStore}>{tabState.source.render()}</TabItem>,
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
        activeKey={activeTabId?.toString()}
        className="tabs-content"
        popupClassName="tabs-content-more-dropdown"
        onChange={(key) => {
          setActiveTab(parseInt(key));
        }}
        onEdit={(key, action) => {
          if (action === "add") {
            openTab(new DraftRequestContainerTabSource());
          }
        }}
      />
    </div>
  );
};
