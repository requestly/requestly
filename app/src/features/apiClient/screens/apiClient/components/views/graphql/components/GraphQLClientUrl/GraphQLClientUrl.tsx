import { memo } from "react";
import { EnvironmentVariableValue } from "backend/environment/types";

import { ApiClientUrl } from "features/apiClient/screens/apiClient/components/views/components/request/components/ApiClientUrl/ApiClientUrl";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { ImSpinner2 } from "@react-icons/all-files/im/ImSpinner2";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";

interface GraphQLClientUrlProps {
  url: string;
  currentEnvironmentVariables: Record<string, EnvironmentVariableValue>;
  onEnterPress: (e: KeyboardEvent) => void;
  onUrlChange: (value: string) => void;
  fetchingIntrospectionData: boolean;
  isIntrospectionDataFetchingFailed: boolean;
}

const GraphQLClientUrl = ({
  url,
  currentEnvironmentVariables,
  onEnterPress,
  onUrlChange,
  fetchingIntrospectionData,
  isIntrospectionDataFetchingFailed,
}: GraphQLClientUrlProps) => {
  return (
    <>
      <ApiClientUrl
        url={url}
        currentEnvironmentVariables={currentEnvironmentVariables}
        onEnterPress={onEnterPress}
        onUrlChange={onUrlChange}
      />
      {fetchingIntrospectionData ? (
        <>
          <ImSpinner2 className="loading-spinner" />
          <span>Fetching schema</span>
        </>
      ) : isIntrospectionDataFetchingFailed ? (
        <MdOutlineWarningAmber />
      ) : (
        <MdOutlineCheckCircle style={{ color: "var(--requestly-color-success)" }} />
      )}
    </>
  );
};

export default memo(GraphQLClientUrl);
