import React, { useCallback } from "react";
import { EmptyState, EmptyStateProps } from "../../emptyState/EmptyState";
import { RQAPI } from "features/apiClient/types";
import "./ApiRecordEmptyState.scss";
import {
  getApiClientFeatureContext,
  moveRecords,
  useApiClientFeatureContext,
  useApiClientRepository,
} from "features/apiClient/slices";
import { useDrop } from "react-dnd";
import { DraggableApiRecord } from "../collectionRow/CollectionRow";
import { Workspace } from "features/workspaces/types";
import { notification } from "antd";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";

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
  const context = useApiClientFeatureContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const handleRecordDrop = useCallback(
    async (item: DraggableApiRecord, dropWorkspaceId: Workspace["id"]) => {
      try {
        const sourceContext = getApiClientFeatureContext(item.workspaceId);
        if (!sourceContext) {
          throw new Error(`Source context not found for id: ${item.workspaceId}`);
        }

        await sourceContext.store
          .dispatch(
            moveRecords({
              recordsToMove: [item.record],
              collectionId: "",
              repository: apiClientRecordsRepository,
              sourceWorkspaceId: item.workspaceId,
              destinationWorkspaceId: dropWorkspaceId,
            }) as any
          )
          .unwrap();
      } catch (error) {
        notification.error({
          message: "Error moving item",
          description: error?.message || (typeof error === "string" ? error : "Failed to move item. Please try again."),
          placement: "bottomRight",
        });
        throw NativeError.fromError(error).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
      }
    },
    [apiClientRecordsRepository]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [RQAPI.RecordType.API, RQAPI.RecordType.COLLECTION],
      drop: (item: DraggableApiRecord, monitor) => {
        console.log("Dropped item:", item);
        const isOverCurrent = monitor.isOver({ shallow: true });
        if (!isOverCurrent) return;
        handleRecordDrop(item, context.workspaceId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [handleRecordDrop, context.workspaceId]
  );

  return (
    <div className={`api-record-empty-state-container${isOver ? " drop-target" : ""}`} ref={drop}>
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
