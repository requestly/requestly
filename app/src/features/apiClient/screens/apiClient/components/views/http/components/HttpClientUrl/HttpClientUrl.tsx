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

interface ApiClientUrlProps {
  url: string;
  currentEnvironmentVariables: ScopedVariables;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string, finalParams: KeyValuePair[]) => void;
  onImportCurlRequest?: (request: RQAPI.Request) => void;
}

//prettier-ignore
const HttpApiClientUrl = ({ url, currentEnvironmentVariables, onEnterPress, onUrlChange, onImportCurlRequest }: ApiClientUrlProps) => {
  const [queryParams, setQueryParams] = useQueryParamStore((state) => [state.queryParams, state.setQueryParams]);

  const updatePathVariableKeys = usePathVariablesStore((state) => state.updateVariableKeys);

  const handleUrlChange = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();

      if (trimmedValue.toLowerCase().startsWith("curl ")) {
        try {
          const requestFromCurl = parseCurlRequest(trimmedValue);

          if (!requestFromCurl || !requestFromCurl.url) {
            toast.error("Failed to parse cURL command. Please ensure it is valid.");
            return;
          }
          onImportCurlRequest(requestFromCurl);
        } catch (error) {
          toast.error(error.message || "Failed to parse cURL command. Please ensure it is valid.");
          return;
        }
      }

      const pathVariables = extractPathVariablesFromUrl(value);
      updatePathVariableKeys(pathVariables);

      const paramsFromUrl = extractQueryParams(value);
      const finalParams = [];

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
      placeholder="Enter or paste HTTP URL"
      currentEnvironmentVariables={currentEnvironmentVariables}
      onEnterPress={onEnterPress}
      onUrlChange={handleUrlChange}
    />
  );
};

export default memo(HttpApiClientUrl);
