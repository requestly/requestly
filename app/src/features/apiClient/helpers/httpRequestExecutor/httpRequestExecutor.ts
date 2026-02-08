import { AbortReason, KeyValuePair, RequestContentType, RQAPI } from "../../types";
import { HttpRequestPreparationService } from "./httpRequestPreparationService";
import { HttpRequestValidationService } from "./httpRequestValidationService";
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
import { WorkResult, WorkResultType } from "../modules/scriptsV2/workloadManager/workLoadTypes";
import { BaseExecutionContext, ExecutionContext, ScriptExecutionContext } from "./scriptExecutionContext";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { BaseExecutionMetadata, IterationContext } from "../modules/scriptsV2/worker/script-internals/types";
import { ApiClientFeatureContext, selectRecordById } from "features/apiClient/slices";

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
    private readonly ctx: ApiClientFeatureContext,
    public requestPreparer: HttpRequestPreparationService,
    private requestValidator: HttpRequestValidationService,
    private readonly workloadManager: APIClientWorkloadManager,
    private postScriptExecutionCallback: (state: BaseExecutionContext) => Promise<void>,
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
    scopes?: Scope[],
    executionContext?: ExecutionContext
  ): Promise<Result<PreparedRequest>> {
    const preparationResult = Try(() => {
      const result = this.requestPreparer.prepareRequest(recordId, entry, scopes, executionContext);
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
    entryDetails: {
      entry: RQAPI.HttpApiEntry;
      recordId: string;
    },
    iterationContext: IterationContext,
    executionConfig?: {
      abortController?: AbortController;
      scopes?: Scope[];
      executionContext?: ExecutionContext;
    }
  ): Promise<RQAPI.ExecutionResult> {
    const { entry, recordId } = entryDetails;
    const { abortController, scopes, executionContext } = executionConfig ?? {};

    this.abortController = abortController || new AbortController();
    const preparationResult = (
      await this.prepareRequestWithValidation(recordId, entry, scopes, executionContext)
    ).mapError((error) => new ExecutionError(entry, error));

    if (preparationResult.isError()) {
      return preparationResult.unwrapError().result;
    }

    let { preparedEntry, renderedVariables } = preparationResult.unwrap();

    const recordName = selectRecordById(this.ctx.store.getState(), recordId)?.name ?? "";
    const scriptExecutionContext = new ScriptExecutionContext(
      this.ctx,
      recordId,
      preparedEntry,
      scopes,
      executionContext
    );
    const executionMetadata: BaseExecutionMetadata = {
      requestId: recordId,
      requestName: recordName,
      iterationContext,
    };

    const scriptExecutor = new HttpRequestScriptExecutionService(
      scriptExecutionContext,
      executionMetadata,
      this.workloadManager
    );

    let preRequestScriptResult: WorkResult | undefined;
    let responseScriptResult: WorkResult | undefined;

    if (
      preparedEntry.scripts?.preRequest.length &&
      preparedEntry.scripts?.preRequest !== DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST]
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.PRE_REQUEST);
      preRequestScriptResult = await scriptExecutor.executePreRequestScript(preparedEntry, this.abortController, () => {
        const isSnapshotMutated = scriptExecutionContext.getIsMutated();
        if (isSnapshotMutated) {
          this.postScriptExecutionCallback(scriptExecutionContext.getContext());
        }
      });

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
      const rePreparationResult = (
        await this.prepareRequestWithValidation(
          recordId,
          entry,
          scopes,
          scriptExecutionContext.getContext() // Pass execution context to use runtime-modified variables
        )
      ).mapError((error) => new ExecutionError(entry, error));

      if (rePreparationResult.isError()) {
        return rePreparationResult.unwrapError().result;
      }

      const rePreparation = rePreparationResult.unwrap();
      preparedEntry = rePreparation.preparedEntry;
      renderedVariables = rePreparation.renderedVariables;
      scriptExecutionContext.setRequest(preparedEntry.request);
    }

    try {
      const response = await makeRequest(this.appMode, preparedEntry.request, this.abortController.signal);
      preparedEntry.response = response;
      scriptExecutionContext.setResponse(response);
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

      scriptExecutionContext.resetIsMutated();

      responseScriptResult = await scriptExecutor.executePostResponseScript(preparedEntry, this.abortController, () => {
        const isSnapshotMutated = scriptExecutionContext.getIsMutated();
        if (isSnapshotMutated) {
          this.postScriptExecutionCallback(scriptExecutionContext.getContext());
        }
      });

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
          ...(preRequestScriptResult && preRequestScriptResult.type === WorkResultType.SUCCESS
            ? preRequestScriptResult.testExecutionResults
            : []),
          ...(responseScriptResult && responseScriptResult.type === WorkResultType.SUCCESS
            ? responseScriptResult.testExecutionResults
            : []),
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
    const executionContext = new ScriptExecutionContext(this.ctx, recordId, entry);
    const recordName = selectRecordById(this.ctx.store.getState(), recordId)?.name ?? "";
    const executionMetadata: BaseExecutionMetadata = {
      requestId: recordId,
      requestName: recordName,
      iterationContext: { iteration: 0, iterationCount: 1 },
    };
    const scriptExecutor = new HttpRequestScriptExecutionService(
      executionContext,
      executionMetadata,
      this.workloadManager
    );

    const preRequestScriptResult = await scriptExecutor.executePreRequestScript(entry, this.abortController, () => {});
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

    const responseScriptResult = await scriptExecutor.executePostResponseScript(entry, this.abortController, () => {});

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
