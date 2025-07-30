import React, { useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentAnalyticsSource } from "features/apiClient/screens/environment/types";
import "./emptyState.scss";
import Link from "antd/lib/typography/Link";

export interface EmptyStateProps {
  disabled?: boolean;
  analyticEventSource: RQAPI.AnalyticsEventSource | EnvironmentAnalyticsSource;
  message: string;
  newRecordBtnText: string;
  onNewRecordClick?: () => Promise<void>;
  onNewRequestClick?: () => Promise<void>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  disabled = false,
  newRecordBtnText,
  onNewRecordClick,
  analyticEventSource = "collections_empty_state",
  onNewRequestClick,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = () => {
    setIsLoading(true);
    onNewRecordClick?.()
      .then(() => {
        // DO NOTHING
      })
      .catch((error) => {
        console.error("Error creating new API Client record", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="empty-state-container">
      <div className="empty-message">{message}</div>
      <div className="empty-state-actions">
        <RQButton
          disabled={disabled}
          loading={isLoading}
          size="small"
          className="new-record-btn"
          onClick={handleOnClick}
        >
          {newRecordBtnText}
        </RQButton>
        {analyticEventSource === EnvironmentAnalyticsSource.ENVIRONMENTS_LIST ? null : (
          <Link className="new-request-link" onClick={onNewRequestClick}>
            Add a request
          </Link>
        )}
      </div>
    </div>
  );
};
