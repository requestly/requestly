import { AbortReason, KeyValuePair, RequestContentType, RQAPI } from "../types";
import { RequestPreparationService } from "./requestPreparationService";
import { RequestValidationService } from "./requestValidationService";
import { WorkResultType } from "./modules/scriptsV2/workload-manager/workLoadTypes";
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
import { ScriptExecutionService } from "./scriptExecutionService";

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
    private scriptExecutor: ScriptExecutionService,
    private abortController: AbortController,
    private postScriptExecutionCallback: (state: any) => Promise<void>,
    private appMode: string
  ) {}

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

  async executeRequest(recordId: string, entry: RQAPI.HttpApiEntry): Promise<RQAPI.ExecutionResult> {
    const { preparedEntry, renderedVariables } = this.requestPreparer.prepareRequest(recordId, entry);
    preparedEntry.request.url = addUrlSchemeIfMissing(preparedEntry.request.url);

    if (preparedEntry.request.contentType === RequestContentType.MULTIPART_FORM) {
      const { invalidFiles } = await this.requestValidator.validateMultipartFormBodyFiles(preparedEntry);
      const isInvalid = invalidFiles.length > 0;
      if (isInvalid) {
        trackRequestFailed(RQAPI.ApiClientErrorType.MISSING_FILE);

        return {
          executedEntry: { ...preparedEntry },
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

    try {
      this.requestValidator.validateRequest(preparedEntry);
    } catch (err) {
      const error = this.buildExecutionErrorObject(err, "request", RQAPI.ApiClientErrorType.PRE_VALIDATION);
      return {
        executedEntry: { ...preparedEntry },
        status: RQAPI.ExecutionStatus.ERROR,
        error,
      };
    }
    let preRequestScriptResult;
    let responseScriptResult;

    if (
      preparedEntry.scripts.preRequest.length &&
      preparedEntry.scripts.preRequest !== DEFAULT_SCRIPT_VALUES.preRequest
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.PRE_REQUEST);
      preRequestScriptResult = await this.scriptExecutor.executePreRequestScript(
        recordId,
        preparedEntry,
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
            ...preparedEntry,
          },
          status: RQAPI.ExecutionStatus.ERROR,
          error,
        };
      }
    }

    try {
      const response = await makeRequest(this.appMode, preparedEntry.request, this.abortController.signal);
      preparedEntry.response = response;
      const rqErrorHeader = response?.headers?.find((header) => header.key === "x-rq-error");

      if (rqErrorHeader) {
        return {
          status: RQAPI.ExecutionStatus.ERROR,
          executedEntry: { ...preparedEntry, response: null },
          error: this.buildErrorObjectFromHeader(rqErrorHeader),
        };
      }
    } catch (err) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        executedEntry: { ...preparedEntry, response: null },
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
      preparedEntry.scripts.postResponse.length &&
      preparedEntry.scripts.preRequest !== DEFAULT_SCRIPT_VALUES.postResponse
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.POST_RESPONSE);
      responseScriptResult = await this.scriptExecutor.executePostResponseScript(
        recordId,
        preparedEntry,
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
          executedEntry: preparedEntry,
          error,
        };
      }
    }

    const executionResult: RQAPI.ExecutionResult = {
      status: RQAPI.ExecutionStatus.SUCCESS,
      executedEntry: {
        ...preparedEntry,
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

  async rerun(recordId: string, entry: RQAPI.HttpApiEntry): Promise<RQAPI.RerunResult> {
    const preRequestScriptResult = await this.scriptExecutor.executePreRequestScript(recordId, entry, async () => {});
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

    const responseScriptResult = await this.scriptExecutor.executePostResponseScript(recordId, entry, async () => {});

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
