import React from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";

interface Props extends EmptyStateProps {}

export const ApiRecordEmptyState: React.FC<Props> = ({
  disabled,
  message,
  newRecordBtnText,
  onNewRecordClick,
  analyticEventSource,
}) => {
  return (
    <div className="api-record-empty-state-container">
      <div className="empty-state-wrapper">
        <EmptyState
          disabled={disabled}
          message={message}
          newRecordBtnText={newRecordBtnText}
          onNewRecordClick={onNewRecordClick}
          analyticEventSource={analyticEventSource}
        />
      </div>
    </div>
  );
};
