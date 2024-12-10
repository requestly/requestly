import { useCallback, useEffect, useRef, useState } from "react";
import { APIClientManager, APIRequestConfig } from "../helpers/APIClientManager";
import { trackAPIRequestCancelled } from "modules/analytics/events/features/apiClient";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { parseVariableValues } from "backend/environment/utils";
import { VariableKeyValuePairs } from "backend/environment/types";

export const useAPIClientRequest = () => {
  const { getVariablesWithPrecedence, setVariables, getCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId } = getCurrentEnvironment();

  const [requestConfig, setRequestConfig] = useState<APIRequestConfig | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const APIClientManagerRef = useRef<APIClientManager | null>(null);

  const upsertEnvironmentVariables = useCallback(
    async (variablesToUpsert: VariableKeyValuePairs) => {
      const currentVariables = getVariablesWithPrecedence(requestConfig?.collectionId);

      const variablesToSet = {
        ...currentVariables,
        ...Object.fromEntries(
          Object.entries(variablesToUpsert).map(([key, value]) => {
            if (currentVariables[key]) {
              return [
                key,
                {
                  syncValue: currentVariables[key].syncValue,
                  localValue: value,
                  type: currentVariables[key].type,
                },
              ];
            }

            return [
              key,
              {
                syncValue: value,
                localValue: value,
                type: typeof value,
              },
            ];
          })
        ),
      };

      await setVariables(currentEnvironmentId, variablesToSet);
    },
    [currentEnvironmentId, getVariablesWithPrecedence, requestConfig?.collectionId, setVariables]
  );

  useEffect(() => {
    if (!APIClientManagerRef.current) {
      return;
    }

    const currentVariables = getVariablesWithPrecedence(requestConfig?.collectionId);
    const formattedCurrentVariables = parseVariableValues(currentVariables);

    APIClientManagerRef.current.setCurrentVariables(formattedCurrentVariables);

    return () => {
      APIClientManagerRef.current = null;
    };
  }, [getVariablesWithPrecedence, requestConfig?.collectionId]);

  const executeRequest = async (config: APIRequestConfig) => {
    setRequestConfig(config);

    abortControllerRef.current = new AbortController();
    APIClientManagerRef.current = new APIClientManager({
      ...config,
      setVariables: upsertEnvironmentVariables,
      signal: abortControllerRef.current.signal,
    });

    const currentVariables = getVariablesWithPrecedence(config?.collectionId);
    const formattedCurrentVariables = parseVariableValues(currentVariables);
    APIClientManagerRef.current.setCurrentVariables(formattedCurrentVariables);

    try {
      return await APIClientManagerRef.current.executeRequest();
    } finally {
      abortControllerRef.current = null;
    }
  };

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      trackAPIRequestCancelled();
    }
  }, []);

  return {
    executeRequest,
    abortRequest,
  };
};
