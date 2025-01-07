import { notification } from "antd";
import * as Sentry from "@sentry/react";
import { addUrlSchemeIfMissing, makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { executePrerequestScript, executePostresponseScript } from "./modules/scripts/utils";
import { renderTemplate } from "backend/environment/utils";
import { DEMO_API_URL } from "features/apiClient/constants";
import { trackAPIRequestSent } from "modules/analytics/events/features/apiClient";
import { EnvironmentVariables } from "backend/environment/types";
import { processAuthForEntry, updateRequestWithAuthOptions } from "../auth";

export const executeAPIRequest = async (
  appMode: string,
  apiRecords: Map<RQAPI.Record["id"], RQAPI.Record>,
  entry: RQAPI.Entry,
  entryDetails: {
    id: RQAPI.Record["id"];
    collectionId: RQAPI.Record["collectionId"];
  },
  environmentManager: any,
  collectionVariables: EnvironmentVariables,
  signal?: AbortSignal
): Promise<RQAPI.Entry | RQAPI.RequestErrorEntry> => {
  const updatedEntry = JSON.parse(JSON.stringify(entry)); //Deep Copy

  /* Clearing the query params key value to avoid duplication of query params in request 
  as the query param table changes are synced with request URL
  */
  updatedEntry.request.queryParams = [];

  const { headers, queryParams } = processAuthForEntry(updatedEntry, entryDetails, apiRecords);
  updatedEntry.request.headers = updateRequestWithAuthOptions(updatedEntry.request.headers, headers);
  updatedEntry.request.queryParams = updateRequestWithAuthOptions(updatedEntry.request.queryParams, queryParams);

  // Process request configuration with environment variables
  const renderedRequestDetails = environmentManager.renderVariables(updatedEntry.request, entryDetails.collectionId);
  let currentEnvironmentVariables = renderedRequestDetails.variables;
  let renderedRequest = renderedRequestDetails.renderedTemplate;
  let response: RQAPI.Response | null = null;
  let globalEnvironmentVariables = environmentManager.getGlobalVariables();
  let currentCollectionVariables = collectionVariables;

  try {
    if (updatedEntry.scripts.preRequest) {
      const {
        updatedEnvironmentVariables,
        updatedGlobalVariables,
        updatedCollectionVariables,
      } = await executePrerequestScript(
        updatedEntry.scripts.preRequest,
        renderedRequest,
        environmentManager,
        currentEnvironmentVariables,
        globalEnvironmentVariables,
        currentCollectionVariables,
        entryDetails.collectionId
      );

      currentEnvironmentVariables = updatedEnvironmentVariables;
      globalEnvironmentVariables = updatedGlobalVariables;
      currentCollectionVariables = updatedCollectionVariables;
      // TODO@nafees87n: Fix this while refactoring, rendering should always get fresh variables
      // Temporarily passing current variables
      renderedRequest = renderTemplate(updatedEntry.request, currentEnvironmentVariables);
    }
  } catch (error) {
    return {
      request: updatedEntry.request,
      response: null,
      error: {
        source: "Pre-request script",
        message: error.message,
        name: error.name,
      },
    };
  }

  try {
    // Prefix https:// if not present
    renderedRequest.url = addUrlSchemeIfMissing(renderedRequest.url);
    response = await makeRequest(appMode, renderedRequest, signal);
    trackAPIRequestSent({
      method: renderedRequest.method,
      queryParamsCount: renderedRequest.queryParams.length,
      headersCount: renderedRequest.headers.length,
      requestContentType: renderedRequest.contentType,
      isDemoURL: renderedRequest.url === DEMO_API_URL,
      path: window.location.pathname,
    });
  } catch (error) {
    return {
      request: updatedEntry.request,
      response: null,
      error: {
        source: "Request error",
        message: error.message,
        name: error.name,
      },
    };
  }

  if (updatedEntry.scripts.postResponse) {
    try {
      await executePostresponseScript(
        updatedEntry.scripts.postResponse,
        { response, request: renderedRequest },
        environmentManager,
        currentEnvironmentVariables,
        globalEnvironmentVariables,
        currentCollectionVariables,
        entryDetails.collectionId
      );
    } catch (error) {
      console.error("Post Response script error", error);
      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_scripts_error");
        scope.setContext("request_details", {
          url: renderedRequest.url,
          method: renderedRequest.method,
          headers: renderedRequest.headers,
          queryParams: renderedRequest.queryParams,
        });
        scope.setContext("error_details", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        scope.setFingerprint(["api_request_error", renderedRequest.method, error.message]);
        Sentry.captureException(new Error(`API Request Failed: ${error.message}`));
      });
      notification.error({
        message: "Something went wrong in post-response script!",
        description: `${error.name}: ${error.message}`,
        placement: "bottomRight",
      });
    }
  }
  return {
    ...updatedEntry,
    response,
    request: renderedRequest,
  };
};
