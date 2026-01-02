import { RequestContentType, RQAPI } from "features/apiClient/types";
import { QueryParamsTable } from "../../../components/request/components/QueryParamsTable/QueryParamsTable";
import RequestBody from "../../../components/request/RequestBody";
import { captureException } from "@sentry/react";
import { HeadersTable } from "../../../components/request/components/HeadersTable/HeadersTable";
import AuthorizationView from "../../../components/request/components/AuthorizationView";
import React, { useCallback, useMemo } from "react";
import { ApiClientRequestTabs } from "../../../components/request/components/ApiClientRequestTabs/ApiClientRequestTabs";
import { sanitizeKeyValuePairs, supportsRequestBody } from "features/apiClient/screens/apiClient/utils";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useQueryParamStore } from "features/apiClient/hooks/useQueryParamStore";
import { Conditional } from "components/common/Conditional";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { Checkbox } from "antd";
import { RequestTabLabel } from "../../../components/request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { PathVariableTable } from "../PathVariableTable";
import { usePathVariablesStore } from "features/apiClient/hooks/usePathVariables.store";
import { ScriptEditor } from "../../../components/Scripts/components/ScriptEditor/ScriptEditor";

export enum RequestTab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

interface Props {
  error: RQAPI.ExecutionError | null;
  requestEntry: RQAPI.HttpApiEntry;
  requestId: RQAPI.ApiRecord["id"];
  collectionId: RQAPI.ApiRecord["collectionId"];
  setRequestEntry: (updater: (prev: RQAPI.HttpApiEntry) => RQAPI.HttpApiEntry) => void;
  handleAuthChange: (newAuth: RQAPI.Auth) => void;
  focusPostResponseScriptEditor?: boolean;
  scriptEditorVersion?: number;
  bulkEditConfigs?: {
    setIsBulkEditPanelOpen: (isOpen: boolean) => void;
    setBulkEditTableType: (type: "headers" | "queryParams") => void;
    showHeadersDescription: boolean;
    onShowHeadersDescriptionChange: (show: boolean) => void;
    showQueryParamsDescription: boolean;
    onShowQueryParamsDescriptionChange: (show: boolean) => void;
  };
}

const HttpRequestTabs: React.FC<Props> = ({
  error,
  requestEntry,
  requestId,
  collectionId,
  setRequestEntry,
  handleAuthChange,
  focusPostResponseScriptEditor,
  scriptEditorVersion,
  bulkEditConfigs,
}) => {
  const showCredentialsCheckbox = useFeatureValue("api-client-include-credentials", false);

  const getContentTypeWithAlert = useCallback(
    (contentType: RequestContentType | undefined): RequestContentType => {
      if (contentType === undefined) {
        captureException(new Error("Request contentType is undefined"), {
          extra: {
            requestId,
            requestEntry,
          },
        });
        return RequestContentType.RAW;
      }
      return contentType;
    },
    [requestEntry, requestId]
  );

  const isRequestBodySupported = supportsRequestBody(requestEntry.request.method);

  const pathVariables = usePathVariablesStore((state) => state.pathVariables);
  const queryParams = useQueryParamStore((state) => state.queryParams);

  const hasScriptError = error?.type === RQAPI.ApiClientErrorType.SCRIPT;

  const items = useMemo(() => {
    return [
      {
        key: RequestTab.QUERY_PARAMS,
        label: <RequestTabLabel label="Params" count={queryParams.length || pathVariables.length} showDot={true} />,
        children: (
          <div className="non-scrollable-tab-content">
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
          </div>
        ),
      },
      {
        key: RequestTab.BODY,
        label: (
          <RequestTabLabel
            label="Body"
            count={requestEntry.request.body?.length ? 1 : 0}
            showDot={isRequestBodySupported}
          />
        ),
        children: (
          <RequestBody
            recordId={requestId}
            body={requestEntry.request.body ?? ""}
            contentType={getContentTypeWithAlert(requestEntry.request.contentType)}
            setRequestEntry={setRequestEntry}
          />
        ),
        disabled: !isRequestBodySupported,
      },
      {
        key: RequestTab.HEADERS,
        label: <RequestTabLabel label="Headers" count={sanitizeKeyValuePairs(requestEntry.request.headers).length} />,
        children: (
          <div className="non-scrollable-tab-content">
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
          </div>
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
            dotIndicator={hasScriptError ? "error" : "success"}
            showDot={true}
            count={requestEntry.scripts?.postResponse?.length || requestEntry.scripts?.preRequest?.length}
          />
        ),
        children: (
          <ScriptEditor
            key={`${scriptEditorVersion}`}
            requestId={requestId}
            entry={requestEntry}
            onScriptsChange={(scripts) => setRequestEntry((prev) => ({ ...prev, scripts }))}
            aiTestsExcutionCallback={(testResults) => setRequestEntry((prev) => ({ ...prev, testResults }))}
            focusPostResponse={focusPostResponseScriptEditor ?? false}
          />
        ),
      },
    ];
  }, [
    hasScriptError,
    requestId,
    collectionId,
    handleAuthChange,
    isRequestBodySupported,
    queryParams.length,
    pathVariables.length,
    requestEntry,
    setRequestEntry,
    focusPostResponseScriptEditor,
    scriptEditorVersion,
    getContentTypeWithAlert,
  ]);

  return (
    <ApiClientRequestTabs
      requestId={requestId}
      items={items}
      defaultActiveKey={RequestTab.QUERY_PARAMS}
      onChange={() => {
        bulkEditConfigs?.setIsBulkEditPanelOpen?.(false);
      }}
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
