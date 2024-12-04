import { notification } from "antd";
import { makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { executePrerequestScript, executePostresponseScript } from "./modules/scripts/utils";

export const executeAPIRequest = async (
  appMode: string,
  entry: RQAPI.Entry,
  environmentManager: any,
  signal?: AbortSignal
): Promise<RQAPI.Entry | RQAPI.RequestErrorEntry> => {
  // Process request configuration with environment variables
  const renderedRequest = environmentManager.renderVariables(entry.request);
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
    }
  } catch (error) {
    return {
      request: entry.request,
      response: null,
      error: {
        source: "Prerequest script",
        message: error.message,
        name: error.name,
      },
    };
  }

  try {
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
      notification.error({
        message: "Something went wrong in postResponse script!",
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
