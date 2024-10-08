import React from "react";
import { RQAPI } from "features/apiClient/types";
import { Typography } from "antd";
import placeholderImage from "../../../../../../../assets/images/illustrations/empty-sheets-dark.svg";
import { NavLink } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { useApiClientContext } from "features/apiClient/contexts";
import "./collectionsList.scss";

interface Props {}

export const CollectionsList: React.FC<Props> = () => {
  const { isLoadingApiClientRecords, apiClientRecords } = useApiClientContext();

  return (
    <>
      <div className="collections-list-container">
        <div className="collections-list-content">
          {isLoadingApiClientRecords ? (
            <div className="api-client-sidebar-placeholder">
              <Typography.Text type="secondary">Loading...</Typography.Text>
            </div>
          ) : apiClientRecords.length > 0 ? (
            <div className="collections-list">
              {apiClientRecords.map((record) => {
                const apiRecord = record as RQAPI.ApiRecord;

                return (
                  <NavLink
                    to={`${PATHS.API_CLIENT.ABSOLUTE}/request/${record.id}`}
                    className={({ isActive }) => `collections-list-item api  ${isActive ? "active" : ""}`}
                  >
                    {apiRecord.data.request.url}
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
