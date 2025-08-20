import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { moveRecords } from "./moveRecords.command";
import { getApiClientFeatureContext, getApiClientRecordsStore, saveBulkRecords } from "../store.utils";
import { deleteRecords } from "./deleteRecords.command";
import { NativeError } from "errors/NativeError";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { getAllRecords } from "../utils";
import { forceRefreshRecords } from "./force-refresh.command";

export async function moveRecordsAcrossWorkspace(
  ctx: ApiClientFeatureContext,
  params: {
    recordsToMove: RQAPI.ApiClientRecord[];
    destination: {
      contextId: string;
      collectionId: RQAPI.ApiClientRecord["id"];
    };
  }
) {
  const { recordsToMove, destination } = params;

  // move in same context
  if (ctx.id === destination.contextId) {
    const result = await moveRecords(ctx, {
      recordsToMove: recordsToMove,
      collectionId: destination.collectionId,
    });

    return { movedRecords: result };
  }

  const destinationContext = getApiClientFeatureContext(destination.contextId);
  const { apiClientRecordsRepository } = destinationContext.repositories;

  const recordIds: string[] = [];
  const rootLevelRecords = new Set<string>();

  // get all nested records in dfs manner
  recordsToMove.forEach((record) => {
    rootLevelRecords.add(record.id);
    recordIds.push(...getAllRecords([record]).map((r) => r.id));
  });

  const oldToNewIdMap: Map<string, string> = new Map();
  const recordIdToCollectionIdMap: Map<string, string> = new Map();
  const newToOldIdMap: Map<string, string> = new Map();

  const _allRecords = recordIds.map((id) => {
    const record = getApiClientRecordsStore(ctx).getState().getData(id);
    recordIdToCollectionIdMap.set(record.id, record.collectionId);
    return record;
  });

  _allRecords.forEach((record) => {
    let parentId = null;
    if (rootLevelRecords.has(record.id)) {
      parentId = destination.collectionId;
    } else {
      parentId = oldToNewIdMap.get(record.collectionId);
    }

    const newId = isApiCollection(record)
      ? apiClientRecordsRepository.generateCollectionId(record.name, parentId)
      : apiClientRecordsRepository.generateApiRecordId(parentId);

    oldToNewIdMap.set(record.id, newId);
    newToOldIdMap.set(newId, record.id);
  });

  const updatedRecordsWithNewIds: RQAPI.ApiClientRecord[] = _allRecords.map((record) => {
    return {
      ...record,
      id: oldToNewIdMap.get(record.id),
      collectionId: rootLevelRecords.has(record.collectionId)
        ? destination.collectionId
        : oldToNewIdMap.get(record.collectionId),
    };
  });

  const createdRecordsResult = await apiClientRecordsRepository.batchCreateRecordsWithExistingId(
    updatedRecordsWithNewIds
  );

  saveBulkRecords(destinationContext, createdRecordsResult.data.records);

  if (!createdRecordsResult.success) {
    throw new NativeError("Failed to move across workspace!");
  }

  await forceRefreshRecords(destinationContext);

  await deleteRecords(ctx, { records: _allRecords });

  return { oldContextRecords: _allRecords };
}
