import { EnvironmentVariables } from "backend/environment/types";
import { addUrlSchemeIfMissing, makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { APIClientWorkloadManager } from "./modules/scriptsV2/workload-manager/APIClientWorkloadManager";
import { processAuthForEntry, updateRequestWithAuthOptions } from "./auth";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
  WorkResultType,
} from "./modules/scriptsV2/workload-manager/workLoadTypes";
import { notification } from "antd";

type EntryDetails = RQAPI.Entry & { id: RQAPI.Record["id"]; collectionId: RQAPI.Record["collectionId"] };
type InternalFunctions = {
  getEnvironmentVariables(): EnvironmentVariables;
  getCollectionVariables(collectionId: string): EnvironmentVariables;
  getGlobalVariables(): EnvironmentVariables;
  onStateUpdate(key: string, value: any): void;
  // getVariablesWithPrecedence(collectionId: string): EnvironmentVariables;
  renderVariables(
    request: RQAPI.Request,
    collectionId: string
  ): {
    renderedTemplate: RQAPI.Request;
  };
};

export class RequestExecutor {
  private workloadManager: APIClientWorkloadManager;
  constructor(
    private appMode: string,
    private entryDetails: EntryDetails,
    private apiRecords: RQAPI.Record[],
    private internalFunctions: InternalFunctions
  ) {
    this.workloadManager = new APIClientWorkloadManager();
  }

  private prepareRequest() {
    console.log("DBG", this.entryDetails, this.apiRecords);
    this.entryDetails.request.queryParams = [];
    const { headers, queryParams } = processAuthForEntry(this.entryDetails, this.entryDetails, this.apiRecords);
    this.entryDetails.request.headers = updateRequestWithAuthOptions(this.entryDetails.request.headers, headers);
    this.entryDetails.request.queryParams = updateRequestWithAuthOptions(
      this.entryDetails.request.queryParams,
      queryParams
    );

    const { renderVariables } = this.internalFunctions;

    // Process request configuration with environment variables
    const renderedRequestDetails = renderVariables(this.entryDetails.request, this.entryDetails.collectionId);
    let renderedRequest = renderedRequestDetails.renderedTemplate;
    this.entryDetails.request = renderedRequest;
    return renderedRequest;
  }

  private buildInitialSnapshot() {
    const globalVariables = this.internalFunctions.getGlobalVariables();
    const collectionVariables = this.internalFunctions.getCollectionVariables(this.entryDetails.collectionId);
    const environmentVariables = this.internalFunctions.getEnvironmentVariables();

    return {
      global: globalVariables,
      collection: collectionVariables,
      environment: environmentVariables,
      request: this.entryDetails.request,
      response: this.entryDetails.response ?? null,
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
    const initialSnapshot = this.buildInitialSnapshot();

    return this.workloadManager.execute(
      new PreRequestScriptWorkload(
        this.entryDetails.scripts.preRequest,
        { ...initialSnapshot, request: this.entryDetails.request },
        (key: string, value: any) => {
          this.internalFunctions.onStateUpdate(key, value);
        }
      )
    );
  }

  async executePostResponseScript() {
    const initialSnapshot = this.buildInitialSnapshot();

    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        this.entryDetails.scripts.postResponse,
        { ...initialSnapshot, request: this.entryDetails.request, response: this.entryDetails.response },
        (key: string, value: any) => {
          this.internalFunctions.onStateUpdate(key, value);
        }
      )
    );
  }

  async execute() {
    this.prepareRequest();

    const preRequestScriptResult = await this.executePreRequestScript();

    if (preRequestScriptResult.type === WorkResultType.ERROR) {
      return {
        ...this.entryDetails,
        error: {
          source: "Pre-Request Script",
          name: preRequestScriptResult.error.name,
          message: preRequestScriptResult.error.message,
        },
      };
    }

    this.entryDetails.request.url = addUrlSchemeIfMissing(this.entryDetails.request.url);

    const response = await makeRequest(this.appMode, this.entryDetails.request);
    this.entryDetails.response = response;

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
}
