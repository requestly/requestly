import { NativeError } from "errors/NativeError";
import { parseEnvironmentState } from "../commands/environments/utils";
import {
  getApiClientEnvironmentsStore,
  getApiClientRecordsStore,
  getApiClientRecordStore,
} from "../commands/store.utils";
import { ApiClientFeatureContext } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { getParsedRuntimeVariables } from "../store/runtimeVariables/utils";
import { AbortReason, KeyValuePair, RequestContentType, RQAPI } from "../types";
import { RequestPreparationService } from "./requestPreparationService";
import { RequestValidationService } from "./requestValidationService";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./httpRequestExecutor/snapshotTypes";
import { APIClientWorkloadManager } from "./modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
  WorkResultType,
} from "./modules/scriptsV2/workload-manager/workLoadTypes";
import { UserAbortError } from "../errors/UserAbortError/UserAbortError";
import { trackRequestFailed } from "modules/analytics/events/features/apiClient";
import { addUrlSchemeIfMissing, makeRequest } from "../screens/apiClient/utils";
import { DEFAULT_SCRIPT_VALUES } from "../constants";
import {
  trackScriptExecutionCompleted,
  trackScriptExecutionFailed,
  trackScriptExecutionStarted,
} from "./modules/scriptsV2/analytics";
import { isEmpty } from "lodash";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

enum RQErrorHeaderValue {
  DNS_RESOLUTION_ERROR = "ERR_NAME_NOT_RESOLVED",
}

enum RequestErrorMessage {
  DNS_RESOLUTION_ERROR = "Could not connect. Please check if the server is up and the address can be resolved.",
}

export class RequestExecutorService {
  constructor(
    private requestPreparer: RequestPreparationService,
    private requestValidator: RequestValidationService,
    private ctx: ApiClientFeatureContext,
    private workloadManager: APIClientWorkloadManager,
    private abortController: AbortController,
    private postScriptExecutionCallback: (state: any) => Promise<void>,
    private appMode: string
  ) {}

  private buildBaseSnapshot(entry: RQAPI.HttpApiEntry, recordId: string): BaseSnapshot {
    const { activeEnvironment, globalEnvironment } = getApiClientEnvironmentsStore(this.ctx).getState();
    const globalEnvironmentState = globalEnvironment.getState();
    const globalVariables = parseEnvironmentState(globalEnvironmentState).variables;
    const environmentVariables = activeEnvironment ? parseEnvironmentState(activeEnvironment.getState()).variables : {};
    const variables = getParsedRuntimeVariables();
    const collectionVariables = (() => {
      const parent = getApiClientRecordsStore(this.ctx).getState().getParent(recordId);
      if (!parent) {
        return {};
      }
      const recordState = getApiClientRecordStore(this.ctx, parent)?.getState();
      if (!recordState || recordState.type !== RQAPI.RecordType.COLLECTION) {
        throw new NativeError("Expected value to be present and be a collection!").addContext({
          recordId: parent,
        });
      }

      return Object.fromEntries(recordState.collectionVariables.getState().getAll());
    })();
    return {
      global: globalVariables,
      collectionVariables,
      environment: environmentVariables,
      variables,
    };
  }

  private buildPreRequestSnapshot(entry: RQAPI.HttpApiEntry, recordId: string): SnapshotForPreRequest {
    return {
      ...this.buildBaseSnapshot(entry, recordId),
      request: entry.request,
    };
  }

  private buildPostResponseSnapshot(entry: RQAPI.HttpApiEntry, recordId: string): SnapshotForPostResponse {
    const response = entry.response;
    if (!response) {
      throw new Error("Can not build post response snapshot without response!");
    }
    return {
      ...this.buildBaseSnapshot(entry, recordId),
      request: entry.request,
      response,
    };
  }

  async executePreRequestScript(entry: RQAPI.HttpApiEntry, recordId: string, callback: (state: any) => Promise<void>) {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(entry.scripts.preRequest, this.buildPreRequestSnapshot(entry, recordId), callback),
      this.abortController.signal
    );
  }

  async executePostResponseScript(
    entry: RQAPI.HttpApiEntry,
    recordId: string,
    callback: (state: any) => Promise<void>
  ) {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        entry.scripts.postResponse,
        this.buildPostResponseSnapshot(entry, recordId),
        callback
      ),
      this.abortController.signal
    );
  }

  private getEmptyRenderedVariables(renderedVariables: Record<string, any>): string[] {
    if (isEmpty(renderedVariables)) {
      return [];
    }

    return Object.keys(renderedVariables).filter(
      (key) => renderedVariables[key] === undefined || renderedVariables[key] === ""
    );
  }

  private buildExecutionErrorObject(error: any, source: string, type: RQAPI.ApiClientErrorType): RQAPI.ExecutionError {
    const errorObject: RQAPI.ExecutionError = {
      type,
      source,
      name: error.name || "Error",
      message: error.message,
    };
    if (error instanceof UserAbortError) {
      errorObject.reason = AbortReason.USER_CANCELLED;
    }

    return errorObject;
  }

  private buildErrorObjectFromHeader(header: KeyValuePair): RQAPI.ExecutionError {
    switch (header.value) {
      case RQErrorHeaderValue.DNS_RESOLUTION_ERROR:
        return this.buildExecutionErrorObject(
          {
            name: "Error",
            message: RequestErrorMessage.DNS_RESOLUTION_ERROR,
            type: RQAPI.ApiClientErrorType.CORE,
            source: "request",
          },
          "request",
          RQAPI.ApiClientErrorType.CORE
        );
      default:
        return this.buildExecutionErrorObject(
          {
            name: "Error",
            message: "Failed to fetch",
            type: RQAPI.ApiClientErrorType.CORE,
            source: "request",
          },
          "request",
          RQAPI.ApiClientErrorType.CORE
        );
    }
  }

  async _execute(record: RQAPI.HttpApiRecord): Promise<RQAPI.ExecutionResult> {
    const unpreparedEntryDetails = record.data;
    if (unpreparedEntryDetails.request.contentType === RequestContentType.MULTIPART_FORM) {
      const { invalidFiles } = await this.requestValidator.validateMultipartFormBodyFiles(unpreparedEntryDetails);
      const isInvalid = invalidFiles.length > 0;
      if (isInvalid) {
        trackRequestFailed(RQAPI.ApiClientErrorType.MISSING_FILE);

        return {
          executedEntry: { ...unpreparedEntryDetails },
          status: RQAPI.ExecutionStatus.ERROR,
          error: {
            name: "Error",
            message: "Request not sent -- some files are missing",
            reason:
              invalidFiles.length > 1
                ? "Some files appear to be missing or unavailable on your device. Please upload them again to proceed."
                : "The file seems to have been moved or deleted from your device. Please upload it again to continue.",
            type: RQAPI.ApiClientErrorType.MISSING_FILE,
            source: "request",
          },
        };
      }
    }

    const { entryDetails, renderedVariables } = this.requestPreparer.prepareRequest(unpreparedEntryDetails, record.id);
    entryDetails.request.url = addUrlSchemeIfMissing(entryDetails.request.url);

    try {
      this.requestValidator.validateRequest(entryDetails);
    } catch (err) {
      const error = this.buildExecutionErrorObject(err, "request", RQAPI.ApiClientErrorType.PRE_VALIDATION);
      return {
        executedEntry: { ...entryDetails },
        status: RQAPI.ExecutionStatus.ERROR,
        error,
      };
    }
    let preRequestScriptResult;
    let responseScriptResult;

    if (
      entryDetails.scripts.preRequest.length &&
      entryDetails.scripts.preRequest !== DEFAULT_SCRIPT_VALUES.preRequest
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.PRE_REQUEST);
      preRequestScriptResult = await this.executePreRequestScript(
        entryDetails,
        record.id,
        this.postScriptExecutionCallback
      ); //revist record passing

      if (preRequestScriptResult.type === WorkResultType.ERROR) {
        trackScriptExecutionFailed(
          RQAPI.ScriptType.PRE_REQUEST,
          preRequestScriptResult.error.type,
          preRequestScriptResult.error.message
        );
        const error = this.buildExecutionErrorObject(
          preRequestScriptResult.error,
          "Pre-request script",
          RQAPI.ApiClientErrorType.SCRIPT
        );

        return {
          executedEntry: {
            ...entryDetails,
          },
          status: RQAPI.ExecutionStatus.ERROR,
          error,
        };
      }
    }

    try {
      const response = await makeRequest(this.appMode, entryDetails.request, this.abortController.signal);
      entryDetails.response = response;
      const rqErrorHeader = response?.headers?.find((header) => header.key === "x-rq-error");

      if (rqErrorHeader) {
        return {
          status: RQAPI.ExecutionStatus.ERROR,
          executedEntry: { ...entryDetails, response: null },
          error: this.buildErrorObjectFromHeader(rqErrorHeader),
        };
      }
    } catch (err) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        executedEntry: { ...entryDetails, response: null },
        error: this.buildExecutionErrorObject(
          {
            ...err,
            message:
              this.appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
                ? err.message
                : RequestErrorMessage.DNS_RESOLUTION_ERROR,
          },
          "request",
          RQAPI.ApiClientErrorType.CORE
        ),
      };
    }

    if (
      entryDetails.scripts.postResponse.length &&
      entryDetails.scripts.preRequest !== DEFAULT_SCRIPT_VALUES.postResponse
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.POST_RESPONSE);
      responseScriptResult = await this.executePostResponseScript(
        entryDetails,
        record.id,
        this.postScriptExecutionCallback
      );

      if (responseScriptResult.type === WorkResultType.SUCCESS) {
        trackScriptExecutionCompleted(RQAPI.ScriptType.POST_RESPONSE);
      }

      if (responseScriptResult.type === WorkResultType.ERROR) {
        trackScriptExecutionFailed(
          RQAPI.ScriptType.POST_RESPONSE,
          responseScriptResult.error.type,
          responseScriptResult.error.message
        );
        const error = this.buildExecutionErrorObject(
          responseScriptResult.error,
          "Post-response script",
          RQAPI.ApiClientErrorType.SCRIPT
        );

        return {
          status: RQAPI.ExecutionStatus.ERROR,
          executedEntry: entryDetails,
          error,
        };
      }
    }

    const executionResult: RQAPI.ExecutionResult = {
      status: RQAPI.ExecutionStatus.SUCCESS,
      executedEntry: {
        ...entryDetails,
        testResults: [
          ...(preRequestScriptResult ? preRequestScriptResult.testExecutionResults : []),
          ...(responseScriptResult ? responseScriptResult.testExecutionResults : []),
        ],
      },
    };

    const emptyRenderedVariables = this.getEmptyRenderedVariables(renderedVariables);

    if (!isEmpty(emptyRenderedVariables)) {
      executionResult.warning = {
        message: `Following variables used in your request are empty`,
        description: `${emptyRenderedVariables.map((varName) => `"${varName}"`).join(", ")}`,
      };
    }

    return executionResult;
  }

  async rerun(record: RQAPI.HttpApiRecord): Promise<RQAPI.RerunResult> {
    const preRequestScriptResult = await this.executePreRequestScript(record.data, record.id, async () => {});
    if (preRequestScriptResult.type === WorkResultType.ERROR) {
      const error = this.buildExecutionErrorObject(
        preRequestScriptResult.error,
        "Rerun Pre-request script",
        RQAPI.ApiClientErrorType.SCRIPT
      );
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        error,
      };
    }

    const responseScriptResult = await this.executePostResponseScript(record.data, record.id, async () => {});

    if (responseScriptResult.type === WorkResultType.ERROR) {
      const error = this.buildExecutionErrorObject(
        responseScriptResult.error,
        "Rerun Post-response script",
        RQAPI.ApiClientErrorType.SCRIPT
      );
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        error,
      };
    }

    return {
      status: RQAPI.ExecutionStatus.SUCCESS,
      artifacts: {
        testResults: [
          ...(preRequestScriptResult.testExecutionResults || []),
          ...(responseScriptResult.testExecutionResults || []),
        ],
      },
    };
  }

  abort() {
    this.abortController.abort(AbortReason.USER_CANCELLED);
  }
}
