import { EnvironmentVariables } from "backend/environment/types";
import { makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { APIClientWorkloadManager } from "./modules/scripts/APIClientWorkloadManager";
import { processAuthForEntry, updateRequestWithAuthOptions } from "./auth";

export class RequestExecutor {
  constructor(
    private appMode: string,
    private snapshot: {
      environmentVariables: EnvironmentVariables;
      collectionVariables: EnvironmentVariables;
      globalVariables: EnvironmentVariables;
    },
    private entryDetails: RQAPI.Entry & { id: RQAPI.Record["id"]; collectionId: RQAPI.Record["collectionId"] },
    private apiRecords: RQAPI.Record[]
  ) {}

  private prepareRequest() {
    this.entryDetails.request.queryParams = [];
    const { headers, queryParams } = processAuthForEntry(this.entryDetails, this.entryDetails, this.apiRecords);
    this.entryDetails.request.headers = updateRequestWithAuthOptions(this.entryDetails.request.headers, headers);
    this.entryDetails.request.queryParams = updateRequestWithAuthOptions(
      this.entryDetails.request.queryParams,
      queryParams
    );

    // Process request configuration with environment variables
    const variablesWithPrecedence = getVariablesWithPrecedence(requestCollectionId);
    const renderedRequestDetails = environmentManager.renderVariables(updatedEntry.request, entryDetails.collectionId);
    let renderedRequest = renderedRequestDetails.renderedTemplate;
    let response: RQAPI.Response | null = null;
  }

  updateSnapshot(
    environmentVariables: EnvironmentVariables,
    collectionVariables: EnvironmentVariables,
    globalVariables: EnvironmentVariables
  ) {
    this.snapshot = {
      environmentVariables,
      collectionVariables,
      globalVariables,
    };
  }

  async execute(entry: RQAPI.Entry) {
    this.prepareRequest();

    const workloadManager = new APIClientWorkloadManager();

    try {
      workloadManager.execute(getPreRequestScriptWorkload(entry));

      const response = await makeRequest(this.appMode, entry.request);

      // console.log("!!!debug", "make response", response);

      workloadManager.execute(
        getPostResponseScriptWorkload({
          ...entry,
          response: response,
        })
      );
    } catch (e) {
      console.log("!!!debug", "err", e);
    }
  }
}
