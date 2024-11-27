import { makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { parseRequestScript, parseResponseScript } from "./scriptParser";

export const executeAPIRequest = async (
  appMode: string,
  request: any, //TODO: to be added with correct type
  environmentManager: any,
  signal?: AbortSignal
): Promise<RQAPI.Response> => {
  // Process request configuration with environment variables
  const processedRequestConfig = environmentManager.renderVariables(request);

  // Execute pre-request script if present
  if (request.preRequestScript) {
    parseRequestScript(request.preRequestScript, processedRequestConfig, environmentManager);
  }

  // Make the actual API request
  const response = await makeRequest(appMode, processedRequestConfig, signal);

  // Execute post-response script if present
  if (request.postResponseScript) {
    parseResponseScript(request.postResponseScript, { response }, environmentManager);
  }

  return response;
};
