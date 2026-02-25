import { useFeatureValue } from "@growthbook/growthbook-react";
import { Checkbox } from "antd";
import { Conditional } from "components/common/Conditional";
import FEATURES from "config/constants/sub/features";
import { sanitizeKeyValuePairs, supportsRequestBodyForAllMethods } from "features/apiClient/screens/apiClient/utils";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { RequestMethod, RQAPI } from "features/apiClient/types";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import { ApiClientRequestTabs } from "../../../components/request/components/ApiClientRequestTabs/ApiClientRequestTabs";
import { RequestTabLabel } from "../../../components/request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import AuthorizationView from "../../../components/request/components/AuthorizationView";
import { HeadersTable } from "../../../components/request/components/HeadersTable/HeadersTable";
import { QueryParamsTable } from "../../../components/request/components/QueryParamsTable/QueryParamsTable";
import RequestBody from "../../../components/request/RequestBody";
import { ScriptEditor } from "../../../components/Scripts/components/ScriptEditor/ScriptEditor";
import { PathVariableTable } from "../PathVariableTable";
import RequestBodyRedirectScreen from "../../../../clientView/components/RequestBodyRedirectScreen";

export enum RequestTab {
  QUERY_PARAMS = "query_params",
  BODY = "body",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

interface Props {
  error: RQAPI.ExecutionError | null;
  entity: BufferedHttpRecordEntity;
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
  const appMode = useSelector(getAppMode);

  const queryParams = useApiClientSelector((s) => entity.getQueryParams(s));
  const pathVariables = useApiClientSelector((s) => entity.getPathVariables(s));
  const method = useApiClientSelector((s) => entity.getMethod(s));
  const bodyLength = useApiClientSelector((s) => entity.getBody(s)?.length || 0);
  const headersLength = useApiClientSelector((s) => sanitizeKeyValuePairs(entity.getHeaders(s)).length);
  const auth = useApiClientSelector((s) => entity.getAuth(s));
  const isRootLevelRecord = useApiClientSelector((s) => !!entity.getCollectionId(s));

  const requestEntry = useApiClientSelector((s) => entity.getEntityFromState(s).data);

  const METHODS_WITHOUT_BODY = [RequestMethod.GET, RequestMethod.HEAD];
  const needsDesktopForBody = METHODS_WITHOUT_BODY.includes(method);
  const isRequestBodySupported = !needsDesktopForBody || supportsRequestBodyForAllMethods(appMode);
  const isNonBodyMethodInNonDesktop = needsDesktopForBody && !supportsRequestBodyForAllMethods(appMode);
  const hasScriptError = error?.type === RQAPI.ApiClientErrorType.SCRIPT;

  const items = useMemo(() => {
    return [
      {
        key: RequestTab.QUERY_PARAMS,
        label: <RequestTabLabel label="Params" count={queryParams.length || pathVariables?.length} showDot={true} />,
        children: (
          <div className="non-scrollable-tab-content">
            <QueryParamsTable entity={entity}>
              <PathVariableTable entity={entity} />
            </QueryParamsTable>
          </div>
        ),
      },
      {
        key: RequestTab.BODY,
        label: <RequestTabLabel label="Body" count={bodyLength ? 1 : 0} showDot={isRequestBodySupported} />,
        children: isNonBodyMethodInNonDesktop ? <RequestBodyRedirectScreen /> : <RequestBody entity={entity} />,
      },
      {
        key: RequestTab.HEADERS,
        label: <RequestTabLabel label="Headers" count={headersLength} />,
        children: <HeadersTable entity={entity} />,
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
              if (!scripts) {
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
    queryParams.length,
    pathVariables?.length,
    entity,
    bodyLength,
    isRequestBodySupported,
    isNonBodyMethodInNonDesktop,
    headersLength,
    auth,
    handleAuthChange,
    isRootLevelRecord,
    hasScriptError,
    requestEntry,
    scriptEditorVersion,
    focusPostResponseScriptEditor,
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
