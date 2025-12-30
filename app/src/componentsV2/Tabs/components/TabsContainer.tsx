import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsProps, Typography, Popover } from "antd";
import { TabItem } from "./TabItem";
import { Outlet, unstable_useBlocker } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useSetUrl } from "../hooks/useSetUrl";
import { useCloseActiveTabShortcut } from "hooks/useCloseActiveTabShortcut";
import PATHS from "config/constants/sub/paths";
import "./tabsContainer.scss";
import { TabsMorePopover } from "./TabsMorePopover";
import {
  useActiveTabId,
  useTabActions,
  useTabs,
  useHasAnyUnsavedChanges,
  useIsTabDirty,
  usePreviewTabId,
  BufferModeTab,
  useTabTitle,
} from "../slice";
import { TabState } from "../slice/types";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";
import { RQAPI } from "features/apiClient/types";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";

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
  const { closeTab, setActiveTab, openBufferedTab, setPreviewTab } = useTabActions();
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

  const hasUnsavedChanges = useHasAnyUnsavedChanges();
  const hasActiveWorkflows = useMemo(() => tabs.some((t) => t.activeWorkflows.size > 0), [tabs]);

  useEffect(() => {
    const unloadListener = (e: any) => {
      e.preventDefault();
      e.returnValue = "Are you sure?";
    };

    if (hasUnsavedChanges || hasActiveWorkflows) {
      window.addEventListener("beforeunload", unloadListener);
    }

    return () => window.removeEventListener("beforeunload", unloadListener);
  }, [hasUnsavedChanges, hasActiveWorkflows]);

  unstable_useBlocker(({ nextLocation }) => {
    const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");
    const shouldBlock = !isNextLocationApiClientView && hasUnsavedChanges;

    if (isNextLocationApiClientView) {
      return false;
    }

    if (shouldBlock) {
      const shouldDiscardChanges = window.confirm("Discard changes? Changes you made will not be saved.");
      return !shouldDiscardChanges;
    }

    return false;
  });

  unstable_useBlocker(({ nextLocation }) => {
    const isNextLocationApiClientView = nextLocation.pathname.startsWith("/api-client");

    if (isNextLocationApiClientView) {
      return false;
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

    openBufferedTab({
      source: matchedTabSource.sourceFactory(matchedTabSource.matchedPath),
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

  const handleUnpreviewTab = useCallback(
    (tabId: string) => {
      if (tabId === previewTabId) {
        setPreviewTab(undefined);
      }
    },
    [previewTabId, setPreviewTab]
  );

  const tabItems: TabsProps["items"] = useMemo(() => {
    return tabs.map((tab) => ({
      key: tab.id,
      closable: false,
      label: (
        <TabLabel
          tab={tab}
          onClose={() => closeTab({ tabId: tab.id })}
          onDoubleClick={() => handleUnpreviewTab(tab.id)}
        />
      ),
      children: <TabItem tabId={tab.id}>{tab.source.render()}</TabItem>,
    }));
  }, [tabs, closeTab, handleUnpreviewTab]);

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
            });
          }
        }}
      />
    </div>
  );
};
