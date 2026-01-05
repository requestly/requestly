import { createAction } from "@reduxjs/toolkit";
import { ApiClientEntityType } from "../entities/types";

export type EntitySyncedPayload<T = unknown> = {
  entityType: ApiClientEntityType;
  entityId: string;
  data: Partial<T>;
}

/**
 * Dispatched by entity slices after any mutation (create, update, hydrate).
 * Buffer middleware listens to this to sync open buffers.
 */
export const entitySynced = createAction<EntitySyncedPayload>("entities/synced");

