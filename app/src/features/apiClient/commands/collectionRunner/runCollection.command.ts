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

class Runner {
  constructor(
    readonly runContext: RunContext,
    readonly executor: BatchRequestExecutor,
  ) {

  }

  private getRequest(requestIndex: number) {
    const { orderedRequests } = this.runContext.runConfigStore.getState();
    const request = orderedRequests[requestIndex];

    if (!request.isSelected) {
      return;
    }

    return request;
  }

  private beforeStart() {
    this.runContext.runResultStore.getState().clearAll();
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.RUNNING);
  }

  private beforeRequestExecutionStart(iteration: number, request: RQAPI.OrderedRequest) {
    const startTime = Date.now();
    const currentExecutingRequest: CurrentlyExecutingRequest = {
      startTime,
      iteration,
      recordId: request.record.id,
      entry: parseExecutingRequestEntry(request.record.data),
    };

    this.runContext.runResultStore.getState().setCurrentlyExecutingRequest(currentExecutingRequest);

    return {
      currentExecutingRequest,
    }

  }

  private afterRequestExecutionComplete(currentExecutingRequest: CurrentlyExecutingRequest, result: RQAPI.ExecutionResult) {
    this.runContext.runResultStore.getState().setCurrentlyExecutingRequest(null);

    const executionResult = parseExecutionResult({
      iteration: currentExecutingRequest.iteration,
      startTime: currentExecutingRequest.startTime,
      recordId: currentExecutingRequest.recordId,
      result,
    });

    this.runContext.runResultStore.getState().addResult(executionResult);

  }

  private afterComplete() {
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.COMPLETED);
  }

  private onError(error: any) {
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.ERRORED);
  }

  private async delay(iterationIndex: number, requestIndex: number): Promise<void> {
    const { runContext } = this;
    const { runConfigStore } = runContext;
    const { getConfig, orderedRequests } = runConfigStore.getState();
    const { delay, iterations } = getConfig();
    const requestsCount = orderedRequests.length;

    const isLastIteration = iterationIndex === iterations - 1;
    const isLastRequestInIteration = requestIndex === requestsCount - 1;
    const hasNextRequest = !isLastIteration || !isLastRequestInIteration;

    if (hasNextRequest && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

  }

  private async *iterate() {
    const { runContext } = this;
    const { runConfigStore } = runContext;
    const { getConfig, orderedRequests } = runConfigStore.getState();
    const { iterations } = getConfig();
    const requestsCount = orderedRequests.length;

    for (let iterationIndex = 0; iterationIndex < iterations; iterationIndex++) {
      for (let requestIndex = 0; requestIndex < requestsCount; requestIndex++) {
        const request = this.getRequest(requestIndex);
        if (!request) {
          continue;
        }

        yield {
          request,
          iteration: iterationIndex + 1,
        }

        await this.delay(iterationIndex, requestIndex);
      }
    }

  }

  async run() {
    try {
      this.beforeStart();
      for await (const { request, iteration } of this.iterate()) {
        const { currentExecutingRequest } = this.beforeRequestExecutionStart(iteration, request);
        const result = await this.executor.executeSingleRequest(request.record.id, request.record.data);
        this.afterRequestExecutionComplete(currentExecutingRequest, result);
      }
      this.afterComplete();
    }
    catch (e) {
      this.onError(e);
      return e;
    }
  }

}

export async function runCollection(
  _: ApiClientFeatureContext,
  params: {
    runContext: RunContext;
    executor: BatchRequestExecutor;
  }
) {
  const runner = new Runner(params.runContext, params.executor);
  return runner.run();
}
