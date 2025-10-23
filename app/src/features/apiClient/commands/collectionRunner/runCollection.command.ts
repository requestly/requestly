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
  getFileExtension,
  isHTTPApiEntry,
  parseCsvText,
  parseJsonText,
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
import { createDummyVariablesStore } from "features/apiClient/store/variables/variables.store";
import { getFileContents } from "components/mode-specific/desktop/DesktopFilePicker/desktopFileAccessActions";
import { apiClientFileStore } from "features/apiClient/store/apiClientFilesStore";
import { SchemaObject } from "ajv";

export const CollectionRunnerAjvSchema: SchemaObject = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: {
      type: ["string", "number", "boolean", "null"],
    },
  },
};

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
    status: result.warning ? { value: result.status, warning: result.warning } : { value: result.status },
    testResults: result.executedEntry.testResults,
  };
}

class RunCancelled extends NativeError {}
class DataFileNotFound extends NativeError {}
class DataFileParseError extends NativeError {}

class Runner {
  private variables: Record<string, any>[] = [];
  constructor(
    readonly ctx: ApiClientFeatureContext,
    readonly runContext: RunContext,
    readonly executor: BatchRequestExecutor,
    readonly genericState: GenericState
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

  private async parseDataFile() {
    const dataFile = this.runContext.runConfigStore.getState().getConfig().dataFile;
    if (!dataFile) {
      return;
    }

    const apiClientFilesStore = apiClientFileStore.getState();

    const collectionId = this.runContext.collectionId;
    if (!(await apiClientFilesStore.isFilePresentLocally(dataFile.id))) {
      throw new DataFileNotFound("Data file not found!").addContext({ collectionId });
    }

    let fileExtension: string | undefined = undefined;
    try {
      fileExtension = getFileExtension(dataFile.path)?.toLocaleLowerCase();
      const fileContents = await getFileContents(dataFile.path);

      switch (fileExtension) {
        case ".csv": {
          const parsedData = await parseCsvText(fileContents);
          return parsedData.data;
        }
        case ".json": {
          const parsedData = await parseJsonText(fileContents, CollectionRunnerAjvSchema);
          return parsedData.data;
        }
        default: {
          throw new DataFileParseError("Unsupported data file format!").addContext({ collectionId, fileExtension });
        }
      }
    } catch (e) {
      throw new DataFileParseError("Failed to read or parse data file!").addContext({
        collectionId,
        error: e,
        fileExtension,
        dataFilePath: dataFile.path,
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
    const variables = await this.parseDataFile();
    this.variables = variables ?? [];

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
        createDummyVariablesStore(this.variables[iteration - 1]),
      ]);
    }

    return {
      currentExecutingRequest,
      scopes,
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

      for await (const { request, iteration, startTime } of this.iterate()) {
        const { currentExecutingRequest, scopes } = this.beforeRequestExecutionStart(iteration, request, startTime);
        const result = await this.executor.executeSingleRequest(
          request.id,
          request.data,
          this.runContext.runResultStore.getState().abortController,
          scopes
        );
        console.log("!!!debug", "result", result);

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
  }
) {
  const runner = new Runner(ctx, params.runContext, params.executor, params.genericState);
  return runner.run();
}
