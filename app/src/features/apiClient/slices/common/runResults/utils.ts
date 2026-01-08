import type { RQAPI } from "features/apiClient/types";
import { RunStatus, CollectionRunCompositeId } from "./types";

export const COLLECTION_RUN_ID_DELIMITER = "::" as const;

export function createCollectionRunCompositeId(
  collectionId: RQAPI.CollectionRecord["id"],
  runId: string
): CollectionRunCompositeId {
  return `${collectionId}${COLLECTION_RUN_ID_DELIMITER}${runId}`;
}

export function parseCollectionRunCompositeId(
  compositeId: CollectionRunCompositeId
): { collectionId: RQAPI.CollectionRecord["id"]; runId: string } {
  const [collectionId, runId] = compositeId.split(COLLECTION_RUN_ID_DELIMITER);

  if (!collectionId || !runId) {
    throw new Error(`Invalid collection run composite id: ${compositeId}`);
  }

  return { collectionId: collectionId as RQAPI.CollectionRecord["id"], runId };
}

export const RunStatusStateMachine = {
  [RunStatus.IDLE]: [RunStatus.RUNNING],
  [RunStatus.RUNNING]: [RunStatus.CANCELLED, RunStatus.COMPLETED, RunStatus.ERRORED],
  [RunStatus.CANCELLED]: [RunStatus.IDLE],
  [RunStatus.COMPLETED]: [RunStatus.IDLE],
  [RunStatus.ERRORED]: [RunStatus.IDLE],
} as const;
