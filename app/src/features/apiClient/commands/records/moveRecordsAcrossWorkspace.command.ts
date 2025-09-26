import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { moveRecords } from "./moveRecords.command";
import { getApiClientFeatureContext } from "../store.utils";
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

  const result = await moveRecords(ctx, {
    recordsToMove: recordsToMove,
    collectionId: destination.collectionId,
  });


  if (destination.contextId !== ctx.id) {
    const destinationContext = getApiClientFeatureContext(destination.contextId);
    await forceRefreshRecords(destinationContext);
    await forceRefreshRecords(ctx);
  }

  return { oldContextRecords: recordsToMove, movedRecords: result };
}
