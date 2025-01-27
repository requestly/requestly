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
import { notification } from "antd";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./snapshotTypes";
import { TestResult } from "../modules/scriptsV2/worker/script-internals/types";
import {
  trackScriptExecutionCompleted,
  trackScriptExecutionFailed,
  trackScriptExecutionStarted,
} from "../modules/scriptsV2/analytics";

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

  private prepareRequest() {
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

  async executePreRequestScript(callback: (state: any) => Promise<void> = () => Promise.resolve()) {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(this.entryDetails.scripts.preRequest, this.buildPreRequestSnapshot(), callback),
      this.abortController.signal
    );
  }

  async executePostResponseScript(callback: (state: any) => Promise<void> = () => Promise.resolve()) {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        this.entryDetails.scripts.postResponse,
        this.buildPostResponseSnapshot(),
        callback
      ),
      this.abortController.signal
    );
  }

  async execute() {
    this.prepareRequest();
    const preRequestScriptResult = await this.executePreRequestScript(
      this.internalFunctions.postScriptExecutionCallback
    );

    if (preRequestScriptResult.type === WorkResultType.ERROR) {
      return {
        ...this.entryDetails,
        error: {
          source: "Pre-request script",
          name: preRequestScriptResult.error.name,
          message: preRequestScriptResult.error.message,
        },
      };
    }

    this.entryDetails.request.url = addUrlSchemeIfMissing(this.entryDetails.request.url);

    try {
      const response = await makeRequest(this.appMode, this.entryDetails.request, this.abortController.signal);
      this.entryDetails.response = response;
      if (!response) {
        return this.entryDetails;
      }
    } catch (e) {
      return {
        ...this.entryDetails,
        error: {
          source: "request",
          name: e.name,
          message: e.message,
        },
      };
    }

    const responseScriptResult = await this.executePostResponseScript(
      this.internalFunctions.postScriptExecutionCallback
    );

    if (responseScriptResult.type === WorkResultType.ERROR) {
      trackScriptExecutionStarted(RQAPI.ScriptType.POST_RESPONSE);
    }

    if (responseScriptResult.type === WorkResultType.SUCCESS) {
      trackScriptExecutionCompleted(RQAPI.ScriptType.POST_RESPONSE);
    }

    if (responseScriptResult.type === WorkResultType.ERROR) {
      trackScriptExecutionFailed(
        RQAPI.ScriptType.POST_RESPONSE,
        responseScriptResult.error.type,
        responseScriptResult.error.message
      );
      notification.error({
        message: "Something went wrong in post-response script!",
        description: `${responseScriptResult.error.name}: ${responseScriptResult.error.message}`,
        placement: "bottomRight",
      });

      return {
        executedEntry: this.entryDetails,
      };
    }

    return {
      executedEntry: this.entryDetails,
      testResults: [
        ...(preRequestScriptResult.testExecutionResults || []),
        ...(responseScriptResult.testExecutionResults || []),
      ],
    };
  }

  async rerun() {
    const preRequestScriptResult = await this.executePreRequestScript();
    if (preRequestScriptResult.type === WorkResultType.ERROR) {
      return {
        testResults: [] as TestResult[],
        error: preRequestScriptResult.error,
      };
    }

    const responseScriptResult = await this.executePostResponseScript();

    if (responseScriptResult.type === WorkResultType.ERROR) {
      return {
        testResults: [],
        error: responseScriptResult.error,
      };
    }

    return {
      testResults: [
        ...(preRequestScriptResult.testExecutionResults || []),
        ...(responseScriptResult.testExecutionResults || []),
      ],
    };
  }

  abort() {
    this.abortController.abort();
  }
}
