import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";
import { RunContext } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/run.context";
import {
  CurrentlyExecutingRequest,
  RequestExecutionResult,
  RunStatus,
} from "features/apiClient/store/collectionRunResult/runResult.store";
import { isHTTPApiEntry } from "features/apiClient/screens/apiClient/utils";

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

function parseExecutingRequestEntry(entry: RQAPI.ApiEntry): RequestExecutionResult["entry"] {
  return isHTTPApiEntry(entry)
    ? {
        type: entry.type,
        method: entry.request.method,
      }
    : { type: entry.type };
}

function parseExecutionResult(params: {
  recordId: string;
  result: RQAPI.ExecutionResult;
  iteration: number;
  startTime: number;
}): RequestExecutionResult {
  const { recordId, result, iteration, startTime } = params;

  if (result.status === RQAPI.ExecutionStatus.ERROR) {
    return {
      iteration,
      recordId,
      entry: parseExecutingRequestEntry(result.executedEntry),
      status: { value: result.status, error: result.error },
      duration: null,
      statusCode: null,
      testResults: null,
    };
  }

  return {
    iteration,
    recordId,
    duration: Date.now() - startTime,
    entry: parseExecutingRequestEntry(result.executedEntry),
    status: { value: result.status, warning: result.warning },
    statusCode: result.executedEntry.response.status,
    testResults: result.executedEntry.testResults,
  };
}

export async function runCollection(
  ctx: ApiClientFeatureContext,
  params: {
    runContext: RunContext;
    executor: BatchRequestExecutor;
  }
) {
  const { executor, runContext } = params;
  const { runConfigStore, runResultStore } = runContext;
  const { getConfig, orderedRequests } = runConfigStore.getState();
  const { iterations, delay } = getConfig();

  runResultStore.getState().clearAll();

  runResultStore.getState().setRunStatus(RunStatus.RUNNING);
  const requestsCount = orderedRequests.length;
  for (let iterationIndex = 0; iterationIndex < iterations; iterationIndex++) {
    for (let requestIndex = 0; requestIndex < requestsCount; requestIndex++) {
      if (runResultStore.getState().runStatus === RunStatus.CANCELLED) {
        // TODO
        return;
      }

      const request = orderedRequests[requestIndex];

      if (!request.isSelected) {
        continue;
      }

      const parsedRequest = parseRequestToExecute(request);

      const startTime = Date.now();
      const currentExecutingRequest: CurrentlyExecutingRequest = {
        startTime,
        iteration: iterationIndex + 1,
        recordId: request.record.id,
        entry: parseExecutingRequestEntry(request.record.data),
      };

      runResultStore.getState().setCurrentlyExecutingRequest(currentExecutingRequest);

      const result = await executor.executeSingleRequest(parsedRequest.recordId, parsedRequest.entry);

      runResultStore.getState().setCurrentlyExecutingRequest(null);

      const executionResult = parseExecutionResult({
        iteration: iterationIndex + 1,
        startTime,
        recordId: request.record.id,
        result,
      });

      runResultStore.getState().addResult(executionResult);

      // Only delay if there's a next request
      const isLastIteration = iterationIndex === iterations - 1;
      const isLastRequestInIteration = requestIndex === requestsCount - 1;
      const hasNextRequest = !isLastIteration || !isLastRequestInIteration;

      if (hasNextRequest && delay > 0) {
        await executor.delay(delay);
      }
    }
  }

  runResultStore.getState().setRunStatus(RunStatus.COMPLETED);
  // TODO: store result into history
}
