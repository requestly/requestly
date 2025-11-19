import React, { useEffect, useMemo, useRef } from "react";
import { Tabs, TabsProps, Typography } from "antd";
import { useTabServiceWithSelector } from "../store/tabServiceStore";
import { TabItem } from "./TabItem";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { Outlet, unstable_useBlocker } from "react-router-dom";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useSetUrl } from "../hooks/useSetUrl";
import PATHS from "config/constants/sub/paths";
import { useCloseActiveTabShortcut } from "hooks/useCloseActiveTabShortcut";
import "./tabsContainer.scss";

export const TabsContainer: React.FC = () => {
  // Enable keyboard shortcuts for closing active tabs
  useCloseActiveTabShortcut();

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  // Ref to store the previous number of tabs
  const prevTabCountRef = useRef(0);

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

    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", unloadListener);
    }

    return () => window.removeEventListener("beforeunload", unloadListener);
  }, [hasUnsavedChanges]);

  unstable_useBlocker(({ nextLocation }) => {
    const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");
    const shouldBlock = !isNextLocationApiClientView && hasUnsavedChanges;

    if (isNextLocationApiClientView) {
      return false;
    }

    if (shouldBlock) {
      const blockedTab = Array.from(tabs.values()).find((t) => t.getState().getActiveBlocker());
      const blocker = blockedTab?.getState().getActiveBlocker();
      const shouldDiscardChanges = window.confirm(
        blocker?.details?.title || "Discard changes? Changes you made will not be saved."
      );

      const blockNavigation = !shouldDiscardChanges;
      if (!blockNavigation) {
        cleanupCloseBlockers();
      }
      return blockNavigation;
    }

    return false;
  });

  const matchedTabSource = useMatchedTabSource();
  useEffect(() => {
    const ignorePath = consumeIgnorePath();
    if (!matchedTabSource || ignorePath) {
      return;
    }

    openTab(matchedTabSource.sourceFactory(matchedTabSource.matchedPath));
  }, [matchedTabSource, openTab, consumeIgnorePath]);

  const isInitialLoadRef = useRef(true);
  useEffect(() => {
    if (activeTabSource) {
      const newPath = activeTabSource.getUrlPath();

      if (newPath !== window.location.pathname + window.location.search) {
        setUrl(newPath, isInitialLoadRef.current);
      }

      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    } else {
      setUrl(PATHS.API_CLIENT.ABSOLUTE, isInitialLoadRef.current);
    }
  }, [activeTabSource, setUrl]);

  useEffect(() => {
    const currentTabCount = tabs.size;
    const prevTabCount = prevTabCountRef.current;
    prevTabCountRef.current = currentTabCount;
    if (!tabsContainerRef.current || currentTabCount <= prevTabCount) return;

    const navWrap = tabsContainerRef.current.querySelector<HTMLElement>(".ant-tabs-nav-wrap");
    if (!navWrap) return;

    const maxVisibleTabs = Math.floor(navWrap.clientWidth / 135);
    if (currentTabCount < maxVisibleTabs) return;

    const timeoutId = setTimeout(() => {
      const navListElement = tabsContainerRef.current?.querySelector<HTMLDivElement>(".ant-tabs-nav-list");
      if (!navListElement) return;

      const currentX = (() => {
        const match = navListElement.style.transform.match(/translate\(([-+]?\d+)px,\s*([-+]?\d+)px\)/);
        return match?.[1] ? parseInt(match[1], 10) : 0;
      })();

      navListElement.style.transform = `translate(${currentX - 160}px, 0px)`;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [tabs.size]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    return Array.from(tabs.values()).map((tabStore) => {
      const tabState = tabStore.getState();
      return {
        key: tabState.id.toString(),
        closable: false,
        label: (
          <div
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
              {<div className="icon">{tabState.icon}</div>}
              <Typography.Text
                ellipsis={{
                  tooltip: {
                    title: tabState.title,
                    placement: "bottom",
                    color: "#000",
                    mouseEnterDelay: 0.5,
                  },
                }}
                className="title"
              >
                {tabState.preview ? <i>{tabState.title}</i> : tabState.title}
              </Typography.Text>
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
    <div className="tabs-outlet-container">
      <Outlet />
    </div>
  ) : (
    <div className="tabs-container" ref={tabsContainerRef}>
      <Tabs
        type="editable-card"
        items={tabItems}
        activeKey={activeTabId?.toString()}
        className="tabs-content"
        popupClassName="tabs-content-more-dropdown"
        moreIcon={<IoIosArrowDown />}
        size="small"
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
