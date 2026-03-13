import { notification } from "antd";
import { DraggableApiRecord } from "../collectionRow/CollectionRow";
import { Workspace } from "features/workspaces/types";
import { getApiClientFeatureContext, moveRecords } from "features/apiClient/slices";
import * as Sentry from "@sentry/react";

export interface HandleRecordDropOptions {
  /** The target collection ID where the item should be dropped. Empty string for top-level. */
  targetCollectionId: string;
  /** Callback to execute on successful drop (e.g., expand the target collection) */
  onSuccess?: () => void;
  /** Callback to execute on error or completion */
  onFinally?: () => void;
}

/**
 * Shared utility to handle drag-and-drop of API records across collections.
 *
 * @param item - The draggable record being dropped
 * @param dropWorkspaceId - The workspace where the item is being dropped
 * @param options - Additional options for customizing behavior
 */
export const handleRecordDrop = async (
  item: DraggableApiRecord,
  dropWorkspaceId: Workspace["id"] | null | undefined,
  options: HandleRecordDropOptions = { targetCollectionId: "" }
): Promise<void> => {
  try {
    const sourceContext = getApiClientFeatureContext(item.workspaceId);
    if (!sourceContext) return;

    const destination = {
      workspaceId: dropWorkspaceId,
      collectionId: options.targetCollectionId,
    };

    await sourceContext.store
      .dispatch(
        moveRecords({
          recordsToMove: [item.record],
          collectionId: destination.collectionId,
          repository: sourceContext.repositories.apiClientRecordsRepository,
          sourceWorkspaceId: item.workspaceId,
          destinationWorkspaceId: destination.workspaceId,
        }) as any
      )
      .unwrap();

    options.onSuccess?.();
  } catch (error) {
    Sentry.captureException(error);
    notification.error({
      message: "Error moving item",
      description: (error as any)?.message || "Failed to move item. Please try again.",
      placement: "bottomRight",
    });
  } finally {
    options.onFinally?.();
  }
};
