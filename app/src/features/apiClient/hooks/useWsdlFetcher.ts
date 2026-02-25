import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useHttpRequestExecutor } from "./requestExecutors/useHttpRequestExecutor";
import { RQAPI } from "@requestly/shared/types/entities/apiClient";
import { WsdlFetchError } from "../errors/SoapImportError/SoapImportError";
import { ImportFile } from "../screens/apiClient/components/CommonApiClientImporter/CommonApiClientImporter";
import { RequestMethod } from "../types";
import { getDefaultAuth } from "../screens/apiClient/components/views/components/request/components/AuthorizationView/defaults";
import { extractQueryParams } from "../screens/apiClient/utils";

interface UseWsdlFetcherResult {
  isFetching: boolean;
  error: WsdlFetchError | null;
  fetchWsdlFromUrl: (url: string) => Promise<ImportFile | null>;
}

export const useWsdlFetcher = (): UseWsdlFetcherResult => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<WsdlFetchError | null>(null);

  // Create a temporary record ID for the executor
  const [tempRecordId] = useState(() => uuidv4());
  const httpRequestExecutor = useHttpRequestExecutor(tempRecordId);

  const fetchWsdlFromUrl = useCallback(
    async (url: string): Promise<ImportFile | null> => {
      const urlValidationRegex = /^https?:\/\//i;
      if (!urlValidationRegex.test(url)) {
        const invalidUrlError = WsdlFetchError.invalidUrl();
        setError(invalidUrlError);
        return null;
      }

      setIsFetching(true);
      setError(null);

      try {
        // Create a GET request to fetch the WSDL
        const queryParams = extractQueryParams(url);
        const httpRequest: RQAPI.HttpRequest = {
          url: url.trim(),
          method: RequestMethod.GET,
          headers: [],
          queryParams: queryParams,
          body: "",
          contentType: undefined,
        };

        const entry: RQAPI.HttpApiEntry = {
          type: RQAPI.ApiEntryType.HTTP,
          request: httpRequest,
          response: null,
          scripts: { preRequest: "", postResponse: "" },
          auth: getDefaultAuth(false),
          testResults: undefined,
        };

        // Execute the request
        const executionResult = await httpRequestExecutor.execute(
          {
            entry: entry,
            recordId: tempRecordId,
          },
          {
            iteration: 0,
            iterationCount: 1,
          }
        );

        if (executionResult.status === "error") {
          const fetchError = WsdlFetchError.fetchFailed(executionResult.error?.message, executionResult.error);
          setError(fetchError);
          return null;
        }

        const response = executionResult.executedEntry?.response;
        if (!response || !response.body) {
          const invalidResponseError = WsdlFetchError.invalidResponse();
          setError(invalidResponseError);
          return null;
        }

        // Create ImportFile object from the fetched content
        const importFile: ImportFile = {
          content: response.body,
          name: "Url Response",
          type: "application/soap+xml",
        };

        return importFile;
      } catch (err) {
        const originalError = err instanceof Error ? err : new Error("Unknown error");
        const fetchError = WsdlFetchError.fetchFailed(originalError.message, originalError);
        setError(fetchError);
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    [httpRequestExecutor, tempRecordId]
  );

  return { isFetching, error, fetchWsdlFromUrl };
};
