import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { moveRecords } from "./moveRecords.command";
import { getApiClientFeatureContext, getApiClientRecordsStore } from "../store.utils";
import { deleteRecords } from "./deleteRecords.command";
import { NativeError } from "errors/NativeError";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { getAllRecords } from "../utils";

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

  console.log({ recordsToMove });

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
  const rootLevelRecords = new Set<string>();

  // get all nested records
  recordsToMove.forEach((record) => {
    rootLevelRecords.add(record.id);

    if (isApiCollection(record)) {
      console.log({ collection: record });
      recordIds.push(...getAllRecords([record]).map((r) => r.id));
    } else {
      recordIds.push(record.id);
    }
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
    const newId = isApiCollection(record)
      ? apiClientRecordsRepository.generateCollectionId(record.name)
      : apiClientRecordsRepository.generateApiRecordId();

    oldToNewIdMap.set(record.id, newId);
    newToOldIdMap.set(newId, record.id);
  });

  const updatedRecordsWithNewIds: RQAPI.ApiClientRecord[] = _allRecords.map((record) => {
    if (rootLevelRecords.has(record.id)) {
      return { ...record, id: oldToNewIdMap.get(record.id), collectionId: destination.collectionId };
    } else {
      return {
        ...record,
        id: oldToNewIdMap.get(record.id),
        collectionId: rootLevelRecords.has(record.collectionId)
          ? destination.collectionId
          : oldToNewIdMap.get(record.collectionId),
      };
    }
  });

  const createdRecordsResult = await apiClientRecordsRepository.batchCreateRecordsWithExistingId(
    updatedRecordsWithNewIds
  );

  console.log({ rootLevelRecords, recordIds, _allRecords, updatedRecordsWithNewIds, createdRecordsResult });

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

  await deleteRecords(ctx, { records: _allRecords });

  return updatedResult;
}
