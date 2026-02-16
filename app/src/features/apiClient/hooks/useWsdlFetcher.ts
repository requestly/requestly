import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useHttpRequestExecutor } from "./requestExecutors/useHttpRequestExecutor";
import { RQAPI } from "@requestly/shared/types/entities/apiClient";
import { SoapImportError } from "../errors/SoapImportError/SoapImportError";
import { ImportFile } from "../screens/apiClient/components/CommonApiClientImporter/CommonApiClientImporter";
import { RequestMethod } from "../types";
import { getDefaultAuth } from "../screens/apiClient/components/views/components/request/components/AuthorizationView/defaults";

interface UseWsdlFetcherResult {
  isFetching: boolean;
  error: string | null;
  fetchWsdlFromUrl: (url: string) => Promise<ImportFile | null>;
}

export const useWsdlFetcher = (): UseWsdlFetcherResult => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a temporary record ID for the executor
  const tempRecordId = uuidv4();
  const httpRequestExecutor = useHttpRequestExecutor(tempRecordId);

  const fetchWsdlFromUrl = useCallback(
    async (url: string): Promise<ImportFile | null> => {
      const urlValidationRegex = /^https?:\/\/.+(?:\?WSDL)$/i;
      if (!urlValidationRegex.test(url)) {
        setError(SoapImportError.invalidUrl().message);
        return null;
      }

      setIsFetching(true);
      setError(null);
      console.log("Fetching WSDL from URL:", url, url.trim());

      try {
        // Create a GET request to fetch the WSDL
        const httpRequest: RQAPI.HttpRequest = {
          url: url.trim(),
          method: RequestMethod.GET,
          headers: [],
          queryParams: [
            {
              isEnabled: true,
              id: 1,
              key: "WSDL",
              value: "",
            },
          ],
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
          const errorMessage = executionResult.error?.message || SoapImportError.fetchFailed().message;
          setError(errorMessage);
          return null;
        }

        const response = executionResult.executedEntry?.response;
        if (!response || !response.body) {
          setError(SoapImportError.invalidResponse().message);
          return null;
        }

        // Create ImportFile object from the fetched content
        const importFile: ImportFile = {
          content: response.body,
          name: "Url Response",
          type: "application/soap+xml",
        };

        console.log("Fetched WSDL ImportFile:", importFile);

        return importFile;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        const soapError = SoapImportError.fetchFailed(error.message);
        setError(soapError.message);
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    [httpRequestExecutor, tempRecordId]
  );

  return { isFetching, error, fetchWsdlFromUrl };
};
