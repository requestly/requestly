import { EnvironmentVariables } from "backend/environment/types";
import { AbortReason, KeyValuePair, RQAPI } from "../../types";
import { addUrlSchemeIfMissing, makeRequest, queryParamsToURLString } from "../../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { getHeadersAndQueryParams, getEffectiveAuthForEntry, updateRequestWithAuthOptions } from "../auth";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
  WorkResultType,
} from "../modules/scriptsV2/workloadManager/workLoadTypes";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./snapshotTypes";
import {
  trackScriptExecutionCompleted,
  trackScriptExecutionFailed,
  trackScriptExecutionStarted,
} from "../modules/scriptsV2/analytics";
import { trackAPIRequestSent } from "modules/analytics/events/features/apiClient";
import { isMethodSupported, isOnline, isUrlProtocolValid, isUrlValid } from "./apiClientExecutorHelpers";
import { isEmpty } from "lodash";
import { DEFAULT_SCRIPT_VALUES } from "features/apiClient/constants";
import { UserAbortError } from "features/apiClient/errors/UserAbortError/UserAbortError";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { INVALID_KEY_CHARACTERS } from "features/apiClient/constants";

type InternalFunctions = {
  getEnvironmentVariables(): EnvironmentVariables;
  getCollectionVariables(collectionId: string): EnvironmentVariables;
  getGlobalVariables(): EnvironmentVariables;
  postScriptExecutionCallback(state: any): Promise<void>;
  renderVariables(
    request: RQAPI.Entry,
    collectionId: string
  ): {
    renderedEntryDetails: RQAPI.Entry;
    renderedVariables?: Record<string, unknown>;
  };
};

enum RQErrorHeaderValue {
  DNS_RESOLUTION_ERROR = "ERR_NAME_NOT_RESOLVED",
}

enum RequestErrorMessage {
  DNS_RESOLUTION_ERROR = "Could not connect. Please check if the server is up and the address can be resolved.",
}

export class ApiClientExecutor {
  private abortController: AbortController;
  private entryDetails: RQAPI.Entry;
  private collectionId: RQAPI.Record["collectionId"];
  private recordId: RQAPI.Record["id"];
  private apiRecords: RQAPI.Record[];
  private internalFunctions: InternalFunctions;
  private renderedVariables: Record<string, unknown> = {};
  constructor(private appMode: string, private workloadManager: APIClientWorkloadManager) {}

  prepareRequest() {
    this.entryDetails.testResults = [];
    this.entryDetails.request.url = queryParamsToURLString(
      this.entryDetails.request.queryParams,
      this.entryDetails.request.url
    );
    this.abortController = new AbortController();
    this.entryDetails.request.queryParams = [];
    this.renderedVariables = {};

    const effectiveAuth = getEffectiveAuthForEntry(
      this.entryDetails,
      { id: this.recordId, parentId: this.collectionId },
      this.apiRecords
    );

    this.entryDetails.auth = effectiveAuth;

    const { renderVariables } = this.internalFunctions;
    const { renderedEntryDetails, renderedVariables } = renderVariables(this.entryDetails, this.collectionId);

    this.entryDetails = renderedEntryDetails;

    this.renderedVariables = renderedVariables;

    const { headers, queryParams } = getHeadersAndQueryParams(this.entryDetails.auth);

    this.entryDetails.request.headers = updateRequestWithAuthOptions(this.entryDetails.request.headers, headers);
    this.entryDetails.request.queryParams = updateRequestWithAuthOptions(
      this.entryDetails.request.queryParams,
      queryParams
    );

    return this.entryDetails.request;
  }

  private buildBaseSnapshot(): BaseSnapshot {
    const globalVariables = this.internalFunctions.getGlobalVariables();
    const collectionVariables = this.internalFunctions.getCollectionVariables(this.collectionId);
    const environmentVariables = this.internalFunctions.getEnvironmentVariables();

    return {
      global: globalVariables,
      collection: collectionVariables,
      environment: environmentVariables,
    };
  }

  private buildPreRequestSnapshot(): SnapshotForPreRequest {
    return {
      ...this.buildBaseSnapshot(),
      request: this.entryDetails.request,
    };
  }

  private buildPostResponseSnapshot(): SnapshotForPostResponse {
    const response = this.entryDetails.response;
    if (!response) {
      throw new Error("Can not build post response snapshot without response!");
    }
    return {
      ...this.buildBaseSnapshot(),
      request: this.entryDetails.request,
      response,
    };
  }

  private preValidateRequest() {
    if (!this.entryDetails.request.url) {
      throw new Error("Request URL cannot be empty!");
    }

    if (!isOnline()) {
      throw new Error("Looks like you are offline. Please check your network connection.");
    }

    if (!isMethodSupported(this.entryDetails.request.method)) {
      throw new Error(`Unsupported request method: ${this.entryDetails.request.method}`);
    }

    if (!isUrlValid(this.entryDetails.request.url)) {
      throw new Error(`Invalid URL: ${this.entryDetails.request.url}`);
    }

    if (!isUrlProtocolValid(this.entryDetails.request.url)) {
      throw new Error(`Invalid URL protocol: ${this.entryDetails.request.url}`);
    }
  }

  private getEmptyRenderedVariables(): string[] {
    if (isEmpty(this.renderedVariables)) {
      return [];
    }

    return Object.keys(this.renderedVariables).filter(
      (key) => this.renderedVariables[key] === undefined || this.renderedVariables[key] === ""
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

  updateEntryDetails(entryDetails: {
    entry: RQAPI.Entry;
    collectionId: RQAPI.Record["collectionId"];
    recordId: RQAPI.Record["id"];
  }) {
    this.entryDetails = entryDetails.entry;
    this.collectionId = entryDetails.collectionId;
    this.recordId = entryDetails.recordId;
  }

  updateApiRecords(apiRecords: RQAPI.Record[]) {
    this.apiRecords = apiRecords;
  }

  updateInternalFunctions(internalFunctions: InternalFunctions) {
    this.internalFunctions = internalFunctions;
  }

  async executePreRequestScript(callback: (state: any) => Promise<void>) {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(this.entryDetails.scripts.preRequest, this.buildPreRequestSnapshot(), callback),
      this.abortController.signal
    );
  }

  async executePostResponseScript(callback: (state: any) => Promise<void>) {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        this.entryDetails.scripts.postResponse,
        this.buildPostResponseSnapshot(),
        callback
      ),
      this.abortController.signal
    );
  }

  async execute(): Promise<RQAPI.ExecutionResult> {
    this.prepareRequest();
    this.entryDetails.request.url = addUrlSchemeIfMissing(this.entryDetails.request.url);

    try {
      this.preValidateRequest();
      const invalidHeader = this.entryDetails?.request?.headers?.find((header) => {
        return INVALID_KEY_CHARACTERS.test(header.key);
      });

      if (invalidHeader) {
        throw new Error(`Invalid header key: "${invalidHeader.key}". Header keys must not contain special characters.`);
      }
    } catch (err) {
      const error = this.buildExecutionErrorObject(err, "request", RQAPI.ApiClientErrorType.PRE_VALIDATION);
      return {
        executedEntry: { ...this.entryDetails },
        status: RQAPI.ExecutionStatus.ERROR,
        error,
      };
    }
    let preRequestScriptResult;
    let responseScriptResult;

    if (
      this.entryDetails.scripts.preRequest.length &&
      this.entryDetails.scripts.preRequest !== DEFAULT_SCRIPT_VALUES.preRequest
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.PRE_REQUEST);
      preRequestScriptResult = await this.executePreRequestScript(this.internalFunctions.postScriptExecutionCallback);

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
            ...this.entryDetails,
          },
          status: RQAPI.ExecutionStatus.ERROR,
          error,
        };
      }
    }

    try {
      const response = await makeRequest(this.appMode, this.entryDetails.request, this.abortController.signal);
      //@ts-ignore
      console.log("id is...", response.requestId);
      this.entryDetails.response = response;
      const rqErrorHeader = response?.headers?.find((header) => header.key === "x-rq-error");

      if (rqErrorHeader) {
        return {
          status: RQAPI.ExecutionStatus.ERROR,
          executedEntry: { ...this.entryDetails, response: null },
          error: this.buildErrorObjectFromHeader(rqErrorHeader),
        };
      }
      trackAPIRequestSent({
        has_scripts: Boolean(this.entryDetails.scripts?.preRequest),
        auth_type: this.entryDetails?.auth?.currentAuthType,
      });
    } catch (err) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        executedEntry: { ...this.entryDetails, response: null },
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
      this.entryDetails.scripts.postResponse.length &&
      this.entryDetails.scripts.preRequest !== DEFAULT_SCRIPT_VALUES.postResponse
    ) {
      trackScriptExecutionStarted(RQAPI.ScriptType.POST_RESPONSE);
      responseScriptResult = await this.executePostResponseScript(this.internalFunctions.postScriptExecutionCallback);

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
          executedEntry: this.entryDetails,
          error,
        };
      }
    }

    const executionResult: RQAPI.ExecutionResult = {
      status: RQAPI.ExecutionStatus.SUCCESS,
      executedEntry: {
        ...this.entryDetails,
        testResults: [
          ...(preRequestScriptResult ? preRequestScriptResult.testExecutionResults : []),
          ...(responseScriptResult ? responseScriptResult.testExecutionResults : []),
        ],
      },
    };

    const emptyRenderedVariables = this.getEmptyRenderedVariables();

    if (!isEmpty(emptyRenderedVariables)) {
      executionResult.warning = {
        message: `Following variables used in your request are empty`,
        description: `${emptyRenderedVariables.map((varName) => `"${varName}"`).join(", ")}`,
      };
    }

    return executionResult;
  }

  async rerun(): Promise<RQAPI.RerunResult> {
    const preRequestScriptResult = await this.executePreRequestScript(async () => {});
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

    const responseScriptResult = await this.executePostResponseScript(async () => {});

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
