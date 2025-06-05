import { EnvironmentVariableValue } from "backend/environment/types";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import { extractQueryParams, queryParamsToURLString } from "features/apiClient/screens/apiClient/utils";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { useCallback } from "react";

interface ApiClientUrlProps {
  url: string;
  currentEnvironmentVariables: Record<string, EnvironmentVariableValue>;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string) => void;
}

export const ApiClientUrl = ({ url, currentEnvironmentVariables, onEnterPress, onUrlChange }: ApiClientUrlProps) => {
  const [queryParams, setQueryParams] = useQueryParamStore((state) => [state.queryParams, state.setQueryParams]);

  const handleUrlChange = useCallback(
    (value: string) => {
      onUrlChange(value);
      const paramsFromUrl = extractQueryParams(value);
      const finalParams = [];

      const disabledPositions = new Map();
      queryParams.forEach((param, index) => {
        if (!param.isEnabled) {
          disabledPositions.set(index, param);
        }
      });

      let urlParamIndex = 0;
      for (let i = 0; i < Math.max(queryParams.length, paramsFromUrl.length + disabledPositions.size); i++) {
        if (disabledPositions.has(i)) {
          finalParams.push(disabledPositions.get(i));
        } else if (urlParamIndex < paramsFromUrl.length) {
          finalParams.push(paramsFromUrl[urlParamIndex++]);
        }
      }

      setQueryParams(finalParams);
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
