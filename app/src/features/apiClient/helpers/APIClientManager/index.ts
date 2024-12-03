import { makeRequest } from "../../screens/apiClient/utils";
import { RQAPI } from "../../types";
import { executePrerequestScript, executePostresponseScript } from "./modules/scripts/utils";

export const executeAPIRequest = async (
  appMode: string,
  entry: RQAPI.Entry,
  environmentManager: any,
  signal?: AbortSignal
): Promise<RQAPI.Entry | null> => {
  try {
    // Process request configuration with environment variables
    const renderedRequest = environmentManager.renderVariables(entry.request);
    let currentEnvironmentVariables = environmentManager.getCurrentEnvironmentVariables();

    if (entry.scripts.preRequest) {
      const { updatedVariables } = await executePrerequestScript(
        entry.scripts.preRequest,
        renderedRequest,
        environmentManager
      );

      currentEnvironmentVariables = updatedVariables;
    }

    // Make the actual API request
    const response = await makeRequest(appMode, renderedRequest, signal);

    if (entry.scripts.postResponse) {
      const processedCurrentEnvironmentVariables = Object.keys(currentEnvironmentVariables).reduce((acc, key) => {
        acc[key] = currentEnvironmentVariables[key].localValue || currentEnvironmentVariables[key].syncValue;
        return acc;
      }, {} as Record<string, string | number | boolean>);

      await executePostresponseScript(
        entry.scripts.postResponse,
        { response, request: renderedRequest },
        environmentManager,
        processedCurrentEnvironmentVariables
      );
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
