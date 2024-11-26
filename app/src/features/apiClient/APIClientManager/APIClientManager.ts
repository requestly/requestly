import { makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { parseRequestScript, parseResponseScript } from "./scriptParser";

export class APIClientManager {
  private environmentManager: any;
  private preRequestScript: string = "";
  private postResponseScript: string = "";

  constructor(environmentManager: any) {
    this.environmentManager = environmentManager;
  }

  setPreRequestScript(script: string) {
    this.preRequestScript = script;
  }

  setPostResponseScript(script: string) {
    this.postResponseScript = script;
  }

  async executeRequest(appMode: string, request: RQAPI.Request, signal?: AbortSignal): Promise<RQAPI.Response> {
    // Process request configuration with environment variables
    const processedRequestConfig = this.environmentManager.renderVariables(request);

    // Execute pre-request script
    if (this.preRequestScript) {
      parseRequestScript(this.preRequestScript, processedRequestConfig, this.environmentManager);
    }

    // Make the actual API request
    const response = await makeRequest(appMode, processedRequestConfig, signal);

    // Execute post-response script
    if (this.postResponseScript) {
      parseResponseScript(this.postResponseScript, { response: response }, this.environmentManager);
    }

    return response;
  }
}
