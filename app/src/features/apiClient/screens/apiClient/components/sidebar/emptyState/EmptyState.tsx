import React from "react";
import emptyCardImage from "../../../../../assets/empty-card.svg";
import { RQButton } from "lib/design-system-v2/components";
import APP_CONSTANTS from "config/constants";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentAnalyticsContext } from "features/apiClient/screens/environment/types";
import "./emptyState.scss";

export interface EmptyStateProps {
  analyticEventSource: RQAPI.AnalyticsEventSource | EnvironmentAnalyticsContext;
  message: string;
  newRecordBtnText: string;
  onNewRecordClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  newRecordBtnText,
  onNewRecordClick,
  analyticEventSource = "collections_empty_state",
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const handleOnClick = () => {
    if (!user.loggedIn) {
      dispatch(
        // @ts-ignore
        actions.toggleActiveModal({
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

    onNewRecordClick();
  };

  return (
    <div className="empty-state-container">
      <img className="empty-card-image" width={40} height={40} src={emptyCardImage} alt="Empty collection list" />
      <div className="empty-message">{message}</div>

      <RQButton size="small" className="new-record-btn" onClick={handleOnClick}>
        {newRecordBtnText}
      </RQButton>
    </div>
  );
};
