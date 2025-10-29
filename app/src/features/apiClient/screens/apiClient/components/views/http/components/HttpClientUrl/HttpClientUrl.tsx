import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import {
  extractPathVariablesFromUrl,
  extractQueryParams,
  queryParamsToURLString,
  parseCurlRequest,
} from "features/apiClient/screens/apiClient/utils";
import { toast } from "utils/Toast";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { useCallback, memo } from "react";
import { ApiClientUrl } from "../../../components/request/components/ApiClientUrl/ApiClientUrl";
import { usePathVariablesStore } from "features/apiClient/hooks/usePathVariables.store";
import { getEmptyApiEntry } from "features/apiClient/screens/apiClient/utils";

interface ApiClientUrlProps {
  url: string;
  currentEnvironmentVariables: ScopedVariables;
  onEnterPress: (e: KeyboardEvent, text: string) => void;
  onUrlChange: (value: string, finalParams: KeyValuePair[]) => void;
  onFullEntryChange: (entry: RQAPI.HttpApiEntry) => void;
  apiEntryDetails?: RQAPI.HttpApiEntry;
}

//prettier-ignore
const HttpApiClientUrl = ({ url, currentEnvironmentVariables, onEnterPress, onUrlChange, onFullEntryChange }: ApiClientUrlProps) => {
  const [queryParams, setQueryParams] = useQueryParamStore((state) => [state.queryParams, state.setQueryParams]);
  const updatePathVariableKeys = usePathVariablesStore((state) => state.updateVariableKeys);

  const parseAndHandleCurl = useCallback((curlString: string) => {
    try {
      const cleanedCurl = curlString.trim();
      const requestFromCurl = parseCurlRequest(cleanedCurl);

      if (!requestFromCurl || !requestFromCurl.url) {
        toast.error("Failed to parse cURL command. Please ensure it is valid.");
        return;
      }

      const apiEntry = getEmptyApiEntry(RQAPI.ApiEntryType.HTTP, requestFromCurl) as RQAPI.HttpApiEntry;
      onFullEntryChange(apiEntry);
      toast.success("cURL command imported successfully!");

      const urlWithoutParams = requestFromCurl.url.split("?")[0];
      const finalParams = (requestFromCurl as any).queryParams || extractQueryParams(requestFromCurl.url);
      
      setQueryParams(finalParams);
      onUrlChange(urlWithoutParams, finalParams);

    } catch (error) {
      toast.error(error.message || "Failed to parse cURL command. Please ensure it is valid.");
    }
  }, [onFullEntryChange, onUrlChange, setQueryParams]);


  const handleUrlPaste = useCallback((pastedValue: string) => {
    const trimmedValue = pastedValue.trim();
    if (trimmedValue.toLowerCase().startsWith("curl ")) {
      parseAndHandleCurl(trimmedValue);
      return true; 
    }
    return false; 
  }, [parseAndHandleCurl]);

  const handleEnterPress = useCallback((event: KeyboardEvent, text: string) => {
    const trimmedValue = text.trim();
    if (trimmedValue.toLowerCase().startsWith("curl ")) {
      parseAndHandleCurl(trimmedValue);
    } else {
      onEnterPress(event, text);
    }
  }, [onEnterPress, parseAndHandleCurl]);


  const handleUrlChange = useCallback(
    (value: string) => {

      if (value.trim().toLowerCase().startsWith("curl ")) {
        parseAndHandleCurl(value);
        return;
      }

      const pathVariables = extractPathVariablesFromUrl(value);
      updatePathVariableKeys(pathVariables);

      const paramsFromUrl = extractQueryParams(value);
      const finalParams: KeyValuePair[] = [];

      const disabledPositions = new Map();
      queryParams.forEach((param, index) => {
        if (!param.isEnabled) {
          disabledPositions.set(index, param);
        }
      });

      /*  Opted for manual counters because:
        - Url params does not have context of the disabled params, when params in url are changed, disabled params positioning should also be maintained.
        - This is possible to handle using Array.prototye.findIndex, but it is not performant as it traverses the queryParams for each disabled param.
      */
      let urlParamIndex = 0;
      for (let i = 0; i < Math.max(queryParams.length, paramsFromUrl.length + disabledPositions.size); i++) {
        if (disabledPositions.has(i)) {
          finalParams.push(disabledPositions.get(i));
        } else if (urlParamIndex < paramsFromUrl.length) {
          finalParams.push(paramsFromUrl[urlParamIndex++]);
        }
      }

      setQueryParams(finalParams);
      onUrlChange(value, finalParams);
    },
    [onUrlChange, queryParams, setQueryParams, updatePathVariableKeys]
  );

  return (
    <ApiClientUrl
      url={queryParamsToURLString(queryParams, url)}
      placeholder="Enter or paste HTTP URL or cURL command"
      currentEnvironmentVariables={currentEnvironmentVariables}
      onEnterPress={handleEnterPress}
      onUrlChange={handleUrlChange}
      onUrlPaste={handleUrlPaste}
    />
  );
};

export default memo(HttpApiClientUrl);
