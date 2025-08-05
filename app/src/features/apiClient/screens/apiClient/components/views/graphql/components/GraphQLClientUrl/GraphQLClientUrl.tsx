import { memo } from "react";
import { EnvironmentVariableValue } from "backend/environment/types";

import { ApiClientUrl } from "features/apiClient/screens/apiClient/components/views/components/request/components/ApiClientUrl/ApiClientUrl";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { Spin, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import "./graphqlClientUrl.scss";

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
  const [introspectionData] = useGraphQLRecordStore((state) => [state.introspectionData]);

  return (
    <div className="gql-url-container">
      <ApiClientUrl
        url={url}
        currentEnvironmentVariables={currentEnvironmentVariables}
        onEnterPress={onEnterPress}
        onUrlChange={onUrlChange}
      />
      <div className="gql-url__fetch-status">
        {fetchingIntrospectionData ? (
          <div className="gql-url-container__loading">
            <Spin indicator={<LoadingOutlined spin />} size="small" />
            <span>Fetching schema</span>
          </div>
        ) : isIntrospectionDataFetchingFailed ? (
          <Tooltip
            color="#000"
            title="Error while fetching the schema. The endpoint may not exist or misconfigured."
            placement="top"
          >
            <MdOutlineWarningAmber className="gql-url__fetch-status-icon schema-failed" />
          </Tooltip>
        ) : introspectionData !== null ? (
          <Tooltip title="Schema fetched successfully" placement="top" color="#000">
            <MdOutlineCheckCircle className=" gql-url__fetch-status-icon schema-success" />
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
};

export default memo(GraphQLClientUrl);
