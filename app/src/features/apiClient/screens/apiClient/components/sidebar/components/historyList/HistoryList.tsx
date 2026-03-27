import React, { useCallback, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Timeline, Typography } from "antd";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../constants";
import { trackRequestSelectedFromHistory } from "modules/analytics/events/features/apiClient";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";
import { TfiClose } from "@react-icons/all-files/tfi/TfiClose";
import { useTabActions } from "componentsV2/Tabs/slice";
import { getApiClientFeatureContext } from "features/apiClient/slices";
import { HistoryViewTabSource } from "../../../views/components/request/HistoryView/historyViewTabSource";
import { createDummyApiRecord } from "features/apiClient/components/common/APIClient/APIClient";

interface Props {
  history: RQAPI.ApiEntry[];
  selectedHistoryIndex?: number;
  onSelectionFromHistory: (index: number) => void;
}

export const HistoryList: React.FC<Props> = ({ history, selectedHistoryIndex, onSelectionFromHistory }) => {
  const { openBufferedTab } = useTabActions();
  const [dismissNote, setDismissNote] = useState(false);

  const onHistoryLinkClick = useCallback(
    (index: number) => {
      const historyEntry = history[index];
      if (!historyEntry) {
        return;
      }

      const ctx = getApiClientFeatureContext();

      const record = createDummyApiRecord(historyEntry);
      record.id = ""; // Override to empty for history entries

      openBufferedTab({
        source: new HistoryViewTabSource({
          context: { id: ctx.workspaceId },
          record,
          entryType: historyEntry.type,
        }),
        preview: false,
        singleton: true,
      });

      onSelectionFromHistory(index);

      trackRequestSelectedFromHistory();
      trackRQLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
      trackRQDesktopLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
    },
    [onSelectionFromHistory, openBufferedTab, history]
  );

  const getTimelineItemColor = (entry: RQAPI.ApiEntry) => {
    if (entry.type === RQAPI.ApiEntryType.HTTP) {
      return REQUEST_METHOD_COLORS[entry.request.method];
    }
    if (entry.type === RQAPI.ApiEntryType.GRAPHQL) {
      return "#FF14A9";
    }
    return REQUEST_METHOD_COLORS[(entry as RQAPI.HttpApiEntry).request.method];
  };

  const getTimelineItemMethod = (entry: RQAPI.ApiEntry) => {
    if (entry.type === RQAPI.ApiEntryType.HTTP) {
      return entry.request.method;
    }
    if (entry.type === RQAPI.ApiEntryType.GRAPHQL) {
      return "GQL";
    }

    return (entry as RQAPI.HttpApiEntry).request.method;
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
      <Timeline reverse className="api-history-list-container" mode="left">
        <Timeline.Item key="end" color="gray">
          <div className="api-history-row">
            <Typography.Text type="secondary" italic className="api-history-start-marker">
              Start
            </Typography.Text>
          </div>
        </Timeline.Item>
        {history.map((entry, index) => (
          <Timeline.Item key={index} color={getTimelineItemColor(entry)}>
            <div
              className={`api-history-row ${entry.request.url ? "clickable" : ""} ${
                selectedHistoryIndex === index ? "active" : ""
              }`}
            >
              <Typography.Text strong className="api-method" style={{ color: getTimelineItemColor(entry) }}>
                {getTimelineItemMethod(entry)}
              </Typography.Text>
              <Typography.Text
                ellipsis={{ suffix: "...", tooltip: entry.request.url }}
                className="api-history-url"
                title={entry.request.url}
                onClick={() => onHistoryLinkClick(index)}
              >
                {entry.request.url}
              </Typography.Text>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </>
  ) : (
    <div className="api-client-sidebar-placeholder">
      <img src={"/assets/media/apiClient/empty-sheets-dark.svg"} alt="empty" />
      <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
    </div>
  );
};
