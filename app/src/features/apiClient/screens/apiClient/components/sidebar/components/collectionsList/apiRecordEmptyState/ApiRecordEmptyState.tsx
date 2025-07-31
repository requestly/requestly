import React from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";
import { RQAPI } from "features/apiClient/types";

interface Props extends EmptyStateProps {
  record?: RQAPI.Record;
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType, collectionId?: string) => Promise<void>;
}

export const ApiRecordEmptyState: React.FC<Props> = ({
  record,
  disabled,
  message,
  newRecordBtnText,
  analyticEventSource,
  onNewClick,
}) => {
  return (
    <div className="api-record-empty-state-container">
      <div className="empty-state-wrapper">
        <EmptyState
          disabled={disabled}
          message={message}
          newRecordBtnText={newRecordBtnText}
          onNewRecordClick={() => onNewClick("collection_list_empty_state", RQAPI.RecordType.COLLECTION, record?.id)}
          onNewRequestClick={() => onNewClick("collection_list_empty_state", RQAPI.RecordType.API, record?.id)}
          analyticEventSource={analyticEventSource}
        />
      </div>
    </div>
  );
};
