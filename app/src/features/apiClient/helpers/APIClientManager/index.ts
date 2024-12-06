import { notification } from "antd";
import * as Sentry from "@sentry/react";
import { addUrlSchemeIfMissing, makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { executePrerequestScript, executePostresponseScript } from "./modules/scripts/utils";
import { renderTemplate } from "backend/environment/utils";

export const executeAPIRequest = async (
  appMode: string,
  entry: RQAPI.Entry,
  environmentManager: any,
  signal?: AbortSignal
): Promise<RQAPI.Entry | RQAPI.RequestErrorEntry> => {
  // Process request configuration with environment variables
  let renderedRequest = environmentManager.renderVariables(entry.request);
  let currentEnvironmentVariables = environmentManager.getCurrentEnvironmentVariables();
  let response: RQAPI.Response | null = null;

  try {
    if (entry.scripts.preRequest) {
      const { updatedVariables } = await executePrerequestScript(
        entry.scripts.preRequest,
        renderedRequest,
        environmentManager
      );

      currentEnvironmentVariables = updatedVariables;
      // TODO@nafees87n: Fix this while refactoring, rendering should always get fresh variables
      // Temporarily passing current variables
      renderedRequest = renderTemplate(entry.request, currentEnvironmentVariables);
    }
  } catch (error) {
    return {
      request: entry.request,
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
  } catch (error) {
    return {
      request: entry.request,
      response: null,
      error: {
        source: "Request error",
        message: error.message,
        name: error.name,
      },
    };
  }

  if (entry.scripts.postResponse) {
    try {
      await executePostresponseScript(
        entry.scripts.postResponse,
        { response, request: renderedRequest },
        environmentManager,
        currentEnvironmentVariables
      );
    } catch (error) {
      console.error("Post Response script error", error);
      Sentry.captureException(error);
      notification.error({
        message: "Something went wrong in post-response script!",
        description: `${error.name}: ${error.message}`,
        placement: "bottomRight",
      });
    }
  }

  return {
    ...entry,
    response,
    request: renderedRequest,
  };
};
