import React from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";
import { RQAPI } from "features/apiClient/types";

interface Props extends EmptyStateProps {
  record?: RQAPI.ApiClientRecord;
  onNewClick: (
    src: RQAPI.AnalyticsEventSource,
    recordType: RQAPI.RecordType,
    collectionId?: string,
    entryType?: RQAPI.ApiEntryType
  ) => Promise<void>;
}

export const ApiRecordEmptyState: React.FC<Props> = ({ record, disabled, message, newRecordBtnText, onNewClick }) => {
  return (
    <div className="api-record-empty-state-container">
      <div className="empty-state-wrapper">
        <EmptyState
          disabled={disabled}
          message={message}
          newRecordBtnText={newRecordBtnText}
          onNewRecordClick={(recordType, entryType) =>
            onNewClick("collection_list_empty_state", recordType, record?.id, entryType)
          }
        />
      </div>
    </div>
  );
};
