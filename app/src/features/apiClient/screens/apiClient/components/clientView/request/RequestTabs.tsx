import { Badge, Tabs, TabsProps, Tag } from "antd";
import React, { memo, useEffect, useMemo, useState } from "react";
import { KeyValuePair, RQAPI, RequestContentType, KeyValueFormType } from "../../../../../types";
import RequestBody from "./RequestBody";
import KeyValueForm from "./KeyValueForm";
import { sanitizeKeyValuePairs, supportsRequestBody } from "../../../utils";
import "./requestTabs.scss";

enum Tab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
}

const LabelWithCount: React.FC<{ label: string; count: number; showDot?: boolean }> = ({ label, count, showDot }) => {
  return (
    <>
      <span>{label}</span>
      {count ? (
        showDot ? (
          <Badge className="dot" size="small" dot={true} />
        ) : (
          <Tag className="count">{count}</Tag>
        )
      ) : null}
    </>
  );
};

interface Props {
  request: RQAPI.Request;
  setQueryParams: (queryParams: KeyValuePair[]) => void;
  setBody: (body: RQAPI.RequestBody) => void;
  setContentType: (contentType: RequestContentType) => void;
  setRequestHeaders: (headers: KeyValuePair[]) => void;
}

const RequestTabs: React.FC<Props> = ({ request, setQueryParams, setBody, setRequestHeaders, setContentType }) => {
  const [selectedTab, setSelectedTab] = useState(Tab.QUERY_PARAMS);

  useEffect(() => {
    if (selectedTab === Tab.BODY && !supportsRequestBody(request.method)) {
      setSelectedTab(Tab.QUERY_PARAMS);
    }
  }, [request.method, selectedTab]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    const isRequestBodySupported = supportsRequestBody(request.method);

    return [
      {
        key: Tab.QUERY_PARAMS,
        label: <LabelWithCount label="Query Params" count={sanitizeKeyValuePairs(request.queryParams).length} />,
        children: (
          <KeyValueForm
            formType={KeyValueFormType.QUERY_PARAMS}
            keyValuePairs={request.queryParams}
            setKeyValuePairs={setQueryParams}
          />
        ),
      },
      {
        key: Tab.BODY,
        label: <LabelWithCount label="Body" count={request.body ? 1 : 0} showDot={isRequestBodySupported} />,
        children: (
          <RequestBody
            body={request.body}
            contentType={request.contentType}
            setBody={setBody}
            setContentType={setContentType}
          />
        ),
        disabled: !isRequestBodySupported,
      },
      {
        key: Tab.HEADERS,
        label: <LabelWithCount label="Headers" count={sanitizeKeyValuePairs(request.headers).length} />,
        children: (
          <KeyValueForm
            formType={KeyValueFormType.HEADERS}
            keyValuePairs={request.headers}
            setKeyValuePairs={setRequestHeaders}
            // keyOptions={HEADER_SUGGESTIONS.Request}
          />
        ),
      },
      // {
      //   key: Tab.AUTHORIZATION,
      //   label: "Authorization",
      //   children: <div></div>,
      // },
    ];
  }, [request, setQueryParams, setBody, setRequestHeaders, setContentType]);

  return (
    <Tabs
      className="api-request-tabs"
      activeKey={selectedTab}
      onChange={(tab: Tab) => setSelectedTab(tab)}
      items={tabItems}
      size="small"
    />
  );
};

export default memo(RequestTabs);
