import { makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { executePrerequestScript, executePostresponseScript } from "./APIClientUtils";

export const executeAPIRequest = async (
  appMode: string,
  request: any, //TODO: to be added with correct type
  environmentManager: any,
  signal?: AbortSignal
): Promise<RQAPI.Response> => {
  // Process request configuration with environment variables
  const processedRequestConfig = environmentManager.renderVariables(request);

  if (request.preRequestScript) {
    executePrerequestScript(request.preRequestScript, processedRequestConfig, environmentManager);
  }

  // Make the actual API request
  const response = await makeRequest(appMode, processedRequestConfig, signal);

  if (request.postResponseScript) {
    executePostresponseScript(request.postResponseScript, { response }, environmentManager);
  }

  return response;
};
