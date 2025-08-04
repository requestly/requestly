import { RQAPI } from "features/apiClient/types";
import { ApiClientRequestTabs } from "../../../components/request/components/ApiClientRequestTabs/ApiClientRequestTabs";
import React, { useMemo } from "react";
import { RequestTabLabel } from "../../../components/request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { QueryView } from "../QueryView/QueryView";

enum GraphQLRequestTab {
  QUERY = "query",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

interface Props {
  requestId: RQAPI.ApiRecord["id"];
}

export const GraphQLRequestTabs: React.FC<Props> = ({ requestId }) => {
  const tabItems = useMemo(() => {
    return [
      {
        key: GraphQLRequestTab.QUERY,
        label: <RequestTabLabel label="Query" />,
        children: <QueryView />,
      },
      {
        key: GraphQLRequestTab.HEADERS,
        label: <RequestTabLabel label="Headers" />,
        children: <div>Headers</div>,
      },
      {
        key: GraphQLRequestTab.AUTHORIZATION,
        label: <RequestTabLabel label="Authorization" />,
        children: <div>Authorization</div>,
      },
      {
        key: GraphQLRequestTab.SCRIPTS,
        label: <RequestTabLabel label="Scripts" />,
        children: <div>Scripts</div>,
      },
    ];
  }, []);
  return <ApiClientRequestTabs requestId={requestId} items={tabItems} defaultActiveKey={GraphQLRequestTab.QUERY} />;
};
