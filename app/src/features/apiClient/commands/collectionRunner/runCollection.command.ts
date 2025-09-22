import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";

function parseRequestToExecute(
  orderedRequest: RQAPI.OrderedRequest
): {
  recordId: RQAPI.ApiRecord["id"];
  entry: RQAPI.ApiEntry;
} {
  const { record } = orderedRequest;

  const parsedRequest = {
    recordId: record.id,
    entry: record.data,
  };

  return parsedRequest;
}

export async function runCollection(
  ctx: ApiClientFeatureContext,
  params: {
    runResultStore: any; // TODO: create run result store
    executor: BatchRequestExecutor;
    runConfig: RQAPI.RunConfig;
    orderedRequests: RQAPI.OrderedRequests;
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

      if (!request.isSelected) {
        continue;
      }

      const parsedRequest = parseRequestToExecute(request);

      // TODO: mark request run loading state here
      const result = await executor.executeSingleRequest(parsedRequest.recordId, parsedRequest.entry);

      console.log(`Iteration: ${iterationIndex + 1} :: Request: ${requestIndex + 1}`, { result });

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
