import { notification } from "antd";
import * as Sentry from "@sentry/react";
import { addUrlSchemeIfMissing, makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { executePrerequestScript, executePostresponseScript } from "./modules/scripts/utils";
import { renderTemplate } from "backend/environment/utils";
import { DEMO_API_URL } from "features/apiClient/constants";
import { trackAPIRequestSent } from "modules/analytics/events/features/apiClient";
import { isEmpty } from "lodash";
import { processAuthOptions, updateRequestWithAuthOptions } from "../auth";

// import { AUTHORIZATION_TYPES } from "../../screens/apiClient/components/clientView/components/request/components/AuthorizationView/types";
export const executeAPIRequest = async (
  appMode: string,
  apiRecords: RQAPI.Record[],
  entry: RQAPI.Entry,
  environmentManager: any,
  signal?: AbortSignal,
  requestCollectionId?: string
): Promise<RQAPI.Entry | RQAPI.RequestErrorEntry> => {
  // // get updated entry based on auth details
  // const updatedEntry = updateAuthOptions(
  //   apiRecords,
  //   requestCollectionId,
  //   entry,
  //   entry.auth?.currentAuthType ?? AUTHORIZATION_TYPES.NO_AUTH
  // ) as RQAPI.Entry;

  // Process request configuration with environment variables

  const updatedEntry = JSON.parse(JSON.stringify(entry)); //Deep Copy

  if (!isEmpty(updatedEntry.auth)) {
    const { headers, queryParams } = processAuthOptions(updatedEntry.auth);
    updatedEntry.request.headers = updateRequestWithAuthOptions(updatedEntry.request.headers, headers);
    updatedEntry.request.queryParams = updateRequestWithAuthOptions(updatedEntry.request.queryParams, queryParams);
  }

  const renderedRequestDetails = environmentManager.renderVariables(updatedEntry.request, requestCollectionId);
  let currentEnvironmentVariables = renderedRequestDetails.variables;
  let renderedRequest = renderedRequestDetails.renderedTemplate;
  let response: RQAPI.Response | null = null;

  try {
    if (updatedEntry.scripts.preRequest) {
      const { updatedVariables } = await executePrerequestScript(
        updatedEntry.scripts.preRequest,
        renderedRequest,
        environmentManager,
        currentEnvironmentVariables
      );

      currentEnvironmentVariables = updatedVariables;
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
        currentEnvironmentVariables
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
