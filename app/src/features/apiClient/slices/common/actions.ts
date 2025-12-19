import { createAction } from "@reduxjs/toolkit";
import { ApiClientEntityType } from "../entities/types";

/**
 * Dispatched by entity slices after any mutation (create, update, hydrate).
 * Buffer middleware listens to this to sync open buffers.
 */
export const entitySynced = createAction<{
  entityType: ApiClientEntityType;
  entityId: string;
  data: unknown;
}>("entities/synced");

