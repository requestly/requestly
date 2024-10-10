import React, { useCallback } from "react";
import placeholderImage from "../../../../../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { RQAPI } from "features/apiClient/types";
import { ClearOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system-v2/components";
import { Timeline, Typography } from "antd";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../constants";
import { trackRequestSelectedFromHistory } from "modules/analytics/events/features/apiClient";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";

interface Props {
  history: RQAPI.Entry[];
  onSelectionFromHistory: (index: number) => void;
  onClearHistory: () => void;
}

export const HistoryList: React.FC<Props> = ({ history, onSelectionFromHistory, onClearHistory }) => {
  const onHistoryLinkClick = useCallback(
    (index: number) => {
      onSelectionFromHistory(index);
      trackRequestSelectedFromHistory();
      trackRQLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
      trackRQDesktopLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
    },
    [onSelectionFromHistory]
  );

  return history?.length ? (
    <>
      <div className="api-client-sidebar-header">
        {history?.length ? (
          <RQButton type="transparent" size="small" onClick={onClearHistory} icon={<ClearOutlined />}>
            Clear history
          </RQButton>
        ) : null}
      </div>

      <Timeline reverse className="api-history-list" mode="left">
        <Timeline.Item key="end" color="gray">
          <div className="api-history-row">
            <Typography.Text type="secondary" italic className="api-history-start-marker">
              Start
            </Typography.Text>
          </div>
        </Timeline.Item>
        {history.map((entry, index) => (
          <Timeline.Item key={index} color={REQUEST_METHOD_COLORS[entry.request.method]}>
            <div className={`api-history-row ${entry.request.url ? "clickable" : ""}`}>
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
      <img src={placeholderImage} alt="empty" />
      <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
    </div>
  );
};
