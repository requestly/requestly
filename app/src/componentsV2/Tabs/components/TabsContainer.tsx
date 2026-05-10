import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsProps, Typography, Popover } from "antd";
import { useDrag, useDrop } from "react-dnd";
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
  useIsTabDirty,
  usePreviewTabId,
  BufferModeTab,
  useTabTitle,
} from "../slice";
import { TabState, TabId } from "../slice/types";
import { DraftRequestContainerTabSource } from "features/apiClient/screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { getEmptyDraftApiRecord } from "features/apiClient/screens/apiClient/utils";
import { RQAPI } from "features/apiClient/types";
import { useMatchedTabSource } from "../hooks/useMatchedTabSource";
import { getHasActiveWorkflows, getHasAnyUnsavedChanges } from "../slice/utils";
import { ActiveWorkflowModal } from "./ActiveWorkflowModal/ActiveWorkflowModal";

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

const TAB_DRAG_TYPE = "api-client-tab";

type TabDropPosition = "before" | "after";

interface DragTabItem {
  tabId: TabId;
}

interface DraggableTabLabelProps extends TabLabelProps {
  onMoveTab: (tabId: TabId, targetTabId: TabId, position: TabDropPosition) => void;
}

const DraggableTabLabel: React.FC<DraggableTabLabelProps> = ({ tab, onMoveTab, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: TAB_DRAG_TYPE,
      item: { tabId: tab.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [tab.id]
  );

  const [{ isOver, dropPosition }, drop] = useDrop(
    () => ({
      accept: TAB_DRAG_TYPE,
      canDrop: (item: DragTabItem) => item.tabId !== tab.id,
      drop: (item: DragTabItem, monitor) => {
        if (!ref.current || item.tabId === tab.id) {
          return;
        }

        const clientOffset = monitor.getClientOffset();
        const tabBounds = ref.current.getBoundingClientRect();
        const position = clientOffset && clientOffset.x > tabBounds.left + tabBounds.width / 2 ? "after" : "before";

        onMoveTab(item.tabId, tab.id, position);
      },
      collect: (monitor) => {
        const clientOffset = monitor.getClientOffset();
        const tabBounds = ref.current?.getBoundingClientRect();
        const position =
          clientOffset && tabBounds && clientOffset.x > tabBounds.left + tabBounds.width / 2 ? "after" : "before";

        return {
          isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
          dropPosition: position,
        };
      },
    }),
    [onMoveTab, tab.id]
  );

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`draggable-tab-label ${isDragging ? "dragging" : ""} ${isOver ? `drop-target-${dropPosition}` : ""}`}
    >
      <TabLabel tab={tab} {...props} />
    </div>
  );
};

export const TabsContainer: React.FC = () => {
  const tabs = useTabs();
  const activeTabId = useActiveTabId();
  const previewTabId = usePreviewTabId();
  const { closeTab, setActiveTab, openBufferedTab, setPreviewTab, reorderTab } = useTabActions();
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false);
  const [workflowModalTabId, setWorkflowModalTabId] = useState<TabId | null>(null);

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

  const handleTabCloseRequest = useCallback(
    (tab: TabState) => {
      if (tab.activeWorkflows.size > 0) {
        setWorkflowModalTabId(tab.id);
        return;
      }

      closeTab({ tabId: tab.id });
    },
    [closeTab]
  );

  const handleMoveTab = useCallback(
    (tabId: TabId, targetTabId: TabId, position: TabDropPosition) => {
      reorderTab({ tabId, targetTabId, position });
    },
    [reorderTab]
  );

  const tabItems: TabsProps["items"] = useMemo(() => {
    return tabs.map((tab) => ({
      key: tab.id,
      closable: false,
      label: (
        <DraggableTabLabel
          tab={tab}
          onClose={() => handleTabCloseRequest(tab)}
          onDoubleClick={() => handleUnpreviewTab(tab.id)}
          onMoveTab={handleMoveTab}
        />
      ),
      children: <TabItem tabId={tab.id}>{tab.source.render()}</TabItem>,
    }));
  }, [tabs, handleTabCloseRequest, handleUnpreviewTab, handleMoveTab]);

  const handleWorkflowModalCancel = useCallback(() => {
    setWorkflowModalTabId(null);
  }, []);

  const handleWorkflowModalConfirm = useCallback(() => {
    if (!workflowModalTabId) {
      return;
    }

    closeTab({ tabId: workflowModalTabId, skipUnsavedPrompt: true, forceClose: true });
    setWorkflowModalTabId(null);
  }, [workflowModalTabId, closeTab]);

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
      <ActiveWorkflowModal
        open={workflowModalTabId !== null}
        onCancel={handleWorkflowModalCancel}
        onConfirm={handleWorkflowModalConfirm}
      />
    </div>
  );
};
