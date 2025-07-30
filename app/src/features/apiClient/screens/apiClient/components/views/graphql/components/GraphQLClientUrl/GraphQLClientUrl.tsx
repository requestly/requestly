import { memo } from "react";
import { EnvironmentVariableValue } from "backend/environment/types";
import { ApiClientUrl } from "features/apiClient/screens/apiClient/components/views/components/request/components/ApiClientUrl/ApiClientUrl";

interface GraphQLClientUrlProps {
  url: string;
  currentEnvironmentVariables: Record<string, EnvironmentVariableValue>;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string) => void;
}

const GraphQLClientUrl = ({ url, currentEnvironmentVariables, onEnterPress, onUrlChange }: GraphQLClientUrlProps) => {
  return (
    <ApiClientUrl
      url={url}
      currentEnvironmentVariables={currentEnvironmentVariables}
      onEnterPress={onEnterPress}
      onUrlChange={onUrlChange}
    />
  );
};

export default memo(GraphQLClientUrl);
