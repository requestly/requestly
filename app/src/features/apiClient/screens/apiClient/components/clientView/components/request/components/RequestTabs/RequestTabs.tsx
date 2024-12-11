import { Tabs, TabsProps, Tag } from "antd";
import React, { memo, useEffect, useMemo, useState } from "react";
import { KeyValueFormType, RQAPI, RequestContentType } from "../../../../../../../../types";
import RequestBody from "../../RequestBody";
import { sanitizeKeyValuePairs, supportsRequestBody } from "../../../../../../utils";
import { KeyValueTable } from "../KeyValueTable/KeyValueTable";
import { ScriptEditor } from "../../../Scripts/components/ScriptEditor/ScriptEditor";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import "./requestTabs.scss";
import AuthorizationView from "../AuthorizationView";

enum Tab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

const TabHeaderLabel: React.FC<{ label: string; count?: number; showDot?: boolean }> = ({ label, count, showDot }) => {
  return (
    <div className="request-tab-label">
      <span>{label}</span>
      {count ? showDot ? <span className="request-tab-dot" /> : <Tag className="count">{count}</Tag> : null}
    </div>
  );
};

interface Props {
  requestEntry: RQAPI.Entry;
  collectionId: string;
  setRequestEntry: (updater: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
  setContentType: (contentType: RequestContentType) => void;
}

const RequestTabs: React.FC<Props> = ({ requestEntry, collectionId, setRequestEntry, setContentType }) => {
  const [selectedTab, setSelectedTab] = useState(Tab.QUERY_PARAMS);
  const isApiClientScripts = useFeatureIsOn("api-client-scripts");
  const { getVariablesWithPrecedence } = useEnvironmentManager();
  const variables = useMemo(() => getVariablesWithPrecedence(collectionId), [collectionId, getVariablesWithPrecedence]);

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
          <TabHeaderLabel label="Query Params" count={sanitizeKeyValuePairs(requestEntry.request.queryParams).length} />
        ),
        children: (
          <KeyValueTable
            data={requestEntry.request.queryParams}
            setKeyValuePairs={setRequestEntry}
            pairType={KeyValueFormType.QUERY_PARAMS}
            variables={variables}
          />
        ),
      },
      {
        key: Tab.BODY,
        label: (
          <TabHeaderLabel label="Body" count={requestEntry.request.body ? 1 : 0} showDot={isRequestBodySupported} />
        ),
        children: (
          <RequestBody
            body={requestEntry.request.body}
            contentType={requestEntry.request.contentType}
            setRequestEntry={setRequestEntry}
            setContentType={setContentType}
            variables={variables}
          />
        ),
        disabled: !isRequestBodySupported,
      },
      {
        key: Tab.HEADERS,
        label: (
          <TabHeaderLabel
            label="Headers"
            count={sanitizeKeyValuePairs(requestEntry.request.headers, true, false).length}
          />
        ),
        children: (
          <KeyValueTable
            data={requestEntry.request.headers}
            setKeyValuePairs={setRequestEntry}
            pairType={KeyValueFormType.HEADERS}
            variables={variables}
          />
        ),
      },
      {
        key: Tab.AUTHORIZATION,
        label: (
          <TabHeaderLabel
            label="Authorization"
            showDot={requestEntry.request.headers.findIndex((header) => header.type === "auth") !== -1}
          />
        ),
        children: (
          <AuthorizationView
            requestHeaders={requestEntry.request.headers}
            setRequestEntry={setRequestEntry}
            prefillAuthValues={requestEntry.request.auth}
          />
        ),
      },
    ];

    if (isScriptsSupported) {
      items.push({
        key: Tab.SCRIPTS,
        label: (
          <TabHeaderLabel
            label="Scripts"
            showDot={true}
            count={requestEntry.scripts?.postResponse?.length || requestEntry.scripts?.preRequest?.length}
          />
        ),
        children: <ScriptEditor setScripts={setRequestEntry} scripts={requestEntry.scripts} />,
      });
    }

    return items;
  }, [requestEntry, setRequestEntry, setContentType, isApiClientScripts, variables]);

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
