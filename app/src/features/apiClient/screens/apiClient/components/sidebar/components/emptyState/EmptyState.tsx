import React, { useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import APP_CONSTANTS from "config/constants";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentAnalyticsSource } from "features/apiClient/screens/environment/types";
import "./emptyState.scss";
import Link from "antd/lib/typography/Link";

export interface EmptyStateProps {
  disabled?: boolean;
  analyticEventSource: RQAPI.AnalyticsEventSource | EnvironmentAnalyticsSource;
  message: string;
  newRecordBtnText: string;
  onNewRecordClick: () => Promise<void>;
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
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = () => {
    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            src: APP_CONSTANTS.FEATURES.API_CLIENT,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            eventSource: analyticEventSource,
          },
        })
      );

      return;
    }
    setIsLoading(true);
    onNewRecordClick()
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
        <Link className="new-request-link" onClick={onNewRequestClick}>
          Add a request
        </Link>
      </div>
    </div>
  );
};
