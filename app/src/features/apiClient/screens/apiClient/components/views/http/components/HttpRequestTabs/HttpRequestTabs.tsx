import { RequestContentType, RQAPI } from "features/apiClient/types";
import { QueryParamsTable } from "../../../components/request/components/QueryParamsTable/QueryParamsTable";
import RequestBody from "../../../components/request/RequestBody";
import { HeadersTable } from "../../../components/request/components/HeadersTable/HeadersTable";
import AuthorizationView from "../../../components/request/components/AuthorizationView";
import { ScriptEditor } from "../../../components/Scripts/components/ScriptEditor/ScriptEditor";
import React, { useMemo } from "react";
import { ApiClientRequestTabs } from "../../../components/request/components/ApiClientRequestTabs/ApiClientRequestTabs";
import { sanitizeKeyValuePairs } from "features/apiClient/screens/apiClient/utils";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import { Conditional } from "components/common/Conditional";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { Checkbox } from "antd";
import { RequestTabLabel } from "../../../components/request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { PathVariableTable } from "../PathVariableTable";
import { usePathVariablesStore } from "features/apiClient/hooks/usePathVariables.store";

export enum RequestTab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

interface Props {
  requestEntry: RQAPI.HttpApiEntry;
  requestId: RQAPI.ApiRecord["id"];
  collectionId: string;
  setRequestEntry: (updater: (prev: RQAPI.HttpApiEntry) => RQAPI.HttpApiEntry) => void;
  setContentType: (contentType: RequestContentType) => void;
  handleAuthChange: (newAuth: RQAPI.Auth) => void;
}

const HttpRequestTabs: React.FC<Props> = ({
  requestEntry,
  requestId,
  collectionId,
  setRequestEntry,
  setContentType,
  handleAuthChange,
}) => {
  const showCredentialsCheckbox = useFeatureValue("api-client-include-credentials", false);

  const queryParams = useQueryParamStore((state) => state.queryParams);
  const pathVariables = usePathVariablesStore((state) => state.pathVariables);

  const items = useMemo(() => {
    return [
      {
        key: RequestTab.QUERY_PARAMS,
        label: <RequestTabLabel label="Params" count={queryParams.length || pathVariables.length} showDot={true} />,
        children: (
          <>
            <div className="params-table-title">Query Params</div>
            <QueryParamsTable
              recordId={requestId}
              onQueryParamsChange={(newParams) => {
                setRequestEntry((prev) => ({
                  ...prev,
                  request: {
                    ...prev.request,
                    queryParams: newParams,
                  },
                }));
              }}
            />
            <PathVariableTable
              recordId={requestId}
              onChange={(newVariables) => {
                setRequestEntry((prev) => ({
                  ...prev,
                  request: { ...prev.request, pathVariables: newVariables },
                }));
              }}
            />
          </>
        ),
      },
      {
        key: RequestTab.BODY,
        label: <RequestTabLabel label="Body" count={requestEntry.request.body ? 1 : 0} showDot />,
        children: requestEntry.request.bodyContainer ? (
          <RequestBody
            mode="multiple"
            recordId={requestId}
            bodyContainer={requestEntry.request.bodyContainer}
            contentType={requestEntry.request.contentType}
            setRequestEntry={setRequestEntry}
            setContentType={setContentType}
          />
        ) : (
          <RequestBody
            mode="single"
            recordId={requestId}
            body={requestEntry.request.body}
            contentType={requestEntry.request.contentType}
            setRequestEntry={setRequestEntry}
            setContentType={setContentType}
          />
        ),
      },
      {
        key: RequestTab.HEADERS,
        label: <RequestTabLabel label="Headers" count={sanitizeKeyValuePairs(requestEntry.request.headers).length} />,
        children: (
          <HeadersTable
            recordId={requestId}
            headers={requestEntry.request.headers}
            onHeadersChange={(newHeaders) => {
              setRequestEntry((prev) => ({
                ...prev,
                request: { ...prev.request, headers: newHeaders },
              }));
            }}
          />
        ),
      },
      {
        key: RequestTab.AUTHORIZATION,
        label: <RequestTabLabel label="Authorization" />,
        children: (
          <AuthorizationView
            recordId={requestId}
            defaults={requestEntry.auth}
            onAuthUpdate={handleAuthChange}
            isRootLevelRecord={!collectionId}
          />
        ),
      },
      {
        key: RequestTab.SCRIPTS,
        label: (
          <RequestTabLabel
            label="Scripts"
            showDot={true}
            count={requestEntry.scripts?.postResponse?.length || requestEntry.scripts?.preRequest?.length}
          />
        ),
        children: (
          <ScriptEditor
            scripts={requestEntry.scripts}
            onScriptsChange={(newScripts) => {
              setRequestEntry((prev) => ({ ...prev, scripts: newScripts }));
            }}
          />
        ),
      },
    ];
  }, [
    requestId,
    collectionId,
    handleAuthChange,
    queryParams.length,
    requestEntry.auth,
    requestEntry.request.body,
    requestEntry.request.bodyContainer,
    requestEntry.request.contentType,
    requestEntry.request.headers,
    requestEntry.scripts,
    setContentType,
    setRequestEntry,
    pathVariables.length,
  ]);

  return (
    <ApiClientRequestTabs
      requestId={requestId}
      items={items}
      defaultActiveKey={RequestTab.QUERY_PARAMS}
      tabBarExtraContent={
        <Conditional
          condition={showCredentialsCheckbox && isFeatureCompatible(FEATURES.API_CLIENT_INCLUDE_CREDENTIALS)}
        >
          <Checkbox
            onChange={(e) => {
              setRequestEntry((prev) => ({
                ...prev,
                request: {
                  ...prev.request,
                  includeCredentials: e.target.checked,
                },
              }));
            }}
            checked={requestEntry.request.includeCredentials}
          >
            <span className="credentials-checkbox-label">Include credentials</span>
          </Checkbox>
        </Conditional>
      }
    />
  );
};

export default React.memo(HttpRequestTabs);
