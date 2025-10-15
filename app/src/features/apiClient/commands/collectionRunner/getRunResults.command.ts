import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { RQAPI } from "features/apiClient/types";

export async function getRunResults(
  ctx: ApiClientFeatureContext,
  params: { collectionId: RQAPI.ApiClientRecord["collectionId"] }
): Promise<RunResult[]> {
  const { collectionId } = params;
  const { apiClientRecordsRepository } = ctx.repositories;

  const result = await apiClientRecordsRepository.getRunResults(collectionId);

  if (result.success) {
    return result.data;
  }

  if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
    throw new NativeError("Something went wrong while fetching run results!").addContext({ collectionId });
  }

  return [];
}
