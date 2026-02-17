import { RQAPI } from "features/apiClient/types";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";
import { CurrentlyExecutingRequest, RequestExecutionResult } from "../../common/runResults/types";
import { isHTTPApiEntry, parseCollectionRunnerDataFile } from "features/apiClient/screens/apiClient/utils";
import { NativeError } from "errors/NativeError";
import { notification } from "antd";
import {
  trackCollectionRunSaveHistoryFailed,
  trackCollectionRunStarted,
  trackCollectionRunStopped,
} from "modules/analytics/events/features/apiClient";
import { apiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { RunnerFileMissingError } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/components/RunResultView/errors/RunnerFileMissingError/RunnerFileMissingError";
import { DataFileParseError } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/components/RunResultView/errors/DataFileParseError/DataFileParseError";
import { ExecutionContext } from "features/apiClient/helpers/httpRequestExecutor/scriptExecutionContext";
import { ApiClientFeatureContext, selectRecordById } from "features/apiClient/slices";
import { reduxStore } from "store";
import { tabsActions } from "componentsV2/Tabs/slice";
import { getAppMode } from "store/selectors";
import { RunContext } from "../thunks";
import { liveRunResultsActions } from "../../liveRunResults/slice";

import { runHistoryActions } from "../../runHistory/slice";
import { selectLiveRunResultSummary } from "../../liveRunResults/selectors";
import { RunStatus } from "../../common/runResults/types";
import { DELAY_MIN_LIMIT, ITERATIONS_MAX_LIMIT } from "../constants";
import { RunHistorySaveStatus } from "../../runHistory/types";
import { Scope } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { EnvironmentVariableType, EnvironmentVariables, VariableScope } from "backend/environment/types";

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
  private collectionId: string;

  constructor(
    readonly ctx: ApiClientFeatureContext,
    readonly executor: BatchRequestExecutor,
    readonly runContext: RunContext
  ) {
    const { runConfigEntity } = this.runContext;
    const runConfig = runConfigEntity.getEntityFromState(this.ctx.store.getState());
    this.collectionId = runConfig.collectionId;
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
      const message = `The data file used for this collection appears to be damaged or unreadable. Please re-upload a valid file to continue.`;
      const parseError =
        e instanceof Error ? DataFileParseError.fromError(e, message) : new DataFileParseError(message);
      throw parseError.addContext({
        collectionId,
        filePath: dataFile.path,
      });
    }
  }

  private async beforeStart() {
    reduxStore.dispatch(tabsActions.setPreviewTab(undefined));

    const { runConfigEntity } = this.runContext;
    const runConfig = runConfigEntity.getEntityFromState(this.ctx.store.getState());

    this.ctx.store.dispatch(liveRunResultsActions.startRun({ collectionId: this.collectionId }));
    this.ctx.store.dispatch(runHistoryActions.init({ collectionId: this.collectionId }));
    this.ctx.store.dispatch(
      runHistoryActions.setHistoryStatus({ collectionId: this.collectionId, status: RunHistorySaveStatus.IDLE })
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
  }

  private parseDataFileVariables(primitives: Record<string, any>): EnvironmentVariables {
    const result: EnvironmentVariables = {};
    let id = 0;

    for (const key in primitives) {
      const value = primitives[key];
      let type: EnvironmentVariableType = EnvironmentVariableType.String;
      let convertedValue: string | number | boolean = String(value);

      if (typeof value === "number") {
        type = EnvironmentVariableType.Number;
        convertedValue = value;
      } else if (typeof value === "boolean") {
        type = EnvironmentVariableType.Boolean;
        convertedValue = value;
      }

      result[key] = {
        id: id++,
        syncValue: convertedValue,
        localValue: convertedValue,
        type,
        isPersisted: true,
      };
    }

    return result;
  }

  private beforeRequestExecutionStart(iteration: number, request: RQAPI.ApiRecord, startTime: number) {
    this.throwIfRunCancelled();
    const collection = selectRecordById(this.ctx.store.getState(), request.collectionId!);

    const currentExecutingRequest: CurrentlyExecutingRequest = {
      startTime,
      iteration,
      recordId: request.id,
      recordName: request.name,
      collectionName: collection?.name ?? "",
      entry: parseExecutingRequestEntry(request.data),
    };

    this.ctx.store.dispatch(
      liveRunResultsActions.setCurrentlyExecutingRequest({
        collectionId: this.collectionId,
        request: currentExecutingRequest,
      })
    );

    // Create scopes with data file variables for this iteration
    const scopes: Scope[] = [];
    const dataFileVariables = this.variables[iteration - 1]; // iteration is 1-based

    if (dataFileVariables) {
      const parsedVariables = this.parseDataFileVariables(dataFileVariables);
      scopes.push([
        {
          scope: VariableScope.DATA_FILE,
          scopeId: "data_file",
          name: "Data File",
          level: 0,
        },
        parsedVariables,
      ]);
    }

    return { currentExecutingRequest, scopes };
  }

  private afterRequestExecutionComplete(
    currentExecutingRequest: Exclude<CurrentlyExecutingRequest, null>,
    result: RQAPI.ExecutionResult
  ) {
    this.throwIfRunCancelled();

    this.ctx.store.dispatch(
      liveRunResultsActions.setCurrentlyExecutingRequest({
        collectionId: this.collectionId,
        request: null,
      })
    );

    const executionResult = prepareExecutionResult({
      result,
      currentExecutingRequest,
    });

    this.ctx.store.dispatch(
      liveRunResultsActions.addIterationResult({
        collectionId: this.collectionId,
        result: executionResult,
      })
    );
  }

  private async afterComplete() {
    const { collectionId } = this.runContext.runConfigEntity.getEntityFromState(this.ctx.store.getState());

    this.throwIfRunCancelled();

    this.ctx.store.dispatch(
      liveRunResultsActions.finalizeRun({
        collectionId: this.collectionId,
        status: RunStatus.COMPLETED,
        endTime: Date.now(),
      })
    );

    const state = this.ctx.store.getState();
    const summary = selectLiveRunResultSummary(state, this.collectionId);

    try {
      this.ctx.store.dispatch(
        runHistoryActions.setHistoryStatus({
          collectionId: this.collectionId,
          status: RunHistorySaveStatus.SAVING,
        })
      );

      const result = await this.ctx.repositories.apiClientRecordsRepository.addRunResult(collectionId, summary);
      if (result.success === false || !result.data) {
        throw new NativeError("Something went wrong while saving run result!").addContext({
          collectionId,
        });
      }

      this.ctx.store.dispatch(runHistoryActions.addHistoryEntry({ collectionId, entry: summary }));

      this.ctx.store.dispatch(
        runHistoryActions.setHistoryStatus({
          collectionId: this.collectionId,
          status: RunHistorySaveStatus.SUCCESS,
        })
      );

      notification.success({
        message: "Run completed!",
        placement: "bottomRight",
        className: "collection-runner-notification",
        duration: 3,
      });
    } catch (e) {
      this.ctx.store.dispatch(
        runHistoryActions.setHistoryStatus({
          collectionId: this.collectionId,
          status: RunHistorySaveStatus.FAILED,
          error: e instanceof Error ? e.message : null,
        })
      );

      trackCollectionRunSaveHistoryFailed({
        collection_id: collectionId,
      });
    }
  }

  private onError(error: Error) {
    this.ctx.store.dispatch(
      liveRunResultsActions.finalizeRun({
        collectionId: this.collectionId,
        error,
        status: RunStatus.ERRORED,
        endTime: Date.now(),
      })
    );
  }

  private onRunCancelled() {
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
  }

  private cleanup() {
    // Workflow cleanup is handled automatically by registerWorkflow when promise resolves/rejects
    // The workflow is stored in this.activeWorkflow for reference if needed
  }

  private async delay(iterationIndex: number, executingRequestIndex: number): Promise<void> {
    const delay = this.runContext.runConfigEntity.getDelay(this.ctx.store.getState());

    const isFirstIteration = iterationIndex === 0;
    const isFirstExecutingRequestInIteration = executingRequestIndex === 0;

    if (isFirstIteration && isFirstExecutingRequestInIteration) {
      return;
    }

    if (delay <= DELAY_MIN_LIMIT) {
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
        const { currentExecutingRequest, scopes } = this.beforeRequestExecutionStart(iteration, request, startTime);
        const result = await this.executor.executeSingleRequest(
          { entry: request.data as RQAPI.ApiEntry, recordId: request.id },
          {
            iteration: iteration - 1, // We want 0-based index for usage in scripts
            iterationCount,
          },
          { abortController: this.abortController, scopes, executionContext }
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
  runContext: RunContext;
}) {
  const runner = new Runner(params.ctx, params.executor, params.runContext);
  return runner.run();
}
