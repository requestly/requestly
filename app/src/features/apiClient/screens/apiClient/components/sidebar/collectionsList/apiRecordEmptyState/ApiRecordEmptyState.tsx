import React, { useState } from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";
import { NewRecordNameInput, NewRecordNameInputProps } from "../newRecordNameInput/NewRecordNameInput";

interface Props extends EmptyStateProps, Omit<NewRecordNameInputProps, "onSuccess"> {}

export const ApiRecordEmptyState: React.FC<Props> = ({
  message,
  newRecordBtnText,
  onNewRecordClick,
  recordToBeEdited,
  recordType,
  newRecordCollectionId,
}) => {
  const [isCreateNewRecord, setIsCreateNewRecord] = useState(false);

  const handleNewRecordClick = () => {
    setIsCreateNewRecord(true);
    onNewRecordClick?.();
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
        />
      ) : (
        <EmptyState message={message} newRecordBtnText={newRecordBtnText} onNewRecordClick={handleNewRecordClick} />
      )}
    </div>
  );
};
