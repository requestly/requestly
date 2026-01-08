import type { RQAPI } from "features/apiClient/types";
import type { CollectionRunCompositeId } from "./types";
import { RunStatus } from "./types";

export const COLLECTION_RUN_ID_DELIMITER = "::" as const;

/**
 * Creates a composite ID for a collection run.
 * Format: ${collectionId}::${configId}
 */
export function createCollectionRunCompositeId(
  collectionId: RQAPI.CollectionRecord["id"],
  configId: string
): CollectionRunCompositeId {
  return `${collectionId}${COLLECTION_RUN_ID_DELIMITER}${configId}`;
}

/**
 * Parses a composite ID into its component parts.
 * Format: ${collectionId}::${configId}
 */
export function parseCollectionRunCompositeId(
  compositeId: CollectionRunCompositeId
): { collectionId: RQAPI.CollectionRecord["id"]; configId: string } {
  const [collectionId, configId] = compositeId.split(COLLECTION_RUN_ID_DELIMITER);

  if (!collectionId || !configId) {
    throw new Error(`Invalid collection run composite id: ${compositeId}`);
  }

  return { collectionId: collectionId as RQAPI.CollectionRecord["id"], configId };
}

export const RunStatusStateMachine = {
  [RunStatus.IDLE]: [RunStatus.RUNNING],
  [RunStatus.RUNNING]: [RunStatus.CANCELLED, RunStatus.COMPLETED, RunStatus.ERRORED],
  [RunStatus.CANCELLED]: [RunStatus.IDLE],
  [RunStatus.COMPLETED]: [RunStatus.IDLE],
  [RunStatus.ERRORED]: [RunStatus.IDLE],
} as const;
