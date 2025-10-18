import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { Typography } from "antd";
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

export const TabItemComponent: React.FC<TabItemProps> = ({
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
