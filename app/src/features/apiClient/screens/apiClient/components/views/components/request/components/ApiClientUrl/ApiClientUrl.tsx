import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { useCallback } from "react";
import "./apiClientUrl.css";

interface ApiClientUrlProps {
  url: string;
  placeholder: string;
  currentEnvironmentVariables: ScopedVariables;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string) => void;
  onPaste?: (text: string) => void;
}

export const ApiClientUrl = ({
  url,
  currentEnvironmentVariables,
  placeholder,
  onEnterPress,
  onUrlChange,
  onPaste,
}: ApiClientUrlProps) => {
  const handleUrlChange = useCallback(
    (value: string) => {
      onUrlChange(value);
    },
    [onUrlChange]
  );

  return (
    <SingleLineEditor
      className="api-request-url"
      placeholder={placeholder}
      //value={entry.request.url}
      defaultValue={url}
      onChange={(value) => {
        handleUrlChange(value);
      }}
      onPressEnter={onEnterPress}
      onPaste={onPaste}
      variables={currentEnvironmentVariables}
      // prefix={<Favicon size="small" url={entry.request.url} debounceWait={500} style={{ marginRight: 2 }} />}
    />
  );
};
