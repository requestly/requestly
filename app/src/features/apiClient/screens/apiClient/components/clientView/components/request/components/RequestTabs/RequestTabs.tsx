import { Badge, Tabs, TabsProps, Tag } from "antd";
import React, { memo, useEffect, useMemo, useState } from "react";
import { KeyValueFormType, RQAPI, RequestContentType } from "../../../../../../../../types";
import RequestBody from "../../RequestBody";
import { sanitizeKeyValuePairs, supportsRequestBody } from "../../../../../../utils";
import { KeyValueTable } from "../KeyValueTable/KeyValueTable";
import { ScriptEditor } from "../../../Scripts/components/ScriptEditor/ScriptEditor";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
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
  setRequestEntry: (updater: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
  setContentType: (contentType: RequestContentType) => void;
}

const RequestTabs: React.FC<Props> = ({ requestEntry, setRequestEntry, setContentType }) => {
  const [selectedTab, setSelectedTab] = useState(Tab.QUERY_PARAMS);
  const isApiClientScripts = useFeatureIsOn("api-client-scripts");

  useEffect(() => {
    if (selectedTab === Tab.BODY && !supportsRequestBody(requestEntry.request.method)) {
      setSelectedTab(Tab.QUERY_PARAMS);
    }
  }, [requestEntry.request.method, selectedTab]);

  const tabItems: TabsProps["items"] = useMemo(() => {
    const isRequestBodySupported = supportsRequestBody(requestEntry.request.method);
    const isScriptsSupported = isApiClientScripts;

    const items = [
      {
        key: Tab.QUERY_PARAMS,
        label: (
          <LabelWithCount label="Query Params" count={sanitizeKeyValuePairs(requestEntry.request.queryParams).length} />
        ),
        children: (
          <KeyValueTable
            data={requestEntry.request.queryParams}
            setKeyValuePairs={setRequestEntry}
            pairType={KeyValueFormType.QUERY_PARAMS}
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
            setRequestEntry={setRequestEntry}
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
            setKeyValuePairs={setRequestEntry}
            pairType={KeyValueFormType.HEADERS}
          />
        ),
      },
      // {
      //   key: Tab.AUTHORIZATION,
      //   label: "Authorization",
      //   children: <div></div>,
      // },
    ];

    if (isScriptsSupported) {
      items.push({
        key: Tab.SCRIPTS,
        label: <LabelWithCount label="Scripts" count={0} />,
        children: <ScriptEditor setScripts={setRequestEntry} scripts={requestEntry.scripts} />,
      });
    }

    return items;
  }, [requestEntry, setRequestEntry, setContentType, isApiClientScripts]);

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
