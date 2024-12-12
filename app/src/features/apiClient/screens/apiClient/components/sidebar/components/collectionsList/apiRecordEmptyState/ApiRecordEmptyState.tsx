import React from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";
import { NewRecordNameInputProps } from "../newRecordNameInput/NewRecordNameInput";
import { RQAPI } from "features/apiClient/types";

interface Props extends EmptyStateProps, Omit<NewRecordNameInputProps, "onSuccess"> {}

export const ApiRecordEmptyState: React.FC<Props> = ({
  message,
  newRecordBtnText,
  onNewRecordClick,
  recordToBeEdited,
  recordType,
  newRecordCollectionId,
  analyticEventSource,
}) => {
  const handleNewRecordClick = () => {
    if (recordType === RQAPI.RecordType.API) {
      onNewRecordClick?.();
    }
  };

  return (
    <div className="api-record-empty-state-container">
      <div className="mt-8">
        <EmptyState
          message={message}
          newRecordBtnText={newRecordBtnText}
          onNewRecordClick={handleNewRecordClick}
          analyticEventSource={analyticEventSource}
        />
      </div>
    </div>
  );
};
