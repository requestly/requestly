import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";

function parseRequestToExecute(
  request: RQAPI.ApiRecord
): {
  recordId: RQAPI.ApiRecord["id"];
  entry: RQAPI.ApiEntry;
} {
  const parsedRequest = {
    recordId: request.id,
    entry: request.data,
  };

  return parsedRequest;
}

export async function runCollection(
  ctx: ApiClientFeatureContext,
  params: {
    runResultStore: any; // TODO: create run result store
    executor: BatchRequestExecutor;
    runConfig: RQAPI.RunConfig;
    orderedRequests: RQAPI.ApiRecord[];
  }
) {
  const { executor, runConfig, orderedRequests } = params;
  const { iterations, delay } = runConfig;

  // TODO: cleanup the runResultStore before run

  const requestsCount = orderedRequests.length;
  for (let iterationIndex = 0; iterationIndex < iterations; iterationIndex++) {
    // TODO: store per iterations result
    for (let requestIndex = 0; requestIndex < requestsCount; requestIndex++) {
      // TODO: check if cancel run marked or not here
      // if (runResultStore.isCancelled()) {
      //   return;
      // }

      const request = orderedRequests[requestIndex];
      const parsedRequest = parseRequestToExecute(request);

      // TODO: mark request run loading state here
      const result = await executor.executeSingleRequest(parsedRequest.recordId, parsedRequest.entry);

      console.log({ result });

      // Only delay if there's a next request
      const isLastIteration = iterationIndex === iterations - 1;
      const isLastRequestInIteration = requestIndex === requestsCount - 1;
      const hasNextRequest = !isLastIteration || !isLastRequestInIteration;

      if (hasNextRequest && delay > 0) {
        await executor.delay(delay);
      }

      // TODO: push result into store
    }
  }

  // TODO: store result into history
}
