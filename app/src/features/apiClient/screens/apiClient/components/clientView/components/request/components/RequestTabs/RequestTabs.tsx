import { Tabs, TabsProps, Tag } from "antd";
import React, { memo, useEffect, useMemo } from "react";
import { RQAPI, RequestContentType } from "../../../../../../../../types";
import RequestBody from "../../RequestBody";
import { sanitizeKeyValuePairs, supportsRequestBody } from "../../../../../../utils";
import { ScriptEditor } from "../../../Scripts/components/ScriptEditor/ScriptEditor";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import "./requestTabs.scss";
import AuthorizationView from "../AuthorizationView";
import { QueryParamsTable } from "./components/QueryParamsTable/QueryParamsTable";
import { HeadersTable } from "./components/HeadersTable/HeadersTable";
import { useDeepLinkState } from "hooks";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";

enum Tab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

const LabelWithCount: React.FC<{ label: string; count?: number; showDot?: boolean }> = ({ label, count, showDot }) => {
  return (
    <div className="request-tab-label">
      <span>{label}</span>
      {count ? showDot ? <span className="request-tab-dot" /> : <Tag className="count">{count}</Tag> : null}
    </div>
  );
};

interface Props {
  requestEntry: RQAPI.Entry;
  requestId: RQAPI.ApiRecord["id"];
  collectionId: string;
  setRequestEntry: (updater: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
  setContentType: (contentType: RequestContentType) => void;
  handleAuthChange: (authOptions: RQAPI.AuthOptions) => void;
}

const RequestTabs: React.FC<Props> = ({
  requestEntry,
  requestId,
  collectionId,
  setRequestEntry,
  setContentType,
  handleAuthChange,
}) => {
  const { activeTab, updateTab } = useTabsLayoutContext();
  const [selectedTab, setSelectedTab] = useDeepLinkState({ tab: Tab.QUERY_PARAMS });
  const isApiClientScripts = useFeatureIsOn("api-client-scripts");
  const { getVariablesWithPrecedence } = useEnvironmentManager();
  const variables = useMemo(() => getVariablesWithPrecedence(collectionId), [collectionId, getVariablesWithPrecedence]);

  useEffect(() => {
    if (requestId !== activeTab?.id) {
      return;
    }

    if (selectedTab.tab === Tab.BODY && !supportsRequestBody(requestEntry.request.method)) {
      setSelectedTab({ tab: Tab.QUERY_PARAMS });
    }
  }, [requestId, activeTab?.id, requestEntry.request.method, selectedTab.tab, setSelectedTab]);

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
          <QueryParamsTable requestEntry={requestEntry} setRequestEntry={setRequestEntry} variables={variables} />
        ),
      },
      {
        key: Tab.BODY,
        label: (
          <LabelWithCount label="Body" count={requestEntry.request.body ? 1 : 0} showDot={isRequestBodySupported} />
        ),
        children: requestEntry.request.bodyContainer ? (
          <RequestBody
            mode="multiple"
            bodyContainer={requestEntry.request.bodyContainer}
            contentType={requestEntry.request.contentType}
            setRequestEntry={setRequestEntry}
            setContentType={setContentType}
            variables={variables}
          />
        ) : (
          <RequestBody
            mode="single"
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
        label: <LabelWithCount label="Headers" count={sanitizeKeyValuePairs(requestEntry.request.headers).length} />,
        children: (
          <HeadersTable
            headers={requestEntry.request.headers}
            variables={variables}
            setRequestEntry={setRequestEntry}
          />
        ),
      },
      {
        key: Tab.AUTHORIZATION,
        label: <LabelWithCount label="Authorization" />,
        children: (
          <AuthorizationView
            defaultValues={requestEntry.auth}
            onAuthUpdate={handleAuthChange}
            rootLevelRecord={!collectionId}
            variables={variables}
          />
        ),
      },
    ];

    if (isScriptsSupported) {
      items.push({
        key: Tab.SCRIPTS,
        label: (
          <LabelWithCount
            label="Scripts"
            showDot={true}
            count={requestEntry.scripts?.postResponse?.length || requestEntry.scripts?.preRequest?.length}
          />
        ),
        children: <ScriptEditor setScripts={setRequestEntry} scripts={requestEntry.scripts} />,
      });
    }

    return items;
  }, [requestEntry, setRequestEntry, setContentType, isApiClientScripts, variables, handleAuthChange, collectionId]);

  return (
    <Tabs
      className="api-request-tabs"
      activeKey={selectedTab.tab}
      onChange={(tab: Tab) => {
        setSelectedTab({ tab: tab });

        if (!requestId) {
          return;
        }

        updateTab(requestId, {
          url: `${PATHS.API_CLIENT.ABSOLUTE}/request/${requestId}?tab=${tab}`,
        });
      }}
      items={tabItems}
      size="small"
    />
  );
};

export default memo(RequestTabs);
