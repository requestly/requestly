import { EnvironmentVariables } from "backend/environment/types";
import { addUrlSchemeIfMissing, makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workload-manager/APIClientWorkloadManager";
import { processAuthForEntry, updateRequestWithAuthOptions } from "../auth";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
  WorkResultType,
} from "../modules/scriptsV2/workload-manager/workLoadTypes";
import { notification } from "antd";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./snapshot";

type EntryDetails = RQAPI.Entry & { id: RQAPI.Record["id"]; collectionId: RQAPI.Record["collectionId"] };
type InternalFunctions = {
  getEnvironmentVariables(): EnvironmentVariables;
  getCollectionVariables(collectionId: string): EnvironmentVariables;
  getGlobalVariables(): EnvironmentVariables;
  postScriptExecutionCallback(state: any): Promise<void>;
  renderVariables(request: RQAPI.Request, collectionId: string): RQAPI.Request;
};

export class RequestExecutor {
  private abortController: AbortController;
  private entryDetails: EntryDetails;
  private apiRecords: RQAPI.Record[];
  private internalFunctions: InternalFunctions;
  constructor(private appMode: string, private workloadManager: APIClientWorkloadManager) {}

  private prepareRequest() {
    this.abortController = new AbortController();
    this.entryDetails.request.queryParams = [];

    const { headers, queryParams } = processAuthForEntry(this.entryDetails, this.entryDetails, this.apiRecords);
    this.entryDetails.request.headers = updateRequestWithAuthOptions(this.entryDetails.request.headers, headers);
    this.entryDetails.request.queryParams = updateRequestWithAuthOptions(
      this.entryDetails.request.queryParams,
      queryParams
    );

    const { renderVariables } = this.internalFunctions;

    // Process request configuration with environment variables
    const renderedRequest = renderVariables(this.entryDetails.request, this.entryDetails.collectionId);
    this.entryDetails.request = renderedRequest;
  }

  private buildBaseSnapshot(): BaseSnapshot {
    const globalVariables = this.internalFunctions.getGlobalVariables();
    const collectionVariables = this.internalFunctions.getCollectionVariables(this.entryDetails.collectionId);
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

  updateEntryDetails(entryDetails: EntryDetails) {
    this.entryDetails = entryDetails;
  }

  updateApiRecords(apiRecords: RQAPI.Record[]) {
    this.apiRecords = apiRecords;
  }

  updateInternalFunctions(internalFunctions: InternalFunctions) {
    this.internalFunctions = internalFunctions;
  }

  async executePreRequestScript() {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(
        this.entryDetails.scripts.preRequest,
        this.buildPreRequestSnapshot(),
        this.internalFunctions.postScriptExecutionCallback
      ),
      this.abortController.signal
    );
  }

  async executePostResponseScript() {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        this.entryDetails.scripts.postResponse,
        this.buildPostResponseSnapshot(),
        this.internalFunctions.postScriptExecutionCallback
      ),
      this.abortController.signal
    );
  }

  async execute() {
    this.prepareRequest();

    const preRequestScriptResult = await this.executePreRequestScript();

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

    const responseScriptResult = await this.executePostResponseScript();

    if (responseScriptResult.type === WorkResultType.ERROR) {
      notification.error({
        message: "Something went wrong in post-response script!",
        description: `${responseScriptResult.error.name}: ${responseScriptResult.error.message}`,
        placement: "bottomRight",
      });
    }

    return this.entryDetails;
  }

  abort() {
    this.abortController.abort();
  }
}
