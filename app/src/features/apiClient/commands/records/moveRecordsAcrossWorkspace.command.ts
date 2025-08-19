import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { moveRecords } from "./moveRecords.command";
import { getApiClientFeatureContext, getApiClientRecordsStore, getChildParentMap } from "../store.utils";
import { deleteRecords } from "./deleteRecords.command";
import { NativeError } from "errors/NativeError";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { getAllChildren } from "features/apiClient/store/apiRecords/apiRecords.store";

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

    return result;
  }

  const destinationContext = getApiClientFeatureContext(destination.contextId);
  const { apiClientRecordsRepository } = destinationContext.repositories;

  const recordIds: string[] = [];
  const childParentMap = getChildParentMap(ctx);
  const rootLevelRecords = new Set<string>();

  // get all nested records
  recordsToMove.forEach((record) => {
    rootLevelRecords.add(record.id);

    if (isApiCollection(record)) {
      recordIds.push(...getAllChildren(record.id, childParentMap));
    }

    recordIds.push(record.id);
  });

  const oldToNewIdMap: Map<string, string> = new Map();
  const recordIdToCollectionIdMap: Map<string, string> = new Map();

  const newToOldIdMap: Map<string, string> = new Map();

  const allRecords = recordIds.map((id) => {
    const record = getApiClientRecordsStore(ctx).getState().getData(id);

    recordIdToCollectionIdMap.set(record.id, record.collectionId);

    if (isApiCollection(record)) {
      const newCollectionId = apiClientRecordsRepository.generateCollectionId(record.name);
      oldToNewIdMap.set(record.id, newCollectionId);
      newToOldIdMap.set(newCollectionId, record.id);
      return record;
    }

    const newApiId = apiClientRecordsRepository.generateApiRecordId();
    oldToNewIdMap.set(record.id, newApiId);
    newToOldIdMap.set(newApiId, record.id);
    return record;
  });

  const updatedRecordsWithNewIds: RQAPI.ApiClientRecord[] = allRecords.map((record) => {
    if (record.collectionId === destination.collectionId) {
      return { ...record, id: oldToNewIdMap.get(record.id) };
    } else {
      return { ...record, id: oldToNewIdMap.get(record.id), collectionId: oldToNewIdMap.get(record.collectionId) };
    }
  });

  const createdRecordsResult = await apiClientRecordsRepository.batchCreateRecordsWithExistingId(
    updatedRecordsWithNewIds
  );

  if (!createdRecordsResult.success) {
    throw new NativeError("Failed to move across workspaces!");
  }

  // move into updated collections
  const updatedResult: RQAPI.ApiClientRecord[] = [];
  for (const record of createdRecordsResult.data.records) {
    const createResult = await (async () => {
      const oldId = newToOldIdMap.get(record.id);

      if (rootLevelRecords.has(oldId)) {
        record.collectionId = destination.collectionId;
      } else {
        const oldCollectionId = recordIdToCollectionIdMap.get(oldId);
        const newCollectionId = oldToNewIdMap.get(oldCollectionId);
        record.collectionId = newCollectionId;
      }

      return moveRecords(destinationContext, {
        recordsToMove: [record],
        collectionId: record.collectionId,
      });
    })();

    if (createResult.length) {
      updatedResult.push(createResult[0]);
    }
  }

  if (updatedResult.length === 0) {
    throw new NativeError("Failed to move across workspaces!");
  }

  await deleteRecords(ctx, { records: allRecords });

  return updatedResult;
}
