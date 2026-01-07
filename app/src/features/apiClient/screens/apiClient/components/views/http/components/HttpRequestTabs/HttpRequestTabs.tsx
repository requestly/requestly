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
import { Conditional } from "components/common/Conditional";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { Checkbox } from "antd";
import { RequestTabLabel } from "../../../components/request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { PathVariableTable } from "../PathVariableTable";
import { ScriptEditor } from "../../../components/Scripts/components/ScriptEditor/ScriptEditor";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";

export enum RequestTab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

interface Props {
  error: RQAPI.ExecutionError | null;
  entity: BufferedHttpRecordEntity,
  handleAuthChange: (newAuth: RQAPI.Auth) => void;
  focusPostResponseScriptEditor?: boolean;
  scriptEditorVersion?: number;
}

const HttpRequestTabs: React.FC<Props> = ({
  error,
  entity,
  handleAuthChange,
  focusPostResponseScriptEditor,
  scriptEditorVersion,
}) => {
  const showCredentialsCheckbox = useFeatureValue("api-client-include-credentials", false);

  const queryParams = useApiClientSelector(s => entity.getQueryParams(s));
  const pathVariables = useApiClientSelector(s => entity.getPathVariables(s));
  const method = useApiClientSelector(s => entity.getMethod(s));
  const bodyLength = useApiClientSelector(s => entity.getBody(s)?.length || 0);
  const headersLength = useApiClientSelector(s => sanitizeKeyValuePairs(entity.getHeaders(s)).length);
  const auth = useApiClientSelector(s => entity.getAuth(s));
  const isRootLevelRecord = useApiClientSelector(s => !!entity.getCollectionId(s));

  const requestEntry = useApiClientSelector(s => entity.getEntityFromState(s).data);

  const getContentTypeWithAlert = useCallback(
    (contentType: RequestContentType | undefined): RequestContentType => {
      if (contentType === undefined) {
        captureException(new Error("Request contentType is undefined"), {
          extra: {
            requestId: entity.meta.referenceId,
          },
        });
        return RequestContentType.RAW;
      }
      return contentType;
    },
    []
  );

  const isRequestBodySupported = supportsRequestBody(method);
  const hasScriptError = error?.type === RQAPI.ApiClientErrorType.SCRIPT;

  const items = useMemo(() => {
    return [
      {
        key: RequestTab.QUERY_PARAMS,
        label: <RequestTabLabel label="Params" count={queryParams.length || pathVariables?.length} showDot={true} />,
        children: (
          <>
            <div className="params-table-title">Query Params</div>
            <QueryParamsTable
              entity={entity}
            />
            <PathVariableTable
              entity={entity}
            />
          </>
        ),
      },
      {
        key: RequestTab.BODY,
        label: (
          <RequestTabLabel
            label="Body"
            count={bodyLength ? 1 : 0}
            showDot={isRequestBodySupported}
          />
        ),
        children: (
          <RequestBody
            entity={entity}
          />
        ),
        disabled: !isRequestBodySupported,
      },
      {
        key: RequestTab.HEADERS,
        label: <RequestTabLabel label="Headers" count={headersLength} />,
        children: (
          <HeadersTable
            entity={entity}
          />
        ),
      },
      {
        key: RequestTab.AUTHORIZATION,
        label: <RequestTabLabel label="Authorization" />,
        children: (
          <AuthorizationView
            recordId={entity.meta.referenceId}
            defaults={auth}
            onAuthUpdate={handleAuthChange}
            isRootLevelRecord={isRootLevelRecord}
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
            requestId={entity.meta.referenceId}
            entry={requestEntry}
            onScriptsChange={(scripts) => {
              if(!scripts) {
                return;
              }
              entity.setScripts(scripts);
            }}
            aiTestsExcutionCallback={(testResults) => entity.setTestResults(testResults)}
            focusPostResponse={focusPostResponseScriptEditor ?? false}
          />
        ),
      },
    ];
  }, [
    hasScriptError,
    handleAuthChange,
    isRequestBodySupported,
    queryParams.length,
    requestEntry,
    focusPostResponseScriptEditor,
    scriptEditorVersion,
    getContentTypeWithAlert,
  ]);

  return (
    <ApiClientRequestTabs
      requestId={entity.meta.referenceId}
      items={items}
      defaultActiveKey={RequestTab.QUERY_PARAMS}
      tabBarExtraContent={
        <Conditional
          condition={showCredentialsCheckbox && isFeatureCompatible(FEATURES.API_CLIENT_INCLUDE_CREDENTIALS)}
        >
          <Checkbox
            onChange={(e) => {
              entity.setIncludeCredentials(e.target.checked);
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
