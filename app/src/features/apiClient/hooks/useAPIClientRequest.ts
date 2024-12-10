import { useCallback, useRef } from "react";
import { APIClientManager } from "../helpers/APIClientManager";
import { RQAPI } from "../types";
import { trackAPIRequestCancelled } from "modules/analytics/events/features/apiClient";

interface APIRequestConfig {
  entry: RQAPI.Entry;
  appMode: string;
  environmentManager: any;
  signal?: AbortSignal;
  collectionId?: string;
}

export const useAPIClientRequest = () => {
  const abortControllerRef = useRef<AbortController | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  const executeRequest = async (config: APIRequestConfig) => {
    abortControllerRef.current = new AbortController();

    try {
      const apiClient = new APIClientManager({
        ...config,
        signal: abortControllerRef.current.signal,
      });
      return await apiClient.executeRequest();
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
