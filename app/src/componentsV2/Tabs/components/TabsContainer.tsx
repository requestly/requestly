import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsProps, Typography, Popover } from "antd";
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
import { TabsMorePopover } from "./TabsMorePopover";
import { useActiveTabId, useTabActions, useTabs } from "../slice";

export const TabsContainer: React.FC = () => {
  // Enable keyboard shortcuts for closing active tabs
  useCloseActiveTabShortcut();

  const tabs = useTabs();
  const activeTabId = useActiveTabId();
  const { closeTab, setActiveTab } = useTabActions();
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false);

  /**
   *
   */

  // const [
  //   activeTabId,
  //   activeTabSource,
  //   setActiveTab,
  //   tabs,
  //   _version,
  //   openTab,
  //   closeTabById,
  //   incrementVersion,
  //   resetPreviewTab,
  //   consumeIgnorePath,
  //   cleanupCloseBlockers,
  // ] = useTabServiceWithSelector((state) => [
  //   state.activeTabId,
  //   state.activeTabSource,
  //   state.setActiveTab,
  //   state.tabs,
  //   state._version,
  //   state.openTab,
  //   state.closeTabById,
  //   state.incrementVersion,
  //   state.resetPreviewTab,
  //   state.consumeIgnorePath,
  //   state.cleanupCloseBlockers,
  // ]);

  const { setUrl } = useSetUrl();

  const onTabItemClick = useCallback(
    (id: string) => {
      setActiveTab(id);
      setIsMorePopoverOpen(false);
    },
    [setActiveTab]
  );

  const operations = useMemo(
    () => (
      <Popover
        trigger="click"
        placement="topRight"
        overlayClassName="tabs-operations-popover"
        destroyTooltipOnHide
        content={<TabsMorePopover onTabItemClick={onTabItemClick} />}
        open={isMorePopoverOpen}
        onOpenChange={setIsMorePopoverOpen}
      >
        <div className={`tabs-more-icon ${isMorePopoverOpen ? "tabs-more-icon-open" : ""}`}>
          <IoIosArrowDown />
        </div>
      </Popover>
    ),
    [tabs, isMorePopoverOpen, onTabItemClick]
  );

  // Reset popover state when no tabs are present
  useEffect(() => {
    if (tabs.length === 0 && isMorePopoverOpen) {
      setIsMorePopoverOpen(false);
    }
  }, [tabs.length, isMorePopoverOpen]);

  // const hasUnsavedChanges = Array.from(tabs.values()).some(
  //   (tab) => tab.getState().unsaved || !tab.getState().canCloseTab()
  // );

  // useEffect(() => {
  //   const unloadListener = (e: any) => {
  //     e.preventDefault();
  //     e.returnValue = "Are you sure?";
  //   };

  //   if (hasUnsavedChanges) {
  //     window.addEventListener("beforeunload", unloadListener);
  //   }

  //   return () => window.removeEventListener("beforeunload", unloadListener);
  // }, [hasUnsavedChanges]);

  // unstable_useBlocker(({ nextLocation }) => {
  //   const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");
  //   const shouldBlock = !isNextLocationApiClientView && hasUnsavedChanges;

  //   if (isNextLocationApiClientView) {
  //     return false;
  //   }

  //   if (shouldBlock) {
  //     const blockedTab = Array.from(tabs.values()).find((t) => t.getState().getActiveBlocker());
  //     const blocker = blockedTab?.getState().getActiveBlocker();
  //     const shouldDiscardChanges = window.confirm(
  //       blocker?.details?.title || "Discard changes? Changes you made will not be saved."
  //     );

  //     const blockNavigation = !shouldDiscardChanges;
  //     if (!blockNavigation) {
  //       cleanupCloseBlockers();
  //     }
  //     return blockNavigation;
  //   }

  //   return false;
  // });

  // const matchedTabSource = useMatchedTabSource();
  // useEffect(() => {
  //   const ignorePath = consumeIgnorePath();
  //   if (!matchedTabSource || ignorePath) {
  //     return;
  //   }

  //   openTab(matchedTabSource.sourceFactory(matchedTabSource.matchedPath));
  // }, [matchedTabSource, openTab, consumeIgnorePath]);

  // const isInitialLoadRef = useRef(true);
  // useEffect(() => {
  //   if (activeTabSource) {
  //     const newPath = activeTabSource.getUrlPath();

  //     if (newPath !== window.location.pathname + window.location.search) {
  //       setUrl(newPath, isInitialLoadRef.current);
  //     }

  //     if (isInitialLoadRef.current) {
  //       isInitialLoadRef.current = false;
  //     }
  //   } else {
  //     setUrl(PATHS.API_CLIENT.ABSOLUTE, isInitialLoadRef.current);
  //   }
  // }, [activeTabSource, setUrl]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    return tabs.map((tab) => {
      // const tabState = tabStore.getState();
      return {
        key: tab.id,
        closable: false,
        label: (
          <div
            className="tab-title-container"
            onDoubleClick={() => {
              // if (tabState.preview) {
              //   tabState.setPreview(false);
              //   incrementVersion();
              //   resetPreviewTab();
              // }
            }}
          >
            <div className="tab-title">
              {/* {<div className="icon">{tabState.icon}</div>} */}
              {<div className="icon">ICON</div>}
              {/* <Typography.Text
                ellipsis={{
                  tooltip: {
                    title: tabStatetab.title,
                    placement: "bottom",
                    color: "#000",
                    mouseEnterDelay: 0.5,
                  },
                }}
                className="title"
              >
                {tabState.preview ? <i>{tabState.title}</i> : tabState.title}
              </Typography.Text> */}
            </div>

            <div className="tab-actions">
              <RQButton
                size="small"
                type="transparent"
                className="tab-close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab({ tabId: tab.id });
                }}
                icon={<MdClose />}
              />
              {/* {tabState.unsaved ? <div className="unsaved-changes-indicator" /> : null} */}
              Unsaved changes
            </div>
          </div>
        ),
        children: <TabItem tabId={tab.id}>{tab.source.render()}</TabItem>,
      };
    });
    // We need _version in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  return tabItems.length === 0 ? (
    <div className="tabs-outlet-container">
      <Outlet />
    </div>
  ) : (
    <div className="tabs-container">
      <Tabs
        type="editable-card"
        tabBarExtraContent={operations}
        items={tabItems}
        activeKey={activeTabId}
        className="tabs-content"
        popupClassName="tabs-content-more-dropdown"
        size="small"
        onChange={(key) => {
          setActiveTab(key.toString());
        }}
        onEdit={(key, action) => {
          if (action === "add") {
            // openTab(new DraftRequestContainerTabSource());
          }
        }}
      />
    </div>
  );
};
