import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { sanitizePatch } from "../utils";
import { RQAPI } from "features/apiClient/types";

export async function patchCollectionVariables(
  ctx: ApiClientFeatureContext,
  params: { collectionId: string; patch: EnvironmentVariables }
) {
  const { repositories, stores } = ctx;
  const { collectionId, patch: variables } = params;
  const collection = stores.records.getState().getRecordStore(collectionId)?.getState();
  if (!collection) {
    throw new Error(`Collection with id ${collectionId} not found`);
  }

  if (!collection.type || collection.type !== RQAPI.RecordType.COLLECTION) {
    throw new Error(`Record with id ${collectionId} is not a collection`);
  }

  const prunedPatch = sanitizePatch(variables);
  await repositories.apiClientRecordsRepository.setCollectionVariables(collection.record.id, prunedPatch);
  collection.collectionVariables.getState().mergeAndUpdate(prunedPatch);
}
