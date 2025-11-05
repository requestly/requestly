import { AbortReason, KeyValuePair, RequestContentType, RQAPI } from "../../types";
import { HttpRequestPreparationService } from "./httpRequestPreparationService";
import { HttpRequestValidationService } from "./httpRequestValidationService";
import { WorkResultType } from "../modules/scriptsV2/workload-manager/workLoadTypes";
import { UserAbortError } from "../../errors/UserAbortError/UserAbortError";
import { trackRequestFailed } from "modules/analytics/events/features/apiClient";
import { makeRequest } from "../../screens/apiClient/utils";
import { DEFAULT_SCRIPT_VALUES } from "../../constants";
import {
  trackScriptExecutionCompleted,
  trackScriptExecutionFailed,
  trackScriptExecutionStarted,
} from "../modules/scriptsV2/analytics";
import { isEmpty } from "lodash";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { HttpRequestScriptExecutionService } from "./httpRequestScriptExecutionService";
import { Scope } from "../variableResolver/variable-resolver";
import { Ok, Result, Try } from "utils/try";
import { NativeError } from "errors/NativeError";

enum RQErrorHeaderValue {
  DNS_RESOLUTION_ERROR = "ERR_NAME_NOT_RESOLVED",
}

enum RequestErrorMessage {
  DNS_RESOLUTION_ERROR = "Could not connect. Please check if the server is up and the address can be resolved.",
}

type PreparedRequest = {
  preparedEntry: RQAPI.HttpApiEntry;
  renderedVariables: Record<string, any>;
};

function buildExecutionErrorObject(error: any, source: string, type: RQAPI.ApiClientErrorType): RQAPI.ExecutionError {
  const errorObject: RQAPI.ExecutionError = {
    type,
    source,
    name: error.name || "Error",
    message: error.message,
  };

  if (error.context?.reason) {
    errorObject.reason = error.context.reason;
  }

  if (error instanceof UserAbortError) {
    errorObject.reason = AbortReason.USER_CANCELLED;
  }

  return errorObject;
}

function buildErroredExecutionResult(entry: RQAPI.HttpApiEntry, error: RQAPI.ExecutionError): RQAPI.ExecutionResult {
  return {
    status: RQAPI.ExecutionStatus.ERROR,
    executedEntry: { ...entry, response: null },
    error,
  };
}

class ExecutionError extends NativeError {
  result: RQAPI.ExecutionResult;
  constructor(entry: RQAPI.HttpApiEntry, error: Error) {
    super(error.message);

    const executionError = buildExecutionErrorObject(
      error,
      (error as any).context?.source || "request",
      (error as any).context?.type || RQAPI.ApiClientErrorType.PRE_VALIDATION
    );

    this.result = buildErroredExecutionResult(entry, executionError);
  }
}

export class HttpRequestExecutor {
  private abortController: AbortController;
  constructor(
    public requestPreparer: HttpRequestPreparationService,
    private requestValidator: HttpRequestValidationService,
    private scriptExecutor: HttpRequestScriptExecutionService,
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

  private buildErrorObjectFromHeader(header: KeyValuePair): RQAPI.ExecutionError {
    switch (header.value) {
      case RQErrorHeaderValue.DNS_RESOLUTION_ERROR:
        return buildExecutionErrorObject(
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
        return buildExecutionErrorObject(
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

  async validateMultiPartForm(preparedEntry: RQAPI.HttpApiEntry) {
    if (preparedEntry.request.contentType !== RequestContentType.MULTIPART_FORM) {
      return;
    }
    const { invalidFiles } = await this.requestValidator.validateMultipartFormBodyFiles(preparedEntry);
    const isInvalid = invalidFiles.length > 0;

    if (isInvalid) {
      throw new NativeError("Request not sent -- some files are missing").addContext({
        invalidFiles,
        reason:
          invalidFiles.length > 1
            ? "Some files appear to be missing or unavailable on your device. Please upload them again to proceed."
            : "The file seems to have been moved or deleted from your device. Please upload it again to continue.",
        type: RQAPI.ApiClientErrorType.MISSING_FILE,
      });
    }
  }

  async prepareRequestWithValidation(
    recordId: string,
    entry: RQAPI.HttpApiEntry,
    scopes?: Scope[]
  ): Promise<Result<PreparedRequest>> {
    const preparationResult = Try(() => {
      const result = this.requestPreparer.prepareRequest(recordId, entry, scopes);
      result.preparedEntry.response = null; // cannot do this in preparation as it would break other features. Preparation is also used in curl export, rerun etc.
      return result;
    });
    const result = await preparationResult.andThenAsync(async ({ preparedEntry, renderedVariables }) => {
      const generalValidationResult = Try(() => this.requestValidator.validateRequest(preparedEntry));
      const multiPartvalidationResult = await Try(() => this.validateMultiPartForm(preparedEntry));

      multiPartvalidationResult.inspectError(() => {
        trackRequestFailed(RQAPI.ApiClientErrorType.MISSING_FILE);
      });

      return generalValidationResult.and(multiPartvalidationResult).and(
        new Ok({
          preparedEntry,
          renderedVariables,
        })
      );
    });

    return result.mapError((err) => {
      trackRequestFailed(RQAPI.ApiClientErrorType.PRE_VALIDATION);
      return new NativeError(err.message).addContext({ type: RQAPI.ApiClientErrorType.PRE_VALIDATION });
    });
  }

  async execute(
    recordId: string,
    entry: RQAPI.HttpApiEntry,
    abortController?: AbortController,
    scopes?: Scope[]
  ): Promise<RQAPI.ExecutionResult> {
    this.abortController = abortController || new AbortController();

    const preparationResult = (await this.prepareRequestWithValidation(recordId, entry, scopes)).mapError(
      (error) => new ExecutionError(entry, error)
    );

    if (preparationResult.isError()) {
      return preparationResult.unwrapError().result;
    }

    let { preparedEntry, renderedVariables } = preparationResult.unwrap();

    let preRequestScriptResult;
    let responseScriptResult;

    if (
      preparedEntry.scripts?.preRequest.length &&
      preparedEntry.scripts?.preRequest !== DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST]
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.PRE_REQUEST);
      preRequestScriptResult = await this.scriptExecutor.executePreRequestScript(
        recordId,
        preparedEntry,
        this.postScriptExecutionCallback,
        this.abortController
      );

      if (preRequestScriptResult.type === WorkResultType.ERROR) {
        trackScriptExecutionFailed(
          RQAPI.ScriptType.PRE_REQUEST,
          preRequestScriptResult.error.type,
          preRequestScriptResult.error.message
        );
        const error = buildExecutionErrorObject(
          preRequestScriptResult.error,
          "Pre-request script",
          RQAPI.ApiClientErrorType.SCRIPT
        );

        return buildErroredExecutionResult(preparedEntry, error);
      }

      // Re-prepare the request as pre-request script might have modified it.
      const rePreparationResult = (await this.prepareRequestWithValidation(recordId, entry, scopes)).mapError(
        (error) => new ExecutionError(entry, error)
      );

      if (rePreparationResult.isError()) {
        return rePreparationResult.unwrapError().result;
      }

      const rePreparation = rePreparationResult.unwrap();
      preparedEntry = rePreparation.preparedEntry;
      renderedVariables = rePreparation.renderedVariables;
    }

    try {
      const response = await makeRequest(this.appMode, preparedEntry.request, this.abortController.signal);
      preparedEntry.response = response;
      const rqErrorHeader = response?.headers?.find((header) => header.key === "x-rq-error");

      if (rqErrorHeader) {
        return buildErroredExecutionResult(preparedEntry, this.buildErrorObjectFromHeader(rqErrorHeader));
      }
    } catch (err) {
      const error = buildExecutionErrorObject(
        {
          ...err,
          message:
            this.appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
              ? err.message
              : RequestErrorMessage.DNS_RESOLUTION_ERROR,
        },
        "request",
        RQAPI.ApiClientErrorType.CORE
      );

      return buildErroredExecutionResult(preparedEntry, error);
    }

    if (
      preparedEntry.scripts?.postResponse?.length &&
      preparedEntry.scripts?.postResponse !== DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.POST_RESPONSE]
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.POST_RESPONSE);
      responseScriptResult = await this.scriptExecutor.executePostResponseScript(
        recordId,
        preparedEntry,
        this.postScriptExecutionCallback,
        this.abortController
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
        const error = buildExecutionErrorObject(
          responseScriptResult.error,
          "Post-response script",
          RQAPI.ApiClientErrorType.SCRIPT
        );

        return buildErroredExecutionResult(preparedEntry, error);
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
    this.abortController = new AbortController();

    const preRequestScriptResult = await this.scriptExecutor.executePreRequestScript(
      recordId,
      entry,
      async () => {},
      this.abortController
    );
    if (preRequestScriptResult.type === WorkResultType.ERROR) {
      const error = buildExecutionErrorObject(
        preRequestScriptResult.error,
        "Rerun Pre-request script",
        RQAPI.ApiClientErrorType.SCRIPT
      );
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        error,
      };
    }

    const responseScriptResult = await this.scriptExecutor.executePostResponseScript(
      recordId,
      entry,
      async () => {},
      this.abortController
    );

    if (responseScriptResult.type === WorkResultType.ERROR) {
      const error = buildExecutionErrorObject(
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
