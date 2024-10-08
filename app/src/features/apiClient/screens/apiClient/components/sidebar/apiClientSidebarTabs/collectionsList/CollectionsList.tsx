import React from "react";
import { RQAPI } from "features/apiClient/types";
import { Typography } from "antd";
import placeholderImage from "../../../../../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { NavLink } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQButton } from "lib/design-system-v2/components";
import { CodeOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../constants";
import "./collectionsList.scss";

interface Props {
  onNewClick: () => void;
  onImportClick: () => void;
}

export const CollectionsList: React.FC<Props> = ({ onNewClick, onImportClick }) => {
  const { isLoadingApiClientRecords, apiClientRecords } = useApiClientContext();

  return (
    <>
      <div className="collections-list-container">
        <div className="api-client-sidebar-header">
          <div>
            <RQButton type="transparent" size="small" onClick={onNewClick} icon={<PlusCircleOutlined />}>
              New
            </RQButton>
            <RQButton type="transparent" size="small" onClick={onImportClick} icon={<CodeOutlined />}>
              Import
            </RQButton>
          </div>
        </div>

        <div className="collections-list-content">
          {isLoadingApiClientRecords ? (
            <div className="api-client-sidebar-placeholder">
              <Typography.Text type="secondary">Loading...</Typography.Text>
            </div>
          ) : apiClientRecords.length > 0 ? (
            <div className="collections-list">
              {apiClientRecords.map((record) => {
                const apiClientRecord = record as RQAPI.ApiRecord;

                return (
                  <NavLink
                    to={`${PATHS.API_CLIENT.ABSOLUTE}/request/${record.id}`}
                    className={({ isActive }) => `collections-list-item api  ${isActive ? "active" : ""}`}
                  >
                    <Typography.Text
                      strong
                      className="request-method"
                      style={{ color: REQUEST_METHOD_COLORS[apiClientRecord.data.request.method] }}
                    >
                      {apiClientRecord.data.request.method}
                    </Typography.Text>
                    <div className="request-url">{apiClientRecord.data.request.url}</div>
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <div className="api-client-sidebar-placeholder">
              <img src={placeholderImage} alt="empty" />
              <Typography.Text type="secondary">API requests you send will appear here.</Typography.Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
