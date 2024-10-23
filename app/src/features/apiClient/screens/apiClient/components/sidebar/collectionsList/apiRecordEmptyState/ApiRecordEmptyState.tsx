import React, { useState } from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";
import { NewRecordNameInput, NewRecordNameInputProps } from "../newRecordNameInput/NewRecordNameInput";
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
  const [isCreateNewRecord, setIsCreateNewRecord] = useState(false);

  const handleNewRecordClick = () => {
    setIsCreateNewRecord(true);

    if (recordType === RQAPI.RecordType.API) {
      onNewRecordClick?.();
    }
  };

  const handleOnSuccess = () => {
    setIsCreateNewRecord(false);
  };

  return (
    <div className="api-record-empty-state-container">
      {isCreateNewRecord ? (
        <NewRecordNameInput
          recordType={recordType}
          onSuccess={handleOnSuccess}
          recordToBeEdited={recordToBeEdited}
          newRecordCollectionId={newRecordCollectionId}
          analyticEventSource={analyticEventSource}
        />
      ) : (
        <EmptyState
          message={message}
          newRecordBtnText={newRecordBtnText}
          onNewRecordClick={handleNewRecordClick}
          analyticEventSource={analyticEventSource}
        />
      )}
    </div>
  );
};
