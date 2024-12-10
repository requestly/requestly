import { notification } from "antd";
import * as Sentry from "@sentry/react";
import { RQAPI } from "../../types";
import { executePrerequestScript, executePostresponseScript } from "./modules/scripts/utils";
import { renderTemplate } from "backend/environment/utils";
import { DEMO_API_URL } from "features/apiClient/constants";
import { trackAPIRequestSent } from "modules/analytics/events/features/apiClient";
import { getAPIResponse as getAPIResponseViaExtension } from "actions/ExtensionActions";
import { getAPIResponse as getAPIResponseViaProxy } from "actions/DesktopActions";
import { CONSTANTS } from "@requestly/requestly-core";
import { VariableKeyValuePairs } from "backend/environment/types";

export interface APIRequestConfig {
  entry: RQAPI.Entry;
  appMode: string;
  currentEnvironmentId: string;
  setVariables?: (variables: VariableKeyValuePairs) => Promise<void>;
  signal?: AbortSignal;
  collectionId?: string;
}

interface RequestExecutionResult {
  success: boolean;
  data?: RQAPI.Entry;
  error?: {
    source: string;
    message: string;
    name: string;
  };
}

export class APIClientManager {
  private config: APIRequestConfig;
  private currentVariables: VariableKeyValuePairs;
  private renderedRequest: RQAPI.Request;
  private response: RQAPI.Response;

  constructor(config: APIRequestConfig) {
    this.config = config;
    this.prepareRequest();
  }

  private prepareRequest() {
    this.renderedRequest = renderTemplate(this.config.entry.request, this.currentVariables);
  }

  private async executePreRequestScript(): Promise<void> {
    if (!this.config.entry.scripts.preRequest) return;

    await executePrerequestScript(
      this.config.entry.scripts.preRequest,
      this.renderedRequest,
      this.currentVariables,
      this.config.currentEnvironmentId,
      this.config.setVariables
    );
    this.renderedRequest = renderTemplate(this.config.entry.request, this.currentVariables);
  }

  private async execute(): Promise<RQAPI.Response> {
    this.renderedRequest.url = addUrlSchemeIfMissing(this.renderedRequest.url);
    const response = await makeRequest(this.config.appMode, this.renderedRequest, this.config.signal);

    this.trackRequest();
    return response;
  }

  private async executePostResponseScript(response: RQAPI.Response): Promise<void> {
    if (!this.config.entry.scripts.postResponse) return;

    await executePostresponseScript(
      this.config.entry.scripts.postResponse,
      { response, request: this.renderedRequest },
      this.currentVariables,
      this.config.currentEnvironmentId,
      this.config.setVariables
    );
  }

  private trackRequest() {
    trackAPIRequestSent({
      method: this.renderedRequest.method,
      queryParamsCount: this.renderedRequest.queryParams.length,
      headersCount: this.renderedRequest.headers.length,
      requestContentType: this.renderedRequest.contentType,
      isDemoURL: this.renderedRequest.url === DEMO_API_URL,
      path: window.location.pathname,
    });
  }

  async executeRequest(): Promise<RequestExecutionResult> {
    // Execute pre-request script
    try {
      await this.executePreRequestScript();
    } catch (error) {
      return {
        success: false,
        data: {
          ...this.config.entry,
          request: this.renderedRequest,
          response: null,
        },
        error: {
          source: "Pre-request script",
          message: error.message,
          name: error.name,
        },
      };
    }

    // Make request
    try {
      this.response = await this.execute();
    } catch (error) {
      return {
        success: false,
        data: {
          ...this.config.entry,
          request: this.renderedRequest,
          response: null,
        },
        error: {
          source: "Request error",
          message: error.message,
          name: error.name,
        },
      };
    }

    // Execute post-response script
    try {
      await this.executePostResponseScript(this.response);
    } catch (error) {
      // Log error but don't fail the request
      console.error("Post Response script error", error);
      notification.error({
        message: "Something went wrong in post-response script!",
        description: `${error.name}: ${error.message}`,
        placement: "bottomRight",
      });
      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_scripts_error");
        scope.setContext("request_details", {
          url: this.renderedRequest.url,
          method: this.renderedRequest.method,
          headers: this.renderedRequest.headers,
          queryParams: this.renderedRequest.queryParams,
        });
        scope.setContext("error_details", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        scope.setFingerprint(["api_request_error", this.renderedRequest.method, error.message]);
        Sentry.captureException(new Error(`API Request Failed: ${error.message}`));
      });
    }

    return {
      success: true,
      data: {
        ...this.config.entry,
        response: this.response,
        request: this.renderedRequest,
      },
    };
  }

  setCurrentVariables(variables: VariableKeyValuePairs) {
    this.currentVariables = variables;
  }
}

export const makeRequest = async (
  appMode: string,
  request: RQAPI.Request,
  signal?: AbortSignal
): Promise<RQAPI.Response> => {
  return new Promise((resolve, reject) => {
    if (signal) {
      if (signal.aborted) {
        reject();
      }

      const abortListener = () => {
        signal.removeEventListener("abort", abortListener);
        reject();
      };
      signal.addEventListener("abort", abortListener);
    }

    if (appMode === CONSTANTS.APP_MODES.EXTENSION) {
      getAPIResponseViaExtension(request).then(resolve);
    } else if (appMode === CONSTANTS.APP_MODES.DESKTOP) {
      getAPIResponseViaProxy(request).then(resolve);
    } else {
      resolve(null);
    }
  });
};

export const addUrlSchemeIfMissing = (url: string): string => {
  if (url && !/^([a-z][a-z0-9+\-.]*):\/\//.test(url)) {
    return "http://" + url;
  }

  return url;
};
