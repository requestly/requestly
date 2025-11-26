import React, { useMemo } from "react";
import { RequestContentType, RQAPI } from "features/apiClient/types";
import { sanitizeKeyValuePairs, supportsRequestBody } from "features/apiClient/screens/apiClient/utils";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import { Conditional } from "components/common/Conditional";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { Checkbox } from "antd";
import { RequestTabLabel } from "../ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { QueryParamsTable } from "../QueryParamsTable/QueryParamsTable";
import RequestBody from "../../RequestBody";
import { HeadersTable } from "../HeadersTable/HeadersTable";
import AuthorizationView from "../AuthorizationView";
import { ScriptEditor } from "../../../Scripts/components/ScriptEditor/ScriptEditor";
import { ApiClientRequestTabs } from "../ApiClientRequestTabs/ApiClientRequestTabs";

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

  const isRequestBodySupported = supportsRequestBody(requestEntry.request.method);

  const queryParams = useQueryParamStore((state) => state.queryParams);

  const items = useMemo(() => {
    return [
      {
        key: RequestTab.QUERY_PARAMS,
        label: <RequestTabLabel label="Query Params" count={queryParams.length} />,
        children: (
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
        ),
      },
      {
        key: RequestTab.BODY,
        label: (
          <RequestTabLabel label="Body" count={requestEntry.request.body ? 1 : 0} showDot={isRequestBodySupported} />
        ),
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
        disabled: !isRequestBodySupported,
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
            entry={requestEntry}
            onScriptsChange={(newScripts) => {
              setRequestEntry((prev) => ({ ...prev, scripts: newScripts }));
            }}
          />
        ),
      },
    ];
  }, [
    requestEntry,
    queryParams.length,
    requestId,
    setRequestEntry,
    setContentType,
    handleAuthChange,
    collectionId,
    isRequestBodySupported,
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
