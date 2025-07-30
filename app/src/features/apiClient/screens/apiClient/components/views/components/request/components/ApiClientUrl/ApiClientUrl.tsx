import { EnvironmentVariableValue } from "backend/environment/types";
import { DEMO_API_URL } from "features/apiClient/constants";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { useCallback } from "react";

interface ApiClientUrlProps {
  url: string;
  currentEnvironmentVariables: Record<string, EnvironmentVariableValue>;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string) => void;
}

export const ApiClientUrl = ({ url, currentEnvironmentVariables, onEnterPress, onUrlChange }: ApiClientUrlProps) => {
  const handleUrlChange = useCallback(
    (value: string) => {
      onUrlChange(value);
    },
    [onUrlChange]
  );

  return (
    <SingleLineEditor
      className="api-request-url"
      placeholder={DEMO_API_URL}
      //value={entry.request.url}
      defaultValue={url}
      onChange={(value) => {
        handleUrlChange(value);
      }}
      onPressEnter={onEnterPress}
      variables={currentEnvironmentVariables}
      // prefix={<Favicon size="small" url={entry.request.url} debounceWait={500} style={{ marginRight: 2 }} />}
    />
  );
};
