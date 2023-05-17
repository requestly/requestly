import React, { useCallback } from "react";
import placeholderImage from "../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { Button, Timeline, Typography } from "antd";
import { RQAPI } from "../types";
import { ClearOutlined, CodeOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { trackRequestSelectedFromHistory } from "modules/analytics/events/features/apiClient";
import REQUEST_METHOD_COLORS from "constants/requestMethodColors";
import "./apiClientSidebar.scss";

interface Props {
  history: RQAPI.Entry[];
  onSelectionFromHistory: (index: number) => void;
  clearHistory: () => void;
  onNewClick: () => void;
  onImportClick: () => void;
}

const APIClientSidebar: React.FC<Props> = ({
  history,
  onSelectionFromHistory,
  clearHistory,
  onNewClick,
  onImportClick,
}) => {
  const onHistoryLinkClick = useCallback(
    (index: number) => {
      onSelectionFromHistory(index);
      trackRequestSelectedFromHistory();
    },
    [onSelectionFromHistory]
  );

  return (
    <div className="api-client-sidebar">
      <div className="api-client-sidebar-header">
        <div>
          <Button type="text" size="small" onClick={onNewClick} icon={<PlusCircleOutlined />}>
            New
          </Button>
          <Button type="text" size="small" onClick={onImportClick} icon={<CodeOutlined />}>
            Import
          </Button>
        </div>
        <div>
          {history?.length ? (
            <Button type="text" size="small" onClick={clearHistory} icon={<ClearOutlined />}>
              Clear history
            </Button>
          ) : null}
        </div>
      </div>
      {history?.length ? (
        <Timeline reverse className="api-history-list" mode="left">
          <Timeline.Item key="end" color="gray">
            <div className="api-history-row">
              <Typography.Text type="secondary" italic className="api-history-end-marker">
                END
              </Typography.Text>
            </div>
          </Timeline.Item>
          {history.map((entry, index) => (
            <Timeline.Item key={index} color={REQUEST_METHOD_COLORS[entry.request.method]}>
              <div className={`api-history-row ${entry.request.url ? "clickable" : ""}`}>
                <Typography.Text
                  className="api-method"
                  strong
                  style={{ color: REQUEST_METHOD_COLORS[entry.request.method] }}
                >
                  {entry.request.method}
                </Typography.Text>
                <Typography.Text
                  type="secondary"
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
      ) : (
        <div className="api-client-sidebar-placeholder">
          <img src={placeholderImage} alt="empty" />
          <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default APIClientSidebar;
