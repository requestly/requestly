import { EnvironmentVariableValue } from "backend/environment/types";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import { extractQueryParams, queryParamsToURLString } from "features/apiClient/screens/apiClient/utils";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { KeyValuePair } from "features/apiClient/types";
import { useCallback } from "react";

interface ApiClientUrlProps {
  url: string;
  currentEnvironmentVariables: Record<string, EnvironmentVariableValue>;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string, finalParams: KeyValuePair[]) => void;
}

export const ApiClientUrl = ({ url, currentEnvironmentVariables, onEnterPress, onUrlChange }: ApiClientUrlProps) => {
  const [queryParams, setQueryParams] = useQueryParamStore((state) => [state.queryParams, state.setQueryParams]);

  const handleUrlChange = useCallback(
    (value: string) => {
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
    [onUrlChange, queryParams, setQueryParams]
  );

  return (
    <SingleLineEditor
      className="api-request-url"
      placeholder="https://example.com"
      //value={entry.request.url}
      defaultValue={queryParamsToURLString(queryParams, url)}
      onChange={(value) => {
        handleUrlChange(value);
      }}
      onPressEnter={onEnterPress}
      variables={currentEnvironmentVariables}
      // prefix={<Favicon size="small" url={entry.request.url} debounceWait={500} style={{ marginRight: 2 }} />}
    />
  );
};
