import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { Dropdown, MenuProps, Popover, Tabs, TabsProps, Typography } from "antd";
import PATHS from "config/constants/sub/paths";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { useCloseActiveTabShortcut } from "hooks/useCloseActiveTabShortcut";
import { RQButton } from "lib/design-system-v2/components";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, unstable_useBlocker } from "react-router-dom";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { useSetUrl } from "../hooks/useSetUrl";
import { TabItem } from "./TabItem";
import "./tabsContainer.scss";
import { TabsMorePopover } from "./TabsMorePopover";
import {
  useActiveTabId,
  useTabActions,
  useTabs,
  useIsTabDirty,
  usePreviewTabId,
  BufferModeTab,
  useTabTitle,
} from "../slice";
import { TabState } from "../slice/types";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";
import { RQAPI } from "features/apiClient/types";
import { getHasActiveWorkflows, getHasAnyUnsavedChanges } from "../slice/utils";

interface BufferedTabLabelProps {
  tab: BufferModeTab;
  onClose: () => void;
  onDoubleClick: () => void;
}

const BufferedTabLabel: React.FC<BufferedTabLabelProps> = ({ tab, onClose, onDoubleClick }) => {
  const isDirty = useIsTabDirty(tab);
  const title = useTabTitle(tab);
  const previewTabId = usePreviewTabId();
  const isPreview = tab.id === previewTabId;

  return (
    <div className="tab-title-container" onDoubleClick={onDoubleClick}>
      <div className="tab-title">
        <div className="icon">{tab.source.getIcon()}</div>
        <Typography.Text
          key={tab.source.getSourceId()}
          ellipsis={{
            tooltip: {
              title,
              placement: "bottom",
              color: "#000",
              mouseEnterDelay: 0.5,
            },
          }}
          className="title"
        >
          {isPreview ? <i>{title}</i> : title}
        </Typography.Text>
      </div>

      <div className="tab-actions">
        <RQButton
          size="small"
          type="transparent"
          className="tab-close-button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          icon={<MdClose />}
        />
        {isDirty && <div className="unsaved-changes-indicator" />}
      </div>
    </div>
  );
};

interface TabLabelProps {
  tab: TabState;
  onClose: () => void;
  onDoubleClick: () => void;
}

const NonBufferedTabLabel: React.FC<TabLabelProps> = ({ tab, onClose, onDoubleClick }) => {
  const displayTitle = tab.source.getDefaultTitle();
  const previewTabId = usePreviewTabId();
  const isPreview = tab.id === previewTabId;

  return (
    <div className="tab-title-container" onDoubleClick={onDoubleClick}>
      <div className="tab-title">
        <div className="icon">{tab.source.getIcon()}</div>
        <Typography.Text
          ellipsis={{
            tooltip: {
              title: displayTitle,
              placement: "bottom",
              color: "#000",
              mouseEnterDelay: 0.5,
            },
          }}
          className="title"
        >
          {isPreview ? <i>{displayTitle}</i> : displayTitle}
        </Typography.Text>
      </div>

      <div className="tab-actions">
        <RQButton
          size="small"
          type="transparent"
          className="tab-close-button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          icon={<MdClose />}
        />
      </div>
    </div>
  );
};

const TabLabel: React.FC<TabLabelProps> = ({ tab, onClose, onDoubleClick }) => {
  if (tab.modeConfig.mode === "buffer") {
    return <BufferedTabLabel tab={tab as BufferModeTab} onClose={onClose} onDoubleClick={onDoubleClick} />;
  }

  return <NonBufferedTabLabel tab={tab} onClose={onClose} onDoubleClick={onDoubleClick} />;
};

export const TabsContainer: React.FC = () => {
  const tabs = useTabs();
  const activeTabId = useActiveTabId();
  const previewTabId = usePreviewTabId();
  const { closeTab, closeAllTabs, setActiveTab, openBufferedTab, setPreviewTab } = useTabActions();
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false);

  useCloseActiveTabShortcut();

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
    [isMorePopoverOpen, onTabItemClick]
  );

  // Reset popover state when no tabs are present
  useEffect(() => {
    if (tabs.length === 0 && isMorePopoverOpen) {
      setIsMorePopoverOpen(false);
    }
  }, [tabs.length, isMorePopoverOpen]);

  useEffect(() => {
    const unloadListener = (e: any) => {
      const hasActiveWorkflows = getHasActiveWorkflows();
      const hasUnsavedChanges = getHasAnyUnsavedChanges();

      if (hasUnsavedChanges || hasActiveWorkflows) {
        e.preventDefault();
        e.returnValue = "Are you sure?";
      }
    };

    window.addEventListener("beforeunload", unloadListener);

    return () => window.removeEventListener("beforeunload", unloadListener);
  }, []);

  unstable_useBlocker(({ nextLocation }) => {
    const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");

    if (isNextLocationApiClientView) {
      return false;
    }

    const hasUnsavedChanges = getHasAnyUnsavedChanges();
    if (hasUnsavedChanges) {
      const shouldDiscardChanges = window.confirm("Discard changes? Changes you made will not be saved.");
      return !shouldDiscardChanges;
    }

    const tabWithWorkflow = tabs.find((t) => t.activeWorkflows.size > 0);
    if (tabWithWorkflow) {
      const firstWorkflow = tabWithWorkflow?.activeWorkflows.values().next().value;
      const shouldDiscardChanges = window.confirm(
        firstWorkflow?.cancelWarning || "Discard changes? Changes you made will not be saved."
      );

      return !shouldDiscardChanges;
    }

    return false;
  });

  const matchedTabSource = useMatchedTabSource();
  useEffect(() => {
    if (!matchedTabSource) {
      return;
    }

    const source = matchedTabSource.sourceFactory(matchedTabSource.matchedPath);

    openBufferedTab({
      source,
      singleton: matchedTabSource.route.singleton,
    });
  }, [matchedTabSource, openBufferedTab]);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeTabSource = activeTab?.source;

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

  const tabItems: TabsProps["items"] = useMemo(() => {
    return tabs.map((tab, index) => {
      const handleCloseTabsToLeft = async () => {
        const tabsToClose = tabs.slice(0, index);
        for (const t of tabsToClose) {
          await closeTab({ tabId: t.id });
        }
      };

      const handleCloseTabsToRight = async () => {
        const tabsToClose = tabs.slice(index + 1);
        for (const t of tabsToClose) {
          await closeTab({ tabId: t.id });
        }
      };

      const handleCloseAllTabs = () => {
        closeAllTabs({ skipUnsavedPrompt: true });
      };

      const contextMenuItems: MenuProps["items"] = [
        {
          key: "close-left",
          label: "Close Tabs to the Left",
          onClick: handleCloseTabsToLeft,
          disabled: index === 0,
        },
        {
          key: "close-right",
          label: "Close Tabs to the Right",
          onClick: handleCloseTabsToRight,
          disabled: index === tabs.length - 1,
        },
        {
          type: "divider",
        },
        {
          key: "close-all",
          label: "Close All Tabs",
          onClick: handleCloseAllTabs,
        },
      ];

      const handleDoubleClick = () => {
        if (tab.id === previewTabId) {
          setPreviewTab(undefined);
        }
      };

      return {
        key: tab.id.toString(),
        closable: false,
        label: (
          <Dropdown menu={{ items: contextMenuItems }} trigger={["contextMenu"]}>
            <TabLabel tab={tab} onClose={() => closeTab({ tabId: tab.id })} onDoubleClick={handleDoubleClick} />
          </Dropdown>
        ),
        children: <TabItem tabId={tab.id}>{tab.source.render()}</TabItem>,
      };
    });
  }, [tabs, closeTab, closeAllTabs, previewTabId, setPreviewTab]);

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
            openBufferedTab({
              source: new DraftRequestContainerTabSource({
                apiEntryType: RQAPI.ApiEntryType.HTTP,
                emptyRecord: getEmptyDraftApiRecord(RQAPI.ApiEntryType.HTTP),
                context: {},
              }),
              isNew: true,
              preview: false,
            });
          }
        }}
      />
    </div>
  );
};
