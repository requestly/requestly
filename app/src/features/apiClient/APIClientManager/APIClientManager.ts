import { makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { parseResponseScript } from "./ResponseScriptParser";

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
    // Execute pre-request script
    // if (this.preRequestScript) {
    //   Add code here
    // }

    // Process request configuration with environment variables
    const processedRequestConfig = this.environmentManager.renderVariables(request);

    // Make the actual API request
    const response = await makeRequest(appMode, processedRequestConfig, signal);

    // Execute post-response script
    if (this.postResponseScript) {
      const postResponseError = await parseResponseScript(
        this.postResponseScript,
        { response: response },
        this.environmentManager
      );
      if (postResponseError) {
        throw new Error(`Post-response script error: ${postResponseError.error}`);
      }
    }

    return response;
  }
}
