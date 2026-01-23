import { useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import {
  extractPathVariablesFromUrl,
  extractQueryParams,
  queryParamsToURLString,
  isCurlCommand,
  parseCurlRequest,
} from "features/apiClient/screens/apiClient/utils";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { useCallback, memo } from "react";
import { ApiClientUrl } from "../../../components/request/components/ApiClientUrl/ApiClientUrl";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { toast } from "utils/Toast";

interface ApiClientUrlProps {
  entity: BufferedHttpRecordEntity;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string, finalParams: KeyValuePair[]) => void;
  onCurlImport?: (request: RQAPI.Request) => void;
}

const HttpApiClientUrl = ({ entity, onEnterPress, onUrlChange, onCurlImport }: ApiClientUrlProps) => {
  const url = useApiClientSelector((s) => entity.getUrl(s));
  const queryParams = useApiClientSelector((s) => entity.getQueryParams(s));
  const currentEnvironmentVariables = useScopedVariables(entity.meta.referenceId);

  const handlePaste = useCallback(
    (pastedText: string): boolean => {
      // Only try to parse if it looks like a curl command
      if (isCurlCommand(pastedText)) {
        try {
          const requestFromCurl = parseCurlRequest(pastedText);
          if (requestFromCurl?.url) {
            onCurlImport?.(requestFromCurl);
            return true; // Indicate that we handled the paste
          }
        } catch (error) {
          console.error("Curl parsing error:", error);
          toast.error("Failed to parse cURL command");
        }
      }
      return false; // Let normal paste handling continue for regular URLs
    },
    [onCurlImport]
  );

  const handleUrlChange = useCallback(
    (value: string) => {
      // Regular URL handling
      const pathVariables = extractPathVariablesFromUrl(value);
      entity.reconcilePathKeys(pathVariables);

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

      entity.setQueryParams(finalParams);
      onUrlChange(value, finalParams);
    },
    [entity, onUrlChange, queryParams]
  );

  return (
    <ApiClientUrl
      url={queryParamsToURLString(queryParams, url)}
      placeholder="Enter or paste HTTP URL or cURL command"
      currentEnvironmentVariables={currentEnvironmentVariables}
      onEnterPress={onEnterPress}
      onUrlChange={handleUrlChange}
      onPaste={handlePaste}
    />
  );
};

export default memo(HttpApiClientUrl);
