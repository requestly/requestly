import React, { useCallback, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Timeline, Typography } from "antd";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../constants";
import { trackRequestSelectedFromHistory } from "modules/analytics/events/features/apiClient";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";
import { TfiClose } from "@react-icons/all-files/tfi/TfiClose";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { HistoryViewTabSource } from "../../../clientView/components/request/HistoryView/historyViewTabSource";

interface Props {
  history: RQAPI.Entry[];
  selectedHistoryIndex: number;
  onSelectionFromHistory: (index: number) => void;
}

export const HistoryList: React.FC<Props> = ({ history, selectedHistoryIndex, onSelectionFromHistory }) => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const [dismissNote, setDismissNote] = useState(false);

  const onHistoryLinkClick = useCallback(
    (index: number) => {
      onSelectionFromHistory(index);

      openTab(new HistoryViewTabSource());
      trackRequestSelectedFromHistory();
      trackRQLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
      trackRQDesktopLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
    },
    [onSelectionFromHistory, openTab]
  );

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
          <Timeline.Item key={index} color={REQUEST_METHOD_COLORS[entry.request.method]}>
            <div
              className={`api-history-row ${entry.request.url ? "clickable" : ""} ${
                selectedHistoryIndex === index ? "active" : ""
              }`}
            >
              <Typography.Text
                strong
                className="api-method"
                style={{ color: REQUEST_METHOD_COLORS[entry.request.method] }}
              >
                {entry.request.method}
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
