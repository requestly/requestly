import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { moveRecords } from "./moveRecords.command";
import { getApiClientFeatureContext } from "../store.utils";
import { deleteRecords } from "./deleteRecords.command";

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

  if (ctx.id === destination.contextId) {
    const result = await moveRecords(ctx, {
      recordsToMove: recordsToMove,
      collectionId: destination.collectionId,
    });

    return result;
  }

  const destinationContext = getApiClientFeatureContext(destination.contextId);
  const newOwnerId = destinationContext.repositories.apiClientRecordsRepository.getOwner();

  // update the owner of records
  const updatedRecordsToMove = recordsToMove.map((record) => {
    return { ...record, ownerId: newOwnerId };
  });

  // put it in new context
  const result = await moveRecords(destinationContext, {
    recordsToMove: updatedRecordsToMove,
    collectionId: destination.collectionId,
  });

  // delete from old context
  await deleteRecords(ctx, { records: recordsToMove });

  return result;
}
