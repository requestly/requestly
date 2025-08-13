import { RQAPI } from "features/apiClient/types";
import { ApiClientRequestTabs } from "../../../components/request/components/ApiClientRequestTabs/ApiClientRequestTabs";
import React, { useMemo } from "react";
import { RequestTabLabel } from "../../../components/request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { QueryView } from "../QueryView/QueryView";
import { RequestHeaders } from "./components/RequestHeaders/RequestHeaders";
import { GraphQLAuthView } from "./components/GraphQLAuthView/GraphQLAuthView";
import { GraphQLScripts } from "./components/GraphQLAuthView/GraphQLScripts";

enum GraphQLRequestTab {
  QUERY = "query",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

interface Props {
  requestId: RQAPI.ApiRecord["id"];
  collectionId: RQAPI.ApiRecord["collectionId"];
}

export const GraphQLRequestTabs: React.FC<Props> = ({ requestId, collectionId }) => {
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
        children: <RequestHeaders requestId={requestId} />,
      },
      {
        key: GraphQLRequestTab.AUTHORIZATION,
        label: <RequestTabLabel label="Authorization" />,
        children: <GraphQLAuthView recordId={requestId} collectionId={collectionId} />,
      },
      {
        key: GraphQLRequestTab.SCRIPTS,
        label: <RequestTabLabel label="Scripts" />,
        children: <GraphQLScripts />,
      },
    ];
  }, [requestId, collectionId]);
  return <ApiClientRequestTabs requestId={requestId} items={tabItems} defaultActiveKey={GraphQLRequestTab.QUERY} />;
};
