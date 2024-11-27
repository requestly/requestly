import { Badge, Tabs, TabsProps, Tag } from "antd";
import React, { memo, useEffect, useMemo, useState } from "react";
import { KeyValueFormType, KeyValuePair, RQAPI, RequestContentType } from "../../../../../../../../types";
import RequestBody from "../../RequestBody";
import { sanitizeKeyValuePairs, supportsRequestBody } from "../../../../../../utils";
import { KeyValueTable } from "../KeyValueTable/KeyValueTable";
import { ScriptEditor } from "../../../Scripts/components/ScriptEditor/ScriptEditor";
import "./requestTabs.scss";

enum Tab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
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
  requestEntry: RQAPI.Entry;
  setQueryParams: (queryParams: KeyValuePair[]) => void;
  setBody: (body: RQAPI.RequestBody) => void;
  setContentType: (contentType: RequestContentType) => void;
  setRequestHeaders: (headers: KeyValuePair[]) => void;
  setScripts: (type: RQAPI.ScriptType, script: string) => void;
}

const RequestTabs: React.FC<Props> = ({
  requestEntry,
  setQueryParams,
  setBody,
  setRequestHeaders,
  setContentType,
  setScripts,
}) => {
  const [selectedTab, setSelectedTab] = useState(Tab.QUERY_PARAMS);

  useEffect(() => {
    if (selectedTab === Tab.BODY && !supportsRequestBody(requestEntry.request.method)) {
      setSelectedTab(Tab.QUERY_PARAMS);
    }
  }, [requestEntry.request.method, selectedTab]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    const isRequestBodySupported = supportsRequestBody(requestEntry.request.method);

    return [
      {
        key: Tab.QUERY_PARAMS,
        label: (
          <LabelWithCount label="Query Params" count={sanitizeKeyValuePairs(requestEntry.request.queryParams).length} />
        ),
        children: (
          <KeyValueTable
            data={requestEntry.request.queryParams}
            setKeyValuePairs={setQueryParams}
            pairtype={KeyValueFormType.QUERY_PARAMS}
          />
        ),
      },
      {
        key: Tab.BODY,
        label: (
          <LabelWithCount label="Body" count={requestEntry.request.body ? 1 : 0} showDot={isRequestBodySupported} />
        ),
        children: (
          <RequestBody
            body={requestEntry.request.body}
            contentType={requestEntry.request.contentType}
            setBody={setBody}
            setContentType={setContentType}
          />
        ),
        disabled: !isRequestBodySupported,
      },
      {
        key: Tab.HEADERS,
        label: <LabelWithCount label="Headers" count={sanitizeKeyValuePairs(requestEntry.request.headers).length} />,
        children: (
          <KeyValueTable
            data={requestEntry.request.headers}
            setKeyValuePairs={setRequestHeaders}
            pairtype={KeyValueFormType.HEADERS}
          />
        ),
      },
      {
        key: Tab.SCRIPTS,
        label: <LabelWithCount label="Scripts" count={0} />,
        children: <ScriptEditor setScripts={setScripts} scripts={requestEntry.scripts} />,
      },
      // {
      //   key: Tab.AUTHORIZATION,
      //   label: "Authorization",
      //   children: <div></div>,
      // },
    ];
  }, [requestEntry, setQueryParams, setBody, setRequestHeaders, setContentType, setScripts]);

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
