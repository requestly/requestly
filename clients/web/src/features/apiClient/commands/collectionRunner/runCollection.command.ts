import { RQAPI } from "features/apiClient/types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";
import { RunContext } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/run.context";
import {
  CurrentlyExecutingRequest,
  HistorySaveStatus,
  RequestExecutionResult,
  RunResult,
  RunStatus,
} from "features/apiClient/store/collectionRunResult/runResult.store";
import {
  isHTTPApiEntry,
  parseCollectionRunnerDataFile,
  parseHttpRequestEntry,
} from "features/apiClient/screens/apiClient/utils";
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
import { Scope } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { VariableScope } from "backend/environment/types";
import { apiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { RunnerFileMissingError } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/components/RunResultView/errors/RunnerFileMissingError/RunnerFileMissingError";
import { DataFileParseError } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/components/RunResultView/errors/DataFileParseError/DataFileParseError";
import { ITERATIONS_MAX_LIMIT } from "features/apiClient/store/collectionRunConfig/runConfig.store";
import { renderVariables } from "backend/environment/utils";
import { createDummyVariablesStoreFromPrimitives } from "features/apiClient/store/variables/variables.store";
import { ExecutionContext } from "features/apiClient/helpers/httpRequestExecutor/scriptExecutionContext";

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
  constructor(
    readonly ctx: ApiClientFeatureContext,
    readonly runContext: RunContext,
    readonly executor: BatchRequestExecutor,
    readonly genericState: GenericState,
    readonly appMode: "DESKTOP" | "EXTENSION"
  ) {}

  private get abortController() {
    return this.runContext.runResultStore.getState().abortController;
  }

  private throwIfRunCancelled() {
    if (this.abortController.signal.aborted) {
      throw new RunCancelled("Run has been cancelled by the user.");
    }
  }

  private getRequest(requestIndex: number): RQAPI.ApiRecord | undefined {
    const { runOrder } = this.runContext.runConfigStore.getState();

    if (!runOrder[requestIndex].isSelected) {
      return;
    }
    const request = this.ctx.stores.records.getState().getData(runOrder[requestIndex].id);

    if (request?.type !== RQAPI.RecordType.API) {
      return;
    }

    return request;
  }

  private async parseDataFile() {
    const dataFile = this.runContext.runConfigStore.getState().getConfig().dataFile;
    if (!dataFile) {
      return;
    }

    const apiClientFilesStore = apiClientFileStore.getState();

    const collectionId = this.runContext.collectionId;
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
    this.genericState.setPreview(false);
    this.runContext.runResultStore.getState().reset();
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.RUNNING);
    this.runContext.runResultStore.getState().setHistorySaveStatus(HistorySaveStatus.IDLE);
    this.runContext.runResultStore.getState().setStartTime(Date.now());
    this.runContext.runResultStore.getState().setEndtime(null);
    this.variables = [];

    const runConfig = this.runContext.runConfigStore.getState().getConfig();
    const collectionId = this.runContext.collectionId;

    if (this.appMode === "DESKTOP") {
      const variables = await this.parseDataFile();
      this.variables = variables ?? [];
    }

    trackCollectionRunStarted({
      collection_id: collectionId,
      iteration_count: runConfig.iterations,
      delay: runConfig.delay,
      request_count: runConfig.runOrder.filter((r) => r.isSelected).length,
    });

    const selectedRequestsCount = this.runContext.runConfigStore.getState().runOrder.filter((r) => r.isSelected).length;
    if (selectedRequestsCount === 0) {
      throw new NativeError("No requests were selected to run!");
    }

    const configId = this.runContext.runConfigStore.getState().getConfig().id;
    this.genericState.addCloseBlocker(CloseTopic.COLLECTION_RUNNING, configId, {
      title: "Collection run is in progress, still want to close?",
      onConfirm: () => {
        cancelRun(this.ctx, { runContext: this.runContext });
      },
    });
  }

  private populateAutogenerateStore(recordId: string, scopes: Scope[]) {
    const { getData, getParentChain } = this.ctx.stores.records.getState();
    const apiRecord = getData(recordId);

    if (!apiRecord || !apiRecord.data) {
      return;
    }

    const childDetails = {
      id: apiRecord.id,
      parentId: apiRecord.collectionId,
    };

    const resolver = <T extends Record<string, any>>(template: T) => {
      return renderVariables(template, apiRecord.id, this.ctx, scopes).result;
    };

    const newNamespaces = parseHttpRequestEntry(apiRecord.data as RQAPI.HttpApiEntry, childDetails, {
      getParentChain,
      getData,
      resolver,
    });

    this.runContext.autogenerateStore.getState().initialize(newNamespaces);
  }

  private beforeRequestExecutionStart(iteration: number, request: RQAPI.ApiRecord, startTime: number) {
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

    const scopes: Scope[] = [];
    if (iteration <= this.variables.length) {
      scopes.push([
        {
          scope: VariableScope.DATA_FILE,
          scopeId: "data_file",
          name: "Data File",
          level: 0,
        },
        createDummyVariablesStoreFromPrimitives(this.variables[iteration - 1]),
      ]);
    }

    this.populateAutogenerateStore(request.id, scopes);

    return {
      currentExecutingRequest,
      scopes,
    };
  }

  private afterRequestExecutionComplete(
    currentExecutingRequest: Exclude<CurrentlyExecutingRequest, null>,
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

  private async afterComplete() {
    const collectionId = this.runContext.collectionId;

    this.throwIfRunCancelled();
    this.runContext.runResultStore.getState().setRunStatus(RunStatus.COMPLETED);
    this.runContext.runResultStore.getState().setEndtime(Date.now());

    const runResult = this.runContext.runResultStore.getState().getRunSummary() as RunResult;
    this.runContext.runResultStore.getState().addToHistory(runResult);

    try {
      this.runContext.runResultStore.getState().setHistorySaveStatus(HistorySaveStatus.SAVING);
      await saveRunResult(this.ctx, {
        collectionId,
        runResult: runResult,
      });

      this.runContext.runResultStore.getState().setHistorySaveStatus(HistorySaveStatus.SUCCESS);
      notification.success({
        message: "Run completed!",
        placement: "bottomRight",
        className: "collection-runner-notification",
        duration: 3,
      });
    } catch (e) {
      this.runContext.runResultStore.getState().setHistorySaveStatus(HistorySaveStatus.FAILED);

      trackCollectionRunSaveHistoryFailed({
        collection_id: collectionId,
      });
    }
  }

  private onError(error: Error) {
    this.runContext.runResultStore.getState().setError(error);
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

    const runConfig = this.runContext.runConfigStore.getState().getConfig();
    const collectionId = this.runContext.collectionId;

    trackCollectionRunStopped({
      collection_id: collectionId,
      iteration_count: runConfig.iterations,
      delay: runConfig.delay,
      request_count: runConfig.runOrder.filter((r) => r.isSelected).length,
    });
  }

  private cleanup() {
    const configId = this.runContext.runConfigStore.getState().getConfig().id;
    this.genericState.removeCloseBlocker(CloseTopic.COLLECTION_RUNNING, configId);
  }

  private async delay(iterationIndex: number, executingRequestIndex: number): Promise<void> {
    const { runContext } = this;
    const { runConfigStore } = runContext;
    const { getConfig } = runConfigStore.getState();
    const { delay } = getConfig();

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
    const { runContext } = this;
    const { runConfigStore } = runContext;
    const { getConfig, runOrder } = runConfigStore.getState();

    const { iterations } = getConfig();
    const requestsCount = runOrder.length;

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
      const iterationCount = this.runContext.runConfigStore.getState().getConfig().iterations;
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

export async function runCollection(
  ctx: ApiClientFeatureContext,
  params: {
    runContext: RunContext;
    executor: BatchRequestExecutor;
    genericState: GenericState;
    appMode: "DESKTOP" | "EXTENSION";
  }
) {
  const runner = new Runner(ctx, params.runContext, params.executor, params.genericState, params.appMode);
  return runner.run();
}
