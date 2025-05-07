import { EnvironmentVariables } from "backend/environment/types";
import { addUrlSchemeIfMissing, makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { processHeaderAndQueryParams, processAuth, updateRequestWithAuthOptions } from "../auth";
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
    this.entryDetails.response = null;
    this.entryDetails.testResults = [];
    this.abortController = new AbortController();
    this.entryDetails.request.queryParams = [];
    this.renderedVariables = {};

    const processedAuth = processAuth(
      this.entryDetails,
      { id: this.recordId, parentId: this.collectionId },
      this.apiRecords
    );
    this.entryDetails.auth = processedAuth;

    const { renderVariables } = this.internalFunctions;
    const { renderedEntryDetails, renderedVariables } = renderVariables(this.entryDetails, this.collectionId);

    this.entryDetails = renderedEntryDetails;
    this.renderedVariables = renderedVariables;

    const { headers, queryParams } = processHeaderAndQueryParams(this.entryDetails.auth);

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
    } catch (error) {
      return {
        executedEntry: { ...this.entryDetails },
        status: RQAPI.ExecutionStatus.ERROR,
        error: {
          type: RQAPI.ApiClientErrorType.PRE_VALIDATION,
          source: "request",
          name: error.name,
          message: error.message,
        },
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

        return {
          executedEntry: {
            ...this.entryDetails,
          },
          status: RQAPI.ExecutionStatus.ERROR,
          error: {
            type: RQAPI.ApiClientErrorType.SCRIPT,
            source: "Pre-request script",
            name: preRequestScriptResult.error.name,
            message: preRequestScriptResult.error.message,
          },
        };
      }
    }

    try {
      const response = await makeRequest(this.appMode, this.entryDetails.request, this.abortController.signal);
      this.entryDetails.response = response;
      trackAPIRequestSent({
        has_scripts: Boolean(this.entryDetails.scripts?.preRequest),
        auth_type: this.entryDetails?.auth?.currentAuthType,
      });
    } catch (e) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        executedEntry: { ...this.entryDetails },
        error: {
          type: RQAPI.ApiClientErrorType.CORE,
          source: "request",
          name: e.name,
          message: e.message,
        },
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

        return {
          status: RQAPI.ExecutionStatus.ERROR,
          executedEntry: this.entryDetails,
          error: {
            type: RQAPI.ApiClientErrorType.SCRIPT,
            source: "Post-response script",
            name: responseScriptResult.error.name,
            message: responseScriptResult.error.message,
          },
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
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        error: {
          ...preRequestScriptResult.error,
          source: "Rerun Pre-request script",
          type: RQAPI.ApiClientErrorType.SCRIPT,
        },
      };
    }

    const responseScriptResult = await this.executePostResponseScript(async () => {});

    if (responseScriptResult.type === WorkResultType.ERROR) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        error: {
          ...responseScriptResult.error,
          source: "Rerun Pre-request script",
          type: RQAPI.ApiClientErrorType.SCRIPT,
        },
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
    this.abortController.abort();
  }
}
