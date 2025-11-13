import React, { useCallback, useState } from "react";
import { Timeline, Typography, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../constants";
import { trackRequestSelectedFromHistory } from "modules/analytics/events/features/apiClient";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";
import { TfiClose } from "@react-icons/all-files/tfi/TfiClose";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { HistoryViewTabSource } from "../../../views/components/request/HistoryView/historyViewTabSource";
import type { HistoryEntry } from "features/apiClient/screens/apiClient/historyStore";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import "./HistoryList.scss";
import { getDateKeyFromTimestamp } from "features/apiClient/screens/apiClient/historyStore";

interface Props {
  history: HistoryEntry[];
  selectedHistoryIndex?: number;
  onSelectionFromHistory: (index: number) => void;
  onDeleteHistoryItem: (id: string) => void;
  onDeleteHistoryByDate: (dateKey: string, dateLabel: string) => void;
}

const groupHistoryByDate = (history: HistoryEntry[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayKey = getDateKeyFromTimestamp(today.getTime());
  const yesterdayKey = getDateKeyFromTimestamp(yesterday.getTime());
  
  const grouped: Record<string, { 
    dateKey: string;
    label: string; 
    items: Array<{ entry: HistoryEntry; originalIndex: number }>;
  }> = {};
  
  history.forEach((entry, index) => {
    const entryDate = new Date(entry.createdTs);
    const dateKey = getDateKeyFromTimestamp(entry.createdTs);
    
    let label: string;
    if (dateKey === todayKey) {
      label = "Today";
    } else if (dateKey === yesterdayKey) {
      label = "Yesterday";
    } else {
      label = entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = { dateKey, label, items: [] };
    }
    grouped[dateKey].items.push({ entry, originalIndex: index });
  });
  
  return Object.values(grouped).sort((a, b) => 
    b.dateKey.localeCompare(a.dateKey)
  );
};

export const HistoryList: React.FC<Props> = ({ 
  history, 
  selectedHistoryIndex, 
  onSelectionFromHistory,
  onDeleteHistoryItem,
  onDeleteHistoryByDate
}) => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dismissNote, setDismissNote] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'date',
    idOrDateKey: string,
    dateLabel?: string
  } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const groupedHistory = groupHistoryByDate(history);
  
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    if (deleteTarget?.type === 'single') {
      await onDeleteHistoryItem(deleteTarget.idOrDateKey);
    } else if (deleteTarget?.type === 'date') {
      await onDeleteHistoryByDate(deleteTarget.idOrDateKey, deleteTarget.dateLabel!);
    }
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const onHistoryLinkClick = useCallback(
    (globalIndex: number) => {
      onSelectionFromHistory(globalIndex);
      openTab(new HistoryViewTabSource());
      trackRequestSelectedFromHistory();
      trackRQLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
      trackRQDesktopLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
    },
    [onSelectionFromHistory, openTab]
  );

  const getTimelineItemColor = (entry: HistoryEntry) => {
    if (entry.type === RQAPI.ApiEntryType.HTTP) {
      return REQUEST_METHOD_COLORS[entry.request.method];
    }
    if (entry.type === RQAPI.ApiEntryType.GRAPHQL) {
      return "#FF14A9";
    }
    return REQUEST_METHOD_COLORS[(entry as RQAPI.HttpApiEntry).request.method];
  };

  const getTimelineItemMethod = (entry: HistoryEntry) => {
    if (entry.type === RQAPI.ApiEntryType.HTTP) {
      return entry.request.method;
    }
    if (entry.type === RQAPI.ApiEntryType.GRAPHQL) {
      return "GQL";
    }
    return (entry as RQAPI.HttpApiEntry).request.method;
  };

  const renderHistoryGroup = (group: { 
    dateKey: string; 
    label: string; 
    items: Array<{ entry: HistoryEntry; originalIndex: number }> 
  }) => {
    const isDateHovered = hoveredDate === group.dateKey;

    return (
      <div key={group.dateKey} className="api-history-date-group">
        <div
          className="api-history-date-header"
          onMouseEnter={() => setHoveredDate(group.dateKey)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <Typography.Text strong className="api-history-date-label">
            {group.label}
          </Typography.Text>
          {isDateHovered && (
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                setDeleteTarget({ type: 'date', idOrDateKey: group.dateKey, dateLabel: group.label });
                setDeleteModalOpen(true);
              }}
              title={`Delete all items for ${group.label}`}
            >
              Delete All
            </Button>
          )}
        </div>

        <Timeline className="api-history-group-timeline" mode="left">
          {group.items.map(({ entry, originalIndex }) => {
            const entryId = entry.historyId;
            const isSelected = selectedHistoryIndex === originalIndex;
            const isHovered = hoveredItem === entryId;

            return (
              <Timeline.Item key={entryId} color={getTimelineItemColor(entry)}>
                <div
                  className={`api-history-row ${entry.request.url ? "clickable" : ""} ${
                    isSelected ? "active" : ""
                  }`}
                  onMouseEnter={() => setHoveredItem(entryId)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="api-history-row-content">
                    <Typography.Text
                      strong
                      className="api-method"
                      style={{ color: getTimelineItemColor(entry) }}
                    >
                      {getTimelineItemMethod(entry)}
                    </Typography.Text>
                    <Typography.Text
                      ellipsis={{ suffix: "...", tooltip: entry.request.url }}
                      className="api-history-url"
                      title={entry.request.url}
                      onClick={() => onHistoryLinkClick(originalIndex)}
                    >
                      {entry.request.url}
                    </Typography.Text>
                    {isHovered && (
                      <DeleteOutlined
                        className="delete-item-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ type: 'single', idOrDateKey: entryId });
                          setDeleteModalOpen(true);
                        }}
                        title="Delete this item"
                      />
                    )}
                  </div>
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    );
  };

  return history?.length ? (
    <>
      {!dismissNote && (
        <div className="storage-communication-note">
          <img src={"/assets/media/apiClient/shield-icon.svg"} alt="secured" />
          <p> Your history is stored in your device's local storage for better privacy & control.</p>
          <TfiClose onClick={() => setDismissNote(true)} />
        </div>
      )}

      <div className="api-history-list-container">
        {groupedHistory.map((group) => renderHistoryGroup(group))}

        <Timeline className="api-history-end-timeline" mode="left">
          <Timeline.Item key="end" color="gray">
            <div className="api-history-row">
              <Typography.Text type="secondary" italic className="api-history-start-marker">
                Start
              </Typography.Text>
            </div>
          </Timeline.Item>
        </Timeline>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        title={
          deleteTarget?.type === 'single'
            ? 'Delete History Item?'
            : `Delete history for ${deleteTarget?.dateLabel}?`
        }
        message={
          deleteTarget?.type === 'single'
            ? 'Are you sure you want to delete this history item? This action cannot be undone.'
            : `Are you sure you want to delete all history items for "${deleteTarget?.dateLabel}"? This action cannot be undone.`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setIsDeleting(false);
          setDeleteTarget(null);
        }}
      />
    </>
  ) : (
    <div className="api-client-sidebar-placeholder">
      <img src={"/assets/media/apiClient/empty-sheets-dark.svg"} alt="empty" />
      <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
    </div>
  );
};
