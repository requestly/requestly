import { RQAPI } from "features/apiClient/types";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";
import {
  CurrentlyExecutingRequest,
  RequestExecutionResult,
} from "features/apiClient/store/collectionRunResult/runResult.store";
import { isHTTPApiEntry, parseCollectionRunnerDataFile } from "features/apiClient/screens/apiClient/utils";
import { NativeError } from "errors/NativeError";
import { notification } from "antd";
import {
  trackCollectionRunSaveHistoryFailed,
  trackCollectionRunStarted,
  trackCollectionRunStopped,
} from "modules/analytics/events/features/apiClient";
import { Abortable, ActiveWorkflow } from "componentsV2/Tabs/slice/types";
import { apiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { RunnerFileMissingError } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/components/RunResultView/errors/RunnerFileMissingError/RunnerFileMissingError";
import { DataFileParseError } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/components/RunResultView/errors/DataFileParseError/DataFileParseError";
import { ITERATIONS_MAX_LIMIT } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import { ExecutionContext } from "features/apiClient/helpers/httpRequestExecutor/scriptExecutionContext";
import { ApiClientFeatureContext, selectRecordById } from "features/apiClient/slices";
import { HostContext } from "hooks/useHostContext";
import { reduxStore } from "store";
import { tabsActions } from "componentsV2/Tabs/slice";
import { getAppMode } from "store/selectors";
import { RunContext } from "../thunks";
import { liveRunResultsActions } from "../../liveRunResults/slice";
import { createCollectionRunCompositeId } from "../../common/runResults/utils";
import { runHistoryActions } from "../../runHistory/slice";
import { HistorySaveStatus, RunHistoryEntry } from "../../runHistory/types";
import { selectLiveRunResultSummary } from "../../liveRunResults/selectors";
import { RunStatus } from "../../common/runResults/types";

function parseExecutingRequestEntry(entry: RQAPI.ApiEntry): RequestExecutionResult["entry"] {
  return isHTTPApiEntry(entry)
    ? {
        type: RQAPI.ApiEntryType.HTTP,
        method: entry.request.method,
        responseTime: entry.response?.time ?? null,
        statusCode: entry.response?.status ?? null,
        statusText: entry.response?.statusText ?? null,
      }
    : {
        type: RQAPI.ApiEntryType.GRAPHQL,
        responseTime: entry.response?.time ?? null,
        statusCode: entry.response?.status ?? null,
        statusText: entry.response?.statusText ?? null,
      };
}

function prepareExecutionResult(params: {
  result: RQAPI.ExecutionResult;
  currentExecutingRequest: Exclude<CurrentlyExecutingRequest, null>; // excluding null as we are calling this function only when request is executed
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
    status: result.warning ? { value: result.status, warning: result.warning } : { value: result.status },
    testResults: result.executedEntry.testResults,
  };
}

class RunCancelled extends NativeError {}

class Runner {
  private variables: Record<string, any>[] = [];
  private activeWorkflow: ActiveWorkflow | null = null;
  private workflowPromiseResolve: (() => void) | null = null;
  private workflowPromiseReject: (() => void) | null = null;
  private id: string;

  constructor(
    readonly ctx: ApiClientFeatureContext,
    readonly executor: BatchRequestExecutor,
    readonly hostContext: HostContext,
    readonly runContext: RunContext
  ) {
    const { runConfigEntity } = this.runContext;
    const runConfig = runConfigEntity.getEntityFromState(this.ctx.store.getState());
    const { collectionId, configId } = runConfig;
    this.id = createCollectionRunCompositeId(collectionId, configId);
  }

  private get abortController() {
    return this.runContext.liveRunResultEntity.getAbortController(this.ctx.store.getState());
  }

  private throwIfRunCancelled() {
    if (this.abortController.signal.aborted) {
      throw new RunCancelled("Run has been cancelled by the user.");
    }
  }

  private getRequest(requestIndex: number): RQAPI.ApiRecord | undefined {
    const runOrder = this.runContext.runConfigEntity.getRunOrder(this.ctx.store.getState());

    if (runOrder[requestIndex] && !runOrder[requestIndex].isSelected) {
      return;
    }

    const request = selectRecordById(this.ctx.store.getState(), runOrder[requestIndex]!.id);

    if (request?.type !== RQAPI.RecordType.API) {
      return;
    }

    return request;
  }

  private async parseDataFile() {
    const dataFile = this.runContext.runConfigEntity.getDataFile(this.ctx.store.getState());
    if (!dataFile) {
      return;
    }

    const apiClientFilesStore = apiClientFileStore.getState();

    const { collectionId } = this.runContext.runConfigEntity.getEntityFromState(this.ctx.store.getState());
    if (!(await apiClientFilesStore.isFilePresentLocally(dataFile.id))) {
      throw new RunnerFileMissingError(
        `The selected data file was moved, renamed, or deleted. Please re-upload the file to continue.`
      ).addContext({
        collectionId,
        filePath: dataFile.path,
      });
    }

    try {
      const parsedData = await parseCollectionRunnerDataFile(dataFile.path, ITERATIONS_MAX_LIMIT);
      return parsedData.data;
    } catch (e) {
      throw new DataFileParseError(
        `The data file used for this collection appears to be damaged or unreadable. Please re-upload a valid file to continue.`
      ).addContext({
        collectionId,
        error: e,
        filePath: dataFile.path,
      });
    }
  }

  private async beforeStart() {
    reduxStore.dispatch(tabsActions.setPreviewTab(undefined));

    const { runConfigEntity } = this.runContext;
    const runConfig = runConfigEntity.getEntityFromState(this.ctx.store.getState());

    this.ctx.store.dispatch(liveRunResultsActions.startRun({ id: this.id }));

    // Reset history save status to IDLE
    this.ctx.store.dispatch(
      runHistoryActions.setHistorySaveStatus({
        status: HistorySaveStatus.IDLE,
      })
    );

    this.variables = [];

    const rootState = reduxStore.getState();
    const appMode = getAppMode(rootState);

    if (appMode === "DESKTOP") {
      const variables = await this.parseDataFile();
      this.variables = variables ?? [];
    }

    trackCollectionRunStarted({
      collection_id: runConfig.collectionId,
      iteration_count: runConfig.iterations,
      delay: runConfig.delay,
      request_count: runConfig.runOrder.filter((r) => r.isSelected).length,
    });

    const selectedRequestsCount = runConfig.runOrder.filter((r) => r.isSelected).length;
    if (selectedRequestsCount === 0) {
      throw new NativeError("No requests were selected to run!");
    }

    // Create an abortable workflow wrapper
    const workflow: Abortable = {
      abort: () => {
        // cancelRun(this.ctx, { runContext: this.runContext });
        // this.abortController.abort();
      },
      then: (cb: () => void) => {
        return workflow;
      },
      catch: (cb: () => void) => {
        // this.abortController.abort();
        return workflow;
      },
    };

    // Store the workflow and register it
    this.activeWorkflow = {
      cancelWarning: "Collection run is in progress, still want to close?",
      workflow,
    };

    // TBD
    this.hostContext.registerWorkflow(this.activeWorkflow);
  }

  private beforeRequestExecutionStart(iteration: number, request: RQAPI.ApiRecord, startTime: number) {
    const collection = selectRecordById(this.ctx.store.getState(), request.collectionId!);

    const currentExecutingRequest: CurrentlyExecutingRequest = {
      startTime,
      iteration,
      recordId: request.id,
      recordName: request.name,
      collectionName: collection?.name ?? "",
      entry: parseExecutingRequestEntry(request.data),
    };

    this.throwIfRunCancelled();

    this.ctx.store.dispatch(
      liveRunResultsActions.setCurrentlyExecutingRequest({
        id: this.id,
        request: currentExecutingRequest,
      })
    );

    return { currentExecutingRequest };
  }

  private afterRequestExecutionComplete(
    currentExecutingRequest: Exclude<CurrentlyExecutingRequest, null>,
    result: RQAPI.ExecutionResult
  ) {
    this.throwIfRunCancelled();

    this.ctx.store.dispatch(
      liveRunResultsActions.setCurrentlyExecutingRequest({
        id: this.id,
        request: null,
      })
    );

    const executionResult = prepareExecutionResult({
      result,
      currentExecutingRequest,
    });

    this.ctx.store.dispatch(
      liveRunResultsActions.addIterationResult({
        id: this.id,
        result: executionResult,
      })
    );
  }

  private async afterComplete() {
    const { collectionId } = this.runContext.runConfigEntity.getEntityFromState(this.ctx.store.getState());

    this.throwIfRunCancelled();

    this.ctx.store.dispatch(
      liveRunResultsActions.finalizeRun({
        id: this.id,
        status: RunStatus.COMPLETED,
        endTime: Date.now(),
      })
    );

    // Get the run summary from liveRunResults
    const state = this.ctx.store.getState();
    const summary = selectLiveRunResultSummary(state, this.id);

    const runResult: RunHistoryEntry = {
      collectionId,
      startTime: summary.startTime,
      endTime: summary.endTime,
      runStatus: summary.runStatus,
      iterations: summary.iterations,
    };

    // Set history save status to SAVING
    this.ctx.store.dispatch(runHistoryActions.addHistoryEntry({ collectionId, entry: runResult }));

    try {
      this.ctx.store.dispatch(
        runHistoryActions.setHistorySaveStatus({
          status: HistorySaveStatus.SAVING,
        })
      );

      const result = await this.ctx.repositories.apiClientRecordsRepository.addRunResult(collectionId, runResult);
      if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
        throw new NativeError("Something went wrong while saving run result!").addContext({
          collectionId,
          runResult,
        });
      }

      this.ctx.store.dispatch(
        runHistoryActions.setHistorySaveStatus({
          status: HistorySaveStatus.SUCCESS,
        })
      );

      notification.success({
        message: "Run completed!",
        placement: "bottomRight",
        className: "collection-runner-notification",
        duration: 3,
      });

      // Resolve the workflow promise on success
      if (this.workflowPromiseResolve) {
        this.workflowPromiseResolve();
      }
    } catch (e) {
      // Set history save status to FAILED
      this.ctx.store.dispatch(
        runHistoryActions.setHistorySaveStatus({
          status: HistorySaveStatus.FAILED,
          error: e instanceof Error ? e.message : null,
        })
      );

      trackCollectionRunSaveHistoryFailed({
        collection_id: collectionId,
      });
    }
  }

  private onError(error: Error) {
    // Reject the workflow promise on error
    if (this.workflowPromiseReject) {
      this.workflowPromiseReject();
    }

    this.ctx.store.dispatch(
      liveRunResultsActions.finalizeRun({
        id: this.id,
        error,
        status: RunStatus.CANCELLED,
        endTime: Date.now(),
      })
    );
  }

  private onRunCancelled() {
    this.ctx.store.dispatch(
      liveRunResultsActions.finalizeRun({
        id: this.id,
        status: RunStatus.CANCELLED,
        endTime: Date.now(),
      })
    );

    notification.error({
      message: "Run stopped!",
      placement: "bottomRight",
      className: "collection-runner-notification",
      duration: 3,
    });

    const runConfig = this.runContext.runConfigEntity.getEntityFromState(this.ctx.store.getState());
    const { collectionId } = runConfig;

    trackCollectionRunStopped({
      collection_id: collectionId,
      iteration_count: runConfig.iterations,
      delay: runConfig.delay,
      request_count: runConfig.runOrder.filter((r) => r.isSelected).length,
    });

    // Reject the workflow promise on cancellation
    if (this.workflowPromiseReject) {
      this.workflowPromiseReject();
    }
  }

  private cleanup() {
    // Workflow cleanup is handled automatically by registerWorkflow when promise resolves/rejects
    // The workflow is stored in this.activeWorkflow for reference if needed
    this.activeWorkflow = null;
    this.workflowPromiseResolve = null;
    this.workflowPromiseReject = null;
  }

  private async delay(iterationIndex: number, executingRequestIndex: number): Promise<void> {
    const delay = this.runContext.runConfigEntity.getDelay(this.ctx.store.getState());

    const isFirstIteration = iterationIndex === 0;
    const isFirstExecutingRequestInIteration = executingRequestIndex === 0;

    if (isFirstIteration && isFirstExecutingRequestInIteration) {
      return;
    }

    if (delay <= 0) {
      return;
    }

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

  private async *iterate() {
    const runConfig = this.runContext.runConfigEntity.getEntityFromState(this.ctx.store.getState());
    const iterations = runConfig.iterations;
    const requestsCount = runConfig.runOrder.length;

    for (let iterationIndex = 0; iterationIndex < iterations; iterationIndex++) {
      let executingRequestIndex = 0; // Track index among executing requests only

      for (let requestIndex = 0; requestIndex < requestsCount; requestIndex++) {
        const request = this.getRequest(requestIndex);
        if (!request) {
          continue;
        }

        const startTime = Date.now();
        await this.delay(iterationIndex, executingRequestIndex);

        yield {
          request,
          iteration: iterationIndex + 1,
          startTime,
        };

        executingRequestIndex++; // Increment only for executing requests
      }
    }
  }

  async run() {
    try {
      await this.beforeStart();
      const iterationCount = this.runContext.runConfigEntity.getIterations(this.ctx.store.getState());
      const executionContext: ExecutionContext = {} as ExecutionContext; // Empty object that will be filled and shared across iterations

      for await (const { request, iteration, startTime } of this.iterate()) {
        const { currentExecutingRequest } = this.beforeRequestExecutionStart(iteration, request, startTime);
        const result = await this.executor.executeSingleRequest(
          { entry: request.data as RQAPI.ApiEntry, recordId: request.id },
          {
            iteration: iteration - 1, // We want 0-based index for usage in scripts
            iterationCount,
          },
          { abortController: this.abortController, executionContext }
        );

        this.afterRequestExecutionComplete(currentExecutingRequest, result);
      }

      await this.afterComplete();
    } catch (e) {
      console.error({ e });
      if (e instanceof RunCancelled) {
        this.onRunCancelled();
        return;
      }

      this.onError(e);
      return e;
    } finally {
      this.cleanup();
    }
  }
}

export async function runCollection(params: {
  ctx: ApiClientFeatureContext;
  executor: BatchRequestExecutor;
  hostContext: HostContext;
  runContext: RunContext;
}) {
  const runner = new Runner(params.ctx, params.executor, params.hostContext, params.runContext);
  return runner.run();
}
