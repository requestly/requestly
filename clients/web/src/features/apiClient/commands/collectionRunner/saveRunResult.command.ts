import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { NativeError } from "errors/NativeError";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";

export async function saveRunResult(
  ctx: ApiClientFeatureContext,
  params: {
    collectionId: RQAPI.ApiClientRecord["collectionId"];
    runResult: RunResult;
  }
) {
  const { collectionId, runResult } = params;
  const { apiClientRecordsRepository } = ctx.repositories;

  const result = await apiClientRecordsRepository.addRunResult(collectionId, runResult);

  if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
    throw new NativeError("Something went wrong while saving run result!").addContext({
      collectionId,
      runResult,
    });
  }
}
