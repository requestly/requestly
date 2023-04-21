import { Tabs, TabsProps } from "antd";
import React, { memo, useMemo } from "react";
import QueryParams from "./QueryParams";
import { RQAPI } from "../types";
import RequestHeaders from "./RequestHeaders";

interface Props {
  request: RQAPI.Request;
  setQueryParams: (queryParams: RQAPI.QueryParam[]) => void;
  setRequestHeaders: (headers: RQAPI.Header[]) => void;
}

enum Tab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
}

const RequestTabs: React.FC<Props> = ({ request, setQueryParams, setRequestHeaders }) => {
  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: Tab.QUERY_PARAMS,
        label: "Query Params",
        children: <QueryParams queryParams={request.queryParams} setQueryParams={setQueryParams} />,
      },
      {
        key: Tab.BODY,
        label: "Body",
        children: <div></div>,
      },
      {
        key: Tab.HEADERS,
        label: "Headers",
        children: <RequestHeaders headers={request.headers} setRequestHeaders={setRequestHeaders} />,
      },
      {
        key: Tab.AUTHORIZATION,
        label: "Authorization",
        children: <div></div>,
      },
    ],
    [request, setQueryParams, setRequestHeaders]
  );

  return <Tabs className="api-request-tabs" defaultActiveKey={Tab.QUERY_PARAMS} items={tabItems} size="small" />;
};

export default memo(RequestTabs);
