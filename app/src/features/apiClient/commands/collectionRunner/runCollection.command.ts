import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";
import { RunContext } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/run.context";
import {
  CurrentlyExecutingRequest,
  RequestExecutionResult,
  RunResult,
  RunStatus,
} from "features/apiClient/store/collectionRunResult/runResult.store";
import { isHTTPApiEntry } from "features/apiClient/screens/apiClient/utils";
import { NativeError } from "errors/NativeError";
import { notification } from "antd";
import { saveRunResult } from "./saveRunResult.command";
import {
  trackCollectionRunSaveHistoryFailed,
  trackCollectionRunStarted,
  trackCollectionRunStopped,
} from "modules/analytics/events/features/apiClient";
import { GenericState } from "hooks/useGenericState";
import { CloseTopic } from "componentsV2/Tabs/store/tabStore";
import { cancelRun } from "./cancelRun.command";

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

function prepareExecutionResult(params: {
  result: RQAPI.ExecutionResult;
  currentExecutingRequest: CurrentlyExecutingRequest;
}): RequestExecutionResult {
  const { result, currentExecutingRequest } = params;
  const { iteration, recordId, recordName, collectionName, startTime } = currentExecutingRequest;

  if (result.status === RQAPI.ExecutionStatus.ERROR) {
    return {
      iteration,
      recordId,
      recordName,
      collectionName,
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
    collectionName,
    runDuration: Date.now() - startTime,
    entry: parseExecutingRequestEntry(result.executedEntry),
    status: { value: result.status, warning: result.warning || null },
    testResults: result.executedEntry.testResults,
  };
}

class RunCancelled extends NativeError {}

class Runner {
  constructor(
    readonly ctx: ApiClientFeatureContext,
    readonly runContext: RunContext,
    readonly executor: BatchRequestExecutor,
    readonly tabState: GenericState
  ) {}

  private get abortController() {
    return this.runContext.runResultStore.getState().abortController;
  }

  private throwIfRunCancelled() {
    if (this.abortController.signal.aborted) {
      throw new RunCancelled();
    }
  }

  private getRequest(requestIndex: number): RQAPI.ApiRecord {
    const { runOrder } = this.runContext.runConfigStore.getState();

    if (!runOrder[requestIndex].isSelected) {
      return;
    }
    const request = this.ctx.stores.records.getState().getData(runOrder[requestIndex].id) as RQAPI.ApiRecord;

    return request;
  }

  private beforeStart() {
    this.runContext.runResultStore.getState().reset();
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.RUNNING);
    this.runContext.runResultStore.getState().setStartTime(Date.now());
    this.runContext.runResultStore.getState().setEndtime(null);

    const selectedRequestsCount = this.runContext.runConfigStore.getState().runOrder.filter((r) => r.isSelected).length;
    if (selectedRequestsCount === 0) {
      throw new NativeError("No requests were selected to run!");
    }

    const configId = this.runContext.runConfigStore.getState().getConfig().id;
    this.tabState.addCloseBlocker(CloseTopic.COLLECTION_RUNNING, configId, {
      title: "Collection run is in progress, still want to close?",
      onConfirm: () => {
        cancelRun(this.ctx, { runContext: this.runContext });
      },
    });
  }

  private beforeRequestExecutionStart(iteration: number, request: RQAPI.ApiRecord) {
    const startTime = Date.now();
    const collection = this.ctx.stores.records.getState().getData(request.collectionId);
    const currentExecutingRequest: CurrentlyExecutingRequest = {
      startTime,
      iteration,
      recordId: request.id,
      recordName: request.name,
      collectionName: collection?.name ?? "",
      entry: parseExecutingRequestEntry(request.data),
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

    const executionResult = prepareExecutionResult({
      result,
      currentExecutingRequest,
    });

    this.runContext.runResultStore.getState().addResult(executionResult);
  }

  private async afterComplete(collectionId: RQAPI.ApiClientRecord["collectionId"]) {
    this.throwIfRunCancelled();
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.COMPLETED);
    this.runContext.runResultStore.getState().setEndtime(Date.now());

    const runResult = this.runContext.runResultStore.getState().getRunSummary() as RunResult;
    this.runContext.runResultStore.getState().addToHistory(runResult);
    try {
      await saveRunResult(this.ctx, {
        collectionId,
        runResult: runResult,
      });
      notification.success({
        message: "Run completed!",
        placement: "bottomRight",
        className: "collection-runner-notification",
        duration: 3,
      });
    } catch (e) {
      notification.error({
        message: "Run completed but couldn't save the result!",
        placement: "bottomRight",
        className: "collection-runner-notification",
        duration: 3,
        style: { width: "fit-content" },
      });

      trackCollectionRunSaveHistoryFailed({
        collection_id: collectionId,
      });
    }
  }

  private onError(error: any) {
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.ERRORED);
    this.runContext.runResultStore.getState().setEndtime(null);
  }

  private onRunCancelled() {
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.CANCELLED);
    this.runContext.runResultStore.getState().setCurrentlyExecutingRequest(null);
    this.runContext.runResultStore.getState().setEndtime(null);
    notification.error({
      message: "Run stopped!",
      placement: "bottomRight",
      className: "collection-runner-notification",
      duration: 3,
    });
  }

  private cleanup() {
    const configId = this.runContext.runConfigStore.getState().getConfig().id;
    this.tabState.removeCloseBlocker(CloseTopic.COLLECTION_RUNNING, configId);
  }

  private async delay(iterationIndex: number, requestIndex: number, requestsCount: number): Promise<void> {
    const { runContext } = this;
    const { runConfigStore } = runContext;
    const { getConfig } = runConfigStore.getState();
    const { delay, iterations } = getConfig();

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
    const { getConfig, runOrder } = runConfigStore.getState();

    const { iterations } = getConfig();
    const requestsCount = runOrder.length;

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

        await this.delay(iterationIndex, requestIndex, requestsCount);
      }
    }
  }

  async run() {
    const runConfig = this.runContext.runConfigStore.getState().getConfig();
    const collectionId = this.runContext.collectionId;
    try {
      this.beforeStart();

      trackCollectionRunStarted({
        collection_id: collectionId,
        iteration_count: runConfig.iterations,
        delay: runConfig.delay,
        request_count: runConfig.runOrder.filter((r) => r.isSelected).length,
      });

      for await (const { request, iteration } of this.iterate()) {
        const { currentExecutingRequest } = this.beforeRequestExecutionStart(iteration, request);
        const result = await this.executor.executeSingleRequest(
          request.id,
          request.data,
          this.runContext.runResultStore.getState().abortController
        );
        this.afterRequestExecutionComplete(currentExecutingRequest, result);
      }

      await this.afterComplete(collectionId);
    } catch (e) {
      if (e instanceof RunCancelled) {
        this.onRunCancelled();

        trackCollectionRunStopped({
          collection_id: collectionId,
          iteration_count: runConfig.iterations,
          delay: runConfig.delay,
          request_count: runConfig.runOrder.filter((r) => r.isSelected).length,
        });
        return;
      }
      this.onError(e);
      return e;
    } finally {
      this.cleanup();
    }
  }
}

export async function runCollection(
  ctx: ApiClientFeatureContext,
  params: {
    runContext: RunContext;
    executor: BatchRequestExecutor;
    tabState: GenericState;
  }
) {
  const runner = new Runner(ctx, params.runContext, params.executor, params.tabState);
  return runner.run();
}
