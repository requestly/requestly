import { Tabs, TabsProps } from "antd";
import React, { memo, useMemo } from "react";
import { KeyValuePair, RQAPI, RequestContentType, RequestMethod } from "../../types";
import RequestBody from "./RequestBody";
import KeyValueForm from "./KeyValueForm";

interface Props {
  request: RQAPI.Request;
  setQueryParams: (queryParams: KeyValuePair[]) => void;
  setBody: (body: string) => void;
  setContentType: (contentType: RequestContentType) => void;
  setRequestHeaders: (headers: KeyValuePair[]) => void;
}

enum Tab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
}

const RequestTabs: React.FC<Props> = ({ request, setQueryParams, setBody, setRequestHeaders, setContentType }) => {
  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: Tab.QUERY_PARAMS,
        label: "Query Params",
        children: <KeyValueForm keyValuePairs={request.queryParams} setKeyValuePairs={setQueryParams} />,
      },
      {
        key: Tab.BODY,
        label: "Body",
        children: (
          <RequestBody
            body={request.body}
            contentType={request.contentType}
            setBody={setBody}
            setContentType={setContentType}
          />
        ),
        disabled: [RequestMethod.GET, RequestMethod.HEAD].includes(request.method),
      },
      {
        key: Tab.HEADERS,
        label: "Headers",
        children: <KeyValueForm keyValuePairs={request.headers} setKeyValuePairs={setRequestHeaders} />,
      },
      {
        key: Tab.AUTHORIZATION,
        label: "Authorization",
        children: <div></div>,
      },
    ],
    [request, setQueryParams, setBody, setRequestHeaders, setContentType]
  );

  return <Tabs className="api-request-tabs" defaultActiveKey={Tab.QUERY_PARAMS} items={tabItems} size="small" />;
};

export default memo(RequestTabs);
