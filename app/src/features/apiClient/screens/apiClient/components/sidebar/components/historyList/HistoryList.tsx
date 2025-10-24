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
import type { HistoryEntry } from "features/apiClient/screens/apiClient/historyStore"; // ✅ ADD THIS
import { RQAPI } from "features/apiClient/types"; // Keep this for ApiEntryType enum
import "./HistoryList.scss";

interface Props {
  history: HistoryEntry[]; // ✅ CHANGED FROM RQAPI.ApiEntry[]
  selectedHistoryIndex?: number;
  onSelectionFromHistory: (index: number) => void;
  onDeleteHistoryItem: (id: string) => void;
  onDeleteHistoryByDate: (dateKey: string, dateLabel: string) => void;
}

// Helper function to group history by date
const groupHistoryByDate = (history: HistoryEntry[]) => { // ✅ CHANGED TYPE
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  
  const grouped: Record<string, { 
    dateKey: string;
    label: string; 
    items: Array<{ entry: HistoryEntry; originalIndex: number }>; // ✅ CHANGED TYPE
  }> = {};
  
  history.forEach((entry, index) => {
    const entryDate = new Date(entry.createdTs); // ✅ USE createdTs
    const dateKey = entryDate.toISOString().slice(0, 10);
    
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
  const [dismissNote, setDismissNote] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null); // ✅ CHANGED TO string
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const groupedHistory = groupHistoryByDate(history);

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

  const getTimelineItemColor = (entry: HistoryEntry) => { // ✅ CHANGED TYPE
    if (entry.type === RQAPI.ApiEntryType.HTTP) {
      return REQUEST_METHOD_COLORS[entry.request.method];
    }
    if (entry.type === RQAPI.ApiEntryType.GRAPHQL) {
      return "#FF14A9";
    }
    return REQUEST_METHOD_COLORS[(entry as RQAPI.HttpApiEntry).request.method];
  };

  const getTimelineItemMethod = (entry: HistoryEntry) => { // ✅ CHANGED TYPE
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
              onClick={() => onDeleteHistoryByDate(group.dateKey, group.label)}
              title={`Delete all items for ${group.label}`}
            >
              Delete All
            </Button>
          )}
        </div>

        <Timeline className="api-history-group-timeline" mode="left">
          {group.items.map(({ entry, originalIndex }) => {
            const entryId = entry.historyId; // ✅ USE historyId
            const isSelected = selectedHistoryIndex === originalIndex;
            const isHovered = hoveredItem === entryId; // ✅ COMPARE WITH historyId

            return (
              <Timeline.Item key={entryId} color={getTimelineItemColor(entry)}>
                <div
                  className={`api-history-row ${entry.request.url ? "clickable" : ""} ${
                    isSelected ? "active" : ""
                  }`}
                  onMouseEnter={() => setHoveredItem(entryId)} // ✅ USE historyId
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
                          onDeleteHistoryItem(entryId); // ✅ USE historyId
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
    </>
  ) : (
    <div className="api-client-sidebar-placeholder">
      <img src={"/assets/media/apiClient/empty-sheets-dark.svg"} alt="empty" />
      <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
    </div>
  );
};
