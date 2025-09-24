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
import { NativeError } from "errors/NativeError";

function parseExecutingRequestEntry(entry: RQAPI.ApiEntry): RequestExecutionResult["entry"] {
  return isHTTPApiEntry(entry)
    ? {
        type: entry.type,
        method: entry.request.method,
        responseTime: entry.response?.time ?? null,
        statusCode: entry.response?.status ?? null,
        statusText: entry.response?.statusText ?? null,
      }
    : {
        type: entry.type,
        responseTime: entry.response?.time ?? null,
        statusCode: entry.response?.status ?? null,
        statusText: entry.response?.statusText ?? null,
      };
}

function parseExecutionResult(params: {
  recordId: string;
  recordName: string;
  result: RQAPI.ExecutionResult;
  iteration: number;
  startTime: number;
}): RequestExecutionResult {
  const { recordId, recordName, result, iteration, startTime } = params;

  if (result.status === RQAPI.ExecutionStatus.ERROR) {
    return {
      iteration,
      recordId,
      recordName,
      entry: parseExecutingRequestEntry(result.executedEntry),
      status: { value: result.status, error: result.error },
      runDuration: null,
      testResults: null,
    };
  }

  return {
    iteration,
    recordId,
    recordName,
    runDuration: Date.now() - startTime,
    entry: parseExecutingRequestEntry(result.executedEntry),
    status: { value: result.status, warning: result.warning },
    testResults: result.executedEntry.testResults,
  };
}

class RunCancelled extends NativeError {}

class Runner {
  constructor(readonly runContext: RunContext, readonly executor: BatchRequestExecutor) {}

  private get abortController() {
    return this.runContext.runResultStore.getState().abortController;
  }

  private throwIfRunCancelled() {
    if (this.abortController.signal.aborted) {
      throw new RunCancelled();
    }
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
    this.runContext.runResultStore.getState().reset();
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.RUNNING);
    this.runContext.runResultStore.getState().setStartTime(Date.now());
    this.runContext.runResultStore.getState().setEndtime(null);
  }

  private beforeRequestExecutionStart(iteration: number, request: RQAPI.OrderedRequest) {
    const startTime = Date.now();
    const currentExecutingRequest: CurrentlyExecutingRequest = {
      startTime,
      iteration,
      recordId: request.record.id,
      recordName: request.record.name,
      entry: parseExecutingRequestEntry(request.record.data),
    };

    this.throwIfRunCancelled();
    this.runContext.runResultStore.getState().setCurrentlyExecutingRequest(currentExecutingRequest);

    return {
      currentExecutingRequest,
    };
  }

  private afterRequestExecutionComplete(
    currentExecutingRequest: CurrentlyExecutingRequest,
    result: RQAPI.ExecutionResult
  ) {
    this.throwIfRunCancelled();
    this.runContext.runResultStore.getState().setCurrentlyExecutingRequest(null);

    const executionResult = parseExecutionResult({
      iteration: currentExecutingRequest.iteration,
      startTime: currentExecutingRequest.startTime,
      recordId: currentExecutingRequest.recordId,
      recordName: currentExecutingRequest.recordName,
      result,
    });

    this.runContext.runResultStore.getState().addResult(executionResult);
  }

  private afterComplete() {
    this.throwIfRunCancelled();
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.COMPLETED);
    this.runContext.runResultStore.getState().setEndtime(Date.now());
  }

  private onError(error: any) {
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.ERRORED);
    this.runContext.runResultStore.getState().setEndtime(null);
  }

  private onRunCancelled() {
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.CANCELLED);
    this.runContext.runResultStore.getState().setEndtime(null);
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
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, delay);

        const abortHandler = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.abortController.signal.addEventListener("abort", abortHandler, { once: true });
      });
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
        };

        await this.delay(iterationIndex, requestIndex);
      }
    }
  }

  async run() {
    try {
      this.beforeStart();

      for await (const { request, iteration } of this.iterate()) {
        const { currentExecutingRequest } = this.beforeRequestExecutionStart(iteration, request);
        const result = await this.executor.executeSingleRequest(
          request.record.id,
          request.record.data,
          this.runContext.runResultStore.getState().abortController
        );
        this.afterRequestExecutionComplete(currentExecutingRequest, result);
      }

      this.afterComplete();
    } catch (e) {
      if (e instanceof RunCancelled) {
        this.onRunCancelled();
        return;
      }
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
