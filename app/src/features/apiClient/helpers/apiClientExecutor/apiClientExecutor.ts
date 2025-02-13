import { EnvironmentVariables } from "backend/environment/types";
import { addUrlSchemeIfMissing, makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { processAuthForEntry, updateRequestWithAuthOptions } from "../auth";
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
import { isMethodSupported, isOnline, isUrlProtocolValid, isUrlValid } from "./apiClientExecutorHelpers";

type InternalFunctions = {
  getEnvironmentVariables(): EnvironmentVariables;
  getCollectionVariables(collectionId: string): EnvironmentVariables;
  getGlobalVariables(): EnvironmentVariables;
  postScriptExecutionCallback(state: any): Promise<void>;
  renderVariables(request: RQAPI.Request, collectionId: string): RQAPI.Request;
};

export class ApiClientExecutor {
  private abortController: AbortController;
  private entryDetails: RQAPI.Entry;
  private collectionId: RQAPI.Record["collectionId"];
  private recordId: RQAPI.Record["id"];
  private apiRecords: RQAPI.Record[];
  private internalFunctions: InternalFunctions;
  constructor(private appMode: string, private workloadManager: APIClientWorkloadManager) {}

  prepareRequest() {
    this.entryDetails.response = null;
    this.entryDetails.testResults = [];
    this.abortController = new AbortController();
    this.entryDetails.request.queryParams = [];

    const { headers, queryParams } = processAuthForEntry(
      this.entryDetails,
      { id: this.recordId, collectionId: this.collectionId },
      this.apiRecords
    );
    this.entryDetails.request.headers = updateRequestWithAuthOptions(this.entryDetails.request.headers, headers);
    this.entryDetails.request.queryParams = updateRequestWithAuthOptions(
      this.entryDetails.request.queryParams,
      queryParams
    );

    const { renderVariables } = this.internalFunctions;

    // Process request configuration with environment variables
    const renderedRequest = renderVariables(this.entryDetails.request, this.collectionId);
    this.entryDetails.request = renderedRequest;
    return renderedRequest;
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
          source: "request",
          name: error.name,
          message: error.message,
        },
      };
    }

    trackScriptExecutionStarted(RQAPI.ScriptType.PRE_REQUEST);
    const preRequestScriptResult = await this.executePreRequestScript(
      this.internalFunctions.postScriptExecutionCallback
    );

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
          source: "Pre-request script",
          name: preRequestScriptResult.error.name,
          message: preRequestScriptResult.error.message,
        },
      };
    }

    try {
      const response = await makeRequest(this.appMode, this.entryDetails.request, this.abortController.signal);
      this.entryDetails.response = response;

      // This should be returned normally, encapsulated by WorkResult
      if (!response) {
        throw Error("Failed to send the request. Please check if the URL is valid.");
      }
    } catch (e) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        executedEntry: { ...this.entryDetails },
        error: {
          source: "request",
          name: e.name,
          message: e.message,
        },
      };
    }

    trackScriptExecutionStarted(RQAPI.ScriptType.POST_RESPONSE);
    const responseScriptResult = await this.executePostResponseScript(
      this.internalFunctions.postScriptExecutionCallback
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

      return {
        status: RQAPI.ExecutionStatus.ERROR,
        executedEntry: this.entryDetails,
        error: {
          source: "Post-response script",
          name: responseScriptResult.error.name,
          message: responseScriptResult.error.message,
        },
      };
    }

    return {
      status: RQAPI.ExecutionStatus.SUCCESS,
      executedEntry: {
        ...this.entryDetails,
        testResults: [
          ...(preRequestScriptResult.testExecutionResults || []),
          ...(responseScriptResult.testExecutionResults || []),
        ],
      },
    };
  }

  async rerun(): Promise<RQAPI.RerunResult> {
    const preRequestScriptResult = await this.executePreRequestScript(async () => {});
    if (preRequestScriptResult.type === WorkResultType.ERROR) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        error: {
          source: "Rerun Pre-request script",
          ...preRequestScriptResult.error,
        },
      };
    }

    const responseScriptResult = await this.executePostResponseScript(async () => {});

    if (responseScriptResult.type === WorkResultType.ERROR) {
      return {
        status: RQAPI.ExecutionStatus.ERROR,
        error: {
          source: "Rerun Pre-request script",
          ...responseScriptResult.error,
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
