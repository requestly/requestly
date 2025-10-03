import { memo, useCallback } from "react";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { ApiClientUrl } from "features/apiClient/screens/apiClient/components/views/components/request/components/ApiClientUrl/ApiClientUrl";
import { MdOutlineCheckCircle } from "@react-icons/all-files/md/MdOutlineCheckCircle";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { Spin, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { IoMdRefresh } from "@react-icons/all-files/io/IoMdRefresh";
import { MdOutlineAddLink } from "@react-icons/all-files/md/MdOutlineAddLink";
import { RQButton } from "lib/design-system-v2/components";
import "./graphqlClientUrl.scss";
import { DEMO_GRAPHQL_API_URL } from "features/apiClient/constants";
import { useGraphQLIntrospection } from "features/apiClient/hooks/useGraphQLIntrospection";

interface GraphQLClientUrlProps {
  url: string;
  currentEnvironmentVariables: ScopedVariables;
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
  const [introspectionData, updateEntryRequest] = useGraphQLRecordStore((state) => [
    state.introspectionData,
    state.updateEntryRequest,
  ]);
  const { introspectAndSaveSchema } = useGraphQLIntrospection();

  const handleUseExampleUrl = useCallback(() => {
    updateEntryRequest({
      url: DEMO_GRAPHQL_API_URL,
    });
  }, [updateEntryRequest]);

  return (
    <div className="gql-url-container">
      <ApiClientUrl
        url={url}
        currentEnvironmentVariables={currentEnvironmentVariables}
        onEnterPress={onEnterPress}
        onUrlChange={onUrlChange}
        placeholder="Enter or paste GraphQL endpoint URL"
      />
      <div className="gql-url__actions">
        {!url.length ? (
          <RQButton
            className="ant-btn-sm"
            size="small"
            type="transparent"
            icon={<MdOutlineAddLink />}
            onClick={handleUseExampleUrl}
          >
            Use example URL
          </RQButton>
        ) : null}
        {!fetchingIntrospectionData && url.length ? (
          <RQButton
            className="ant-btn-sm"
            size="small"
            type="transparent"
            icon={<IoMdRefresh />}
            onClick={introspectAndSaveSchema}
          >
            Refresh
          </RQButton>
        ) : null}
        {fetchingIntrospectionData ? (
          <div className="gql-url-container__loading">
            <Spin indicator={<LoadingOutlined spin />} size="small" />
            <span>Fetching schema</span>
          </div>
        ) : (
          <div className="gql-url__fetch-status">
            {isIntrospectionDataFetchingFailed ? (
              <Tooltip
                color="#000"
                title="Error while fetching the schema. The endpoint may not exist or misconfigured."
                placement="top"
              >
                <MdOutlineWarningAmber className="gql-url__fetch-status-icon schema-failed" />
              </Tooltip>
            ) : introspectionData !== null ? (
              <Tooltip title="Schema fetched successfully" placement="top" color="#000">
                <MdOutlineCheckCircle className="gql-url__fetch-status-icon schema-success" />
              </Tooltip>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(GraphQLClientUrl);
