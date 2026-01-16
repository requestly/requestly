import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "features/apiClient/types";
import { moveRecords } from "./moveRecords.command";
import { getApiClientFeatureContext } from "../store.utils";
import { forceRefreshRecords } from "./force-refresh.command";

export async function moveRecordsAcrossWorkspace(
  ctx: ApiClientFeatureContext,
  params: {
    recordsToMove: RQAPI.ApiClientRecord[];
    ranks?: string[];
    destination: {
      contextId: string;
      collectionId: RQAPI.ApiClientRecord["id"];
    };
  }
) {
  const { recordsToMove, ranks, destination } = params;

  const result = await moveRecords(ctx, {
    recordsToMove: recordsToMove,
    ranks,
    collectionId: destination.collectionId,
  });

  // Always refresh both contexts to ensure UI stays in sync
  if (destination.contextId !== ctx.id) {
    const destinationContext = getApiClientFeatureContext(destination.contextId);

    // Refresh both workspaces to reflect the changes
    await Promise.all([forceRefreshRecords(destinationContext), forceRefreshRecords(ctx)]);
  } else {
    // Even when moving within the same workspace, refresh to ensure UI updates
    await forceRefreshRecords(ctx);
  }

  return { oldContextRecords: recordsToMove, movedRecords: result };
}
