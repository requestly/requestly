import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import {
  extractPathVariablesFromUrl,
  extractQueryParams,
  queryParamsToURLString,
} from "features/apiClient/screens/apiClient/utils";
import { KeyValuePair } from "features/apiClient/types";
import { useCallback, memo } from "react";
import { ApiClientUrl } from "../../../components/request/components/ApiClientUrl/ApiClientUrl";
import { usePathVariablesStore } from "features/apiClient/hooks/usePathVariables.store";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";

interface ApiClientUrlProps {
  entity: BufferedHttpRecordEntity
  currentEnvironmentVariables: ScopedVariables;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string, finalParams: KeyValuePair[]) => void;
}

const HttpApiClientUrl = ({ entity, currentEnvironmentVariables, onEnterPress, onUrlChange }: ApiClientUrlProps) => {
  const url = useApiClientSelector(s => entity.getUrl(s));
  const queryParams = useApiClientSelector(s => entity.getQueryParams(s) );
  // const [queryParams, setQueryParams] = useQueryParamStore((state) => [state.queryParams, state.setQueryParams]);

  // const updatePathVariableKeys = usePathVariablesStore((state) => state.updateVariableKeys);

  const handleUrlChange = useCallback(
    (value: string) => {
      const pathVariables = extractPathVariablesFromUrl(value);
      entity.reconcilePathKeys(pathVariables);
      // updatePathVariableKeys(pathVariables);

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
    [onUrlChange, queryParams, ]
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
