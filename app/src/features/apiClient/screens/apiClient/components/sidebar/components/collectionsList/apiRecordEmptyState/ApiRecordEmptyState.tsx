import React from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";
import { NewRecordNameInputProps } from "../newRecordNameInput/NewRecordNameInput";

interface Props extends EmptyStateProps, Omit<NewRecordNameInputProps, "onSuccess"> {}

export const ApiRecordEmptyState: React.FC<Props> = ({
  message,
  newRecordBtnText,
  onNewRecordClick,
  analyticEventSource,
}) => {
  return (
    <div className="api-record-empty-state-container">
      <div className="mt-8">
        <EmptyState
          message={message}
          newRecordBtnText={newRecordBtnText}
          onNewRecordClick={onNewRecordClick}
          analyticEventSource={analyticEventSource}
        />
      </div>
    </div>
  );
};
