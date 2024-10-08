import React, { useCallback, useState } from "react";
import placeholderImage from "../../../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { Button, Timeline, Typography } from "antd";
import { RQAPI } from "../../../../types";
import { ClearOutlined, CodeOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { trackRequestSelectedFromHistory } from "modules/analytics/events/features/apiClient";
import { REQUEST_METHOD_COLORS } from "../../../../../../constants/requestMethodColors";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";
import { ApiClientSecondarySidebar, SecondarySidebarItemKey } from "./secondarySidebar/ApiClientSecondarySidebar";
import { CollectionsList } from "./secondarySidebar/collectionsList/CollectionsList";
import "./apiClientSidebar.scss";

/**
 * - Create the tabs with active state [DONE]
 * - render history for history tab [DONE]
 * - for collections tab fetch the apis [DONE]
 * - add new collection button
 *  - onclick open new collection modal
 * - list the apis for collections tab
 *  - onclick should load that request into the client view [Todays]
 *
 *
 *  - all collections on top
 *  - then all the apis
 * - add new collection button for creating the collection
 * - add option to move the api into collection
 * - render the single request when clicked from the collections list
 * - rename collection
 * - delete collection
 * - edit collection
 * - add auth checks
 * - add extension installed check
 *
 *
 * --------- can be one PR ------------
 *
 * - Add rename collection
 * - delete collections
 * - edit collection
 */

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
  const [secondarySidebarActiveTab, setSecondarySidebarActiveTab] = useState(SecondarySidebarItemKey.COLLECTIONS);

  const onSecondarySidebarTabChange = (updatedTab: SecondarySidebarItemKey) => {
    setSecondarySidebarActiveTab(updatedTab);
  };

  const onHistoryLinkClick = useCallback(
    (index: number) => {
      onSelectionFromHistory(index);
      trackRequestSelectedFromHistory();
      trackRQLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
      trackRQDesktopLastActivity(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
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

      <div className="api-client-sidebar-content">
        <ApiClientSecondarySidebar
          activeTab={secondarySidebarActiveTab}
          onSecondarySidebarTabChange={onSecondarySidebarTabChange}
        />

        {secondarySidebarActiveTab === SecondarySidebarItemKey.COLLECTIONS ? (
          <CollectionsList />
        ) : history?.length ? (
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
                    className="api-method"
                    strong
                    style={{ color: REQUEST_METHOD_COLORS[entry.request.method] }}
                  >
                    {entry.request.method}
                  </Typography.Text>
                  <Typography.Text
                    ellipsis={{ suffix: "...", tooltip: entry.request.url }}
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
    </div>
  );
};

export default APIClientSidebar;
