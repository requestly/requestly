import { makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { executePrerequestScript, executePostresponseScript } from "./APIClientUtils";

export const executeAPIRequest = async (
  appMode: string,
  entry: RQAPI.Entry,
  environmentManager: any,
  signal?: AbortSignal
): Promise<RQAPI.Entry | null> => {
  try {
    // Process request configuration with environment variables
    const renderedRequest = environmentManager.renderVariables(entry.request);

    if (entry.scripts.preRequest) {
      await executePrerequestScript(entry.scripts.preRequest, renderedRequest, environmentManager);
    }

    // Make the actual API request
    const response = await makeRequest(appMode, renderedRequest, signal);

    if (entry.scripts.postResponse) {
      await executePostresponseScript(entry.scripts.postResponse, { response }, environmentManager);
    }

    return {
      ...entry,
      response,
      request: renderedRequest,
    };
  } catch (error) {
    return null;
  }
};
