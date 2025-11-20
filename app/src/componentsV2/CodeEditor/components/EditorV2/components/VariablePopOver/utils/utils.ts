import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";

/**
 * Given the API client feature context and a record ID, returns the
 * corresponding collection ID, if any.
 *
 * - If the record itself is a collection, returns its own ID.
 * - If the record is an API/request, returns its parent collection ID.
 * - Otherwise, or if the record cannot be found, returns undefined.
 *
 * This function is intentionally kept pure and side-effect free so it can be
 * safely reused across components and hooks.
 */
export function getCollectionIdByRecordId(
  ctx: ApiClientFeatureContext,
  recordId: RQAPI.ApiClientRecord["id"] | undefined
): string | undefined {
  if (!recordId) return undefined;

  const record = ctx.stores.records.getState().getData(recordId);
  if (!record) return undefined;

  // If the current record is a collection, use its ID
  if (record.type === RQAPI.RecordType.COLLECTION) {
    return record.id;
  }

  // If the current record is a request, use its parent collection ID
  if (record.type === RQAPI.RecordType.API) {
    return record.collectionId || undefined;
  }

  return undefined;
}
