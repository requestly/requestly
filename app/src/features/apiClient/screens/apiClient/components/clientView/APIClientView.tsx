import { Select, Space } from "antd";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import * as Sentry from "@sentry/react";
import { QueryParamSyncType, RQAPI, RequestContentType, RequestMethod } from "../../../../types";
import RequestTabs from "./components/request/components/RequestTabs/RequestTabs";
import {
  getContentTypeFromResponseHeaders,
  getEmptyAPIEntry,
  getEmptyPair,
  sanitizeEntry,
  supportsRequestBody,
  syncQueryParams,
} from "../../utils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import {
  trackAPIRequestCancelled,
  trackRequestFailed,
  trackResponseLoaded,
  trackInstallExtensionDialogShown,
  trackRequestSaved,
  trackRequestRenamed,
  trackApiRequestDone,
} from "modules/analytics/events/features/apiClient";
import { useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getAppMode, getIsExtensionEnabled } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { CONTENT_TYPE_HEADER } from "../../../../constants";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import "./apiClientView.scss";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";
import { isDesktopMode } from "utils/AppUtils";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import { toast } from "utils/Toast";
import { useApiClientContext } from "features/apiClient/contexts";
import { BottomSheetLayout, useBottomSheetContext } from "componentsV2/BottomSheet";
import { BottomSheetPlacement, SheetLayout } from "componentsV2/BottomSheet/types";
import { ApiClientBottomSheet } from "./components/response/ApiClientBottomSheet/ApiClientBottomSheet";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { useLocation } from "react-router-dom";
import { useHasUnsavedChanges } from "hooks";
import { ApiClientExecutor } from "features/apiClient/helpers/apiClientExecutor/apiClientExecutor";
import { ApiClientSnippetModal } from "../modals/ApiClientSnippetModal/ApiClientSnippetModal";
import { RBACButton, RevertViewModeChangesAlert, RoleBasedComponent } from "features/rbac";
import { Conditional } from "components/common/Conditional";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import { useGenericState } from "hooks/useGenericState";
import PATHS from "config/constants/sub/paths";

const requestMethodOptions = Object.values(RequestMethod).map((method) => ({
  value: method,
  label: method,
}));

type BaseProps = {
  openInModal?: boolean;
  onSaveCallback?: (apiEntryDetails: RQAPI.ApiRecord) => void;
  notifyApiRequestFinished?: (apiEntry: RQAPI.Entry) => void;
};

type CreateModeProps = BaseProps & {
  isCreateMode: true;
  apiEntryDetails:
    | null
    | ({
        data: RQAPI.Entry; // If you want to prefill the details then only data can be passed in create mode
      } & Partial<RQAPI.ApiRecord>);
};

type EditModeProps = BaseProps & {
  isCreateMode: false;
  apiEntryDetails: RQAPI.ApiRecord;
};

type HistoryModeProps = BaseProps & {
  isCreateMode: false;
  apiEntryDetails: RQAPI.ApiRecord;
};

type Props = CreateModeProps | EditModeProps | HistoryModeProps;

const APIClientView: React.FC<Props> = ({
  isCreateMode,
  openInModal = false,
  onSaveCallback,
  notifyApiRequestFinished,
  apiEntryDetails,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const user = useSelector(getUserAuthDetails);
  const isHistoryPath = location.pathname.includes("history");

  const { toggleBottomSheet, toggleSheetPlacement } = useBottomSheetContext();
  const {
    apiClientRecords,
    onSaveRecord,
    apiClientWorkloadManager,
    apiClientRecordsRepository,
  } = useApiClientContext();
  const environmentManager = useEnvironmentManager();
  const {
    getVariablesWithPrecedence,
    setVariables,
    setCollectionVariables,
    getCurrentEnvironment,
    getGlobalVariables,
    getCollectionVariables,
    getCurrentEnvironmentVariables,
    renderVariables,
    environmentSyncRepository,
  } = environmentManager;
  const currentEnvironmentVariables = useMemo(() => getVariablesWithPrecedence(apiEntryDetails?.collectionId), [
    apiEntryDetails?.collectionId,
    getVariablesWithPrecedence,
  ]);

  const [requestName, setRequestName] = useState(apiEntryDetails?.name || "");
  const [entry, setEntry] = useState<RQAPI.Entry>(apiEntryDetails?.data ?? getEmptyAPIEntry());
  const [isFailed, setIsFailed] = useState(false);
  const [error, setError] = useState<RQAPI.ExecutionError>(null);
  const [warning, setWarning] = useState<RQAPI.ExecutionWarning>(null);
  const [isRequestSaving, setIsRequestSaving] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isRequestCancelled, setIsRequestCancelled] = useState(false);
  const [apiClientExecutor, setApiClientExecutor] = useState<ApiClientExecutor | null>(null);

  const { setPreview, setUnsaved, setTitle, getIsActive } = useGenericState();

  const { response, testResults = undefined, ...entryWithoutResponse } = entry;

  // Passing sanitized entry because response and empty key value pairs are saved in DB
  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(sanitizeEntry(entryWithoutResponse));

  const [isSnippetModalVisible, setIsSnippetModalVisible] = useState(false);

  useEffect(() => {
    setEntry(apiEntryDetails?.data ?? getEmptyAPIEntry());
  }, [apiEntryDetails?.data]);

  useLayoutEffect(() => {
    const handleResize = () => {
      const bottomSheetPlacement = window.innerWidth < 1440 ? BottomSheetPlacement.BOTTOM : BottomSheetPlacement.RIGHT;
      toggleSheetPlacement(bottomSheetPlacement);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [toggleSheetPlacement]);

  useLayoutEffect(() => {
    setUnsaved(hasUnsavedChanges);
  }, [setUnsaved, hasUnsavedChanges]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      setPreview(false);
    }
  }, [setPreview, hasUnsavedChanges]);

  useEffect(() => {
    if (entry) {
      setRequestName("");
    }
  }, [entry]);

  const setUrl = useCallback((url: string) => {
    setEntry((entry) => ({
      ...entry,
      request: {
        ...entry.request,
        url,
        ...syncQueryParams(entry.request.queryParams, url, QueryParamSyncType.TABLE),
      },
    }));
  }, []);

  const setMethod = useCallback((method: RequestMethod) => {
    setEntry((entry) => {
      const newEntry: RQAPI.Entry = {
        ...entry,
        request: {
          ...entry.request,
          method,
        },
      };

      if (!supportsRequestBody(method)) {
        newEntry.request.body = null;
        newEntry.request.headers = newEntry.request.headers.filter((header) => header.key !== CONTENT_TYPE_HEADER);
        newEntry.request.contentType = RequestContentType.RAW;
      }
      return newEntry;
    });
  }, []);

  const setRequestEntry = useCallback((updater: (prev: RQAPI.Entry) => RQAPI.Entry) => {
    setEntry((prev) => updater(prev));
  }, []);

  const setContentType = useCallback((contentType: RequestContentType) => {
    setEntry((entry) => {
      const newEntry: RQAPI.Entry = {
        ...entry,
        request: {
          ...entry.request,
          body: contentType === RequestContentType.FORM ? [] : "",
          contentType,
        },
      };

      const headers = newEntry.request.headers.filter((header) => header.key !== CONTENT_TYPE_HEADER);

      let contentTypeHeader = headers.find((header) => !header.key && !header.value); // reuse empty header
      if (!contentTypeHeader) {
        contentTypeHeader = getEmptyPair();
        headers.push(contentTypeHeader);
      }

      contentTypeHeader.key = CONTENT_TYPE_HEADER;
      contentTypeHeader.value = contentType;
      newEntry.request.headers = headers;

      if (contentType === RequestContentType.JSON) {
        newEntry.request.body = "{}";
      } else if (contentType === RequestContentType.FORM) {
        newEntry.request.body = [];
      } else {
        newEntry.request.body = "";
      }

      return newEntry;
    });
  }, []);

  const handleUpdatesFromExecutionWorker = useCallback(
    async (state: any) => {
      for (const key in state) {
        if (key === "environment") {
          const currentEnvironment = getCurrentEnvironment() as {
            currentEnvironmentName?: string;
            currentEnvironmentId?: string;
          };
          if (currentEnvironment.currentEnvironmentId) {
            await setVariables(currentEnvironment.currentEnvironmentId, state[key]);
          }
        }
        if (key === "global") {
          const globalEnvId = environmentSyncRepository.getGlobalEnvironmentId();
          await setVariables(globalEnvId, state[key]);
        }
        if (key === "collectionVariables") {
          await setCollectionVariables(state[key], apiEntryDetails?.collectionId);
        }
      }
    },
    [
      getCurrentEnvironment,
      setVariables,
      setCollectionVariables,
      apiEntryDetails?.collectionId,
      environmentSyncRepository,
    ]
  );

  const onSendButtonClick = useCallback(async () => {
    // updateTab(apiEntryDetails?.id, { isPreview: false });

    if (!entry.request.url) {
      return;
    }
    if (!isExtensionInstalled() && !isDesktopMode()) {
      /* SHOW INSTALL EXTENSION MODAL */
      const modalProps = {
        heading: "Install browser Extension to use the API Client",
        subHeading:
          "A minimalistic API Client for front-end developers to test their APIs and fast-track their web development lifecycle. Add custom Headers and Query Params to test your APIs.",
        eventPage: "api_client",
      };
      dispatch(globalActions.toggleActiveModal({ modalName: "extensionModal", newProps: modalProps }));
      trackInstallExtensionDialogShown({ src: "api_client" });
      return;
    }

    toggleBottomSheet(true);

    setIsFailed(false);
    setError(null);
    setWarning(null);
    setIsLoadingResponse(true);
    setIsRequestCancelled(false);
    //Need to change the response and error to null
    setEntry((entry) => ({
      ...entry,
      response: null,
      error: null,
    }));

    apiClientExecutor.updateApiRecords(apiClientRecords);
    apiClientExecutor.updateEntryDetails({
      entry: sanitizeEntry(entry),
      recordId: apiEntryDetails?.id,
      collectionId: apiEntryDetails?.collectionId,
    });

    try {
      const apiClientExecutionResult = await apiClientExecutor.execute();

      const { executedEntry } = apiClientExecutionResult;
      const entryWithResponse: RQAPI.Entry = {
        ...entry,
        response: executedEntry.response,
        testResults: executedEntry.testResults,
      };
      setEntry(entryWithResponse);

      if (apiClientExecutionResult.status === "success") {
        if (apiClientExecutionResult.warning) {
          setWarning(apiClientExecutionResult.warning);
        }
        trackResponseLoaded({
          type: getContentTypeFromResponseHeaders(executedEntry.response.headers),
          time: Math.round(executedEntry.response.time / 1000),
        });
        trackApiRequestDone({
          url: executedEntry.request.url,
          method: executedEntry.request.method,
          status: executedEntry.response.status,
        });
        trackRQLastActivity(API_CLIENT.RESPONSE_LOADED);
        trackRQDesktopLastActivity(API_CLIENT.RESPONSE_LOADED);
      } else if (apiClientExecutionResult.status === "error") {
        const { error } = apiClientExecutionResult;
        setIsFailed(true);
        setError(error ?? null);
        if (error) {
          Sentry.withScope((scope) => {
            scope.setTag("error_type", "api_request_failure");
            scope.setContext("request_details", {
              url: entryWithResponse.request.url,
              method: entryWithResponse.request.method,
              headers: entryWithResponse.request.headers,
              queryParams: entryWithResponse.request.queryParams,
            });
            scope.setFingerprint(["api_request_error", entryWithResponse.request.method, error.source]);
            Sentry.captureException(new Error(`API Request Failed: ${error.message || "Unknown error"}`));
          });
        }
        trackRequestFailed(
          error.message,
          error.type,
          entryWithResponse.request.url,
          entryWithResponse.request.method,
          entryWithResponse.response?.status
        );
        trackRQLastActivity(API_CLIENT.REQUEST_FAILED);
        trackRQDesktopLastActivity(API_CLIENT.REQUEST_FAILED);
      }

      notifyApiRequestFinished?.(executedEntry);
    } catch (e) {
      setIsFailed(true);
      setError({
        type: e.type,
        source: "request",
        name: e.name,
        message: e.message,
      });
    } finally {
      setIsLoadingResponse(false);
    }
    trackRQLastActivity(API_CLIENT.REQUEST_SENT);
    trackRQDesktopLastActivity(API_CLIENT.REQUEST_SENT);
  }, [
    apiEntryDetails?.id,
    apiEntryDetails?.collectionId,
    entry,
    toggleBottomSheet,
    apiClientExecutor,
    apiClientRecords,
    dispatch,
    notifyApiRequestFinished,
  ]);

  const handleRecordNameUpdate = async () => {
    if (!requestName || requestName === apiEntryDetails?.name) {
      return;
    }

    const record: Partial<RQAPI.ApiRecord> = {
      type: RQAPI.RecordType.API,
      data: { ...entry },
    };

    if (apiEntryDetails?.id) {
      record.id = apiEntryDetails?.id;
      record.name = requestName;
    }

    if (isCreateMode) {
      record.name = requestName;
    }

    const result = isCreateMode
      ? await apiClientRecordsRepository.createRecordWithId(record, apiEntryDetails?.id)
      : await apiClientRecordsRepository.updateRecord(record, record.id);

    if (result.success && result.data.type === RQAPI.RecordType.API) {
      setTitle(requestName);
      const savedRecord = { ...(apiEntryDetails ?? {}), ...result.data, data: { ...result.data.data, ...record.data } };
      onSaveRecord(savedRecord);
      trackRequestRenamed("breadcrumb");
      setRequestName("");
      onSaveCallback(savedRecord);

      toast.success("Request name updated!");
    } else {
      toast.error(result?.message || `Could not rename Request.`);
    }
  };

  const onSaveButtonClick = useCallback(async () => {
    setIsRequestSaving(true);

    const record: Partial<RQAPI.ApiRecord> = {
      type: RQAPI.RecordType.API,
      data: { ...sanitizeEntry(entry, false) },
    };

    if (isCreateMode) {
      const requestId = apiClientRecordsRepository.generateApiRecordId();
      record.id = requestId;
    }

    //  Is this check necessary?
    if (apiEntryDetails?.id) {
      record.id = apiEntryDetails?.id;
    }

    const result = isCreateMode
      ? await apiClientRecordsRepository.createRecordWithId(record, record.id)
      : await apiClientRecordsRepository.updateRecord(record, record.id);

    if (result.success && result.data.type === RQAPI.RecordType.API) {
      onSaveRecord({ ...(apiEntryDetails ?? {}), ...result.data, data: { ...result.data.data, ...record.data } });

      setEntry({ ...result.data.data, response: entry.response, testResults: entry.testResults });
      resetChanges();
      trackRequestSaved({
        src: "api_client_view",
        has_scripts: Boolean(entry.scripts?.preRequest),
        auth_type: entry?.auth?.currentAuthType,
      });
      if (isCreateMode) {
        onSaveCallback(result.data);
      }
      toast.success("Request saved!");
    } else {
      toast.error(result?.message || `Could not save Request.`);
    }

    setIsRequestSaving(false);
  }, [apiClientRecordsRepository, apiEntryDetails, entry, isCreateMode, onSaveCallback, onSaveRecord, resetChanges]);

  const cancelRequest = useCallback(() => {
    apiClientExecutor.abort();
    trackAPIRequestCancelled();
    setIsRequestCancelled(true);
  }, [apiClientExecutor]);

  const handleAuthChange = useCallback((newAuth: RQAPI.Auth) => {
    setEntry((prevEntry) => {
      const updatedEntry = { ...prevEntry };
      updatedEntry.auth = newAuth;
      return updatedEntry;
    });
  }, []);

  const onUrlInputEnterPressed = useCallback((evt: KeyboardEvent) => {
    (evt.target as HTMLInputElement).blur();
  }, []);

  const handleTestResultRefresh = useCallback(async () => {
    try {
      apiClientExecutor.updateEntryDetails({
        entry: sanitizeEntry(entry),
        recordId: apiEntryDetails?.id,
        collectionId: apiEntryDetails?.collectionId,
      });

      const result = await apiClientExecutor.rerun();
      if (result.status === RQAPI.ExecutionStatus.SUCCESS) {
        setEntry((entry) => ({
          ...entry,
          testResults: result.artifacts.testResults,
        }));
      } else {
        setError(result.error);
      }
    } catch (error) {
      toast.error("Something went wrong while refreshing test results");
    }
  }, [apiClientExecutor, apiEntryDetails?.id, apiEntryDetails?.collectionId, entry]);

  useEffect(() => {
    if (!apiClientExecutor) {
      setApiClientExecutor(new ApiClientExecutor(appMode, apiClientWorkloadManager));
    }
  }, [apiClientRecords, apiClientWorkloadManager, appMode, apiClientExecutor]);

  useEffect(() => {
    if (apiClientExecutor) {
      apiClientExecutor.updateInternalFunctions({
        getCollectionVariables,
        getEnvironmentVariables: getCurrentEnvironmentVariables,
        getGlobalVariables,
        postScriptExecutionCallback: handleUpdatesFromExecutionWorker,
        renderVariables,
      });
    }
  }, [
    getCurrentEnvironmentVariables,
    getCollectionVariables,
    getGlobalVariables,
    handleUpdatesFromExecutionWorker,
    renderVariables,
    apiClientExecutor,
  ]);

  const handleRevertChanges = () => {
    setEntry(apiEntryDetails?.data);
  };

  const enableHotkey = getIsActive();

  return isExtensionEnabled ? (
    <div className="api-client-view">
      <div className="api-client-header-container">
        <RoleBasedComponent
          permission="create"
          resource="api_client_request"
          fallback={
            <Conditional condition={user.loggedIn && !openInModal && hasUnsavedChanges}>
              <RevertViewModeChangesAlert
                title="As a viewer, You can modify and test APIs, but cannot save updates."
                callback={handleRevertChanges}
              />
            </Conditional>
          }
        />
        <div className="api-client-header-container__header">
          <div className="api-client-breadcrumb-container">
            <Conditional condition={user.loggedIn && !openInModal}>
              <RQBreadcrumb
                placeholder="Untitled request"
                recordName={apiEntryDetails?.name}
                onRecordNameUpdate={setRequestName}
                onBlur={handleRecordNameUpdate}
                autoFocus={location.pathname.includes("new")}
                defaultBreadcrumbs={[
                  { label: "API Client", pathname: PATHS.API_CLIENT.INDEX },
                  {
                    isEditable: !isHistoryPath,
                    pathname: window.location.pathname,
                    label: isHistoryPath ? "History" : apiEntryDetails?.name || "Untitled request",
                  },
                ]}
              />
            </Conditional>
          </div>

          <div className="api-client-header">
            <Space.Compact className="api-client-url-container">
              <Select
                popupClassName="api-request-method-selector"
                className="api-request-method-selector"
                options={requestMethodOptions}
                value={entry.request.method}
                onChange={setMethod}
              />
              <SingleLineEditor
                className="api-request-url"
                placeholder="https://example.com"
                //value={entry.request.url}
                defaultValue={entry.request.url}
                onChange={(text) => {
                  setUrl(text);
                }}
                onPressEnter={onUrlInputEnterPressed}
                variables={currentEnvironmentVariables}
                // prefix={<Favicon size="small" url={entry.request.url} debounceWait={500} style={{ marginRight: 2 }} />}
              />
            </Space.Compact>
            <RQButton
              showHotKeyText
              onClick={onSendButtonClick}
              hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SEND_REQUEST.hotKey}
              type="primary"
              className="text-bold"
              disabled={!entry.request.url}
            >
              Send
            </RQButton>

            <Conditional condition={user.loggedIn && !openInModal}>
              <RBACButton
                permission="create"
                resource="api_client_request"
                showHotKeyText
                hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST.hotKey}
                onClick={onSaveButtonClick}
                loading={isRequestSaving}
                tooltipTitle="Saving is not allowed in view-only mode. You can update and view changes but cannot save them."
                enableHotKey={enableHotkey}
              >
                Save
              </RBACButton>
            </Conditional>
          </div>
        </div>
      </div>
      <BottomSheetLayout
        layout={SheetLayout.SPLIT}
        bottomSheet={
          <ApiClientBottomSheet
            key={apiEntryDetails?.id}
            response={entry.response}
            testResults={testResults}
            isLoading={isLoadingResponse}
            isFailed={isFailed}
            isRequestCancelled={isRequestCancelled}
            onCancelRequest={cancelRequest}
            handleTestResultRefresh={handleTestResultRefresh}
            error={error}
            warning={warning}
            executeRequest={onSendButtonClick}
          />
        }
        minSize={35}
        initialSizes={[60, 40]}
      >
        <div className="api-client-body">
          <RequestTabs
            key={apiEntryDetails?.id}
            requestId={apiEntryDetails?.id}
            collectionId={apiEntryDetails?.collectionId}
            requestEntry={entry}
            setRequestEntry={setRequestEntry}
            setContentType={setContentType}
            handleAuthChange={handleAuthChange}
          />
        </div>
      </BottomSheetLayout>
      {isSnippetModalVisible ? (
        <ApiClientSnippetModal
          apiRequest={apiClientExecutor.prepareRequest()}
          open={isSnippetModalVisible}
          onClose={() => setIsSnippetModalVisible(false)}
        />
      ) : null}
    </div>
  ) : (
    <div className="w-full">
      <ExtensionDeactivationMessage />
    </div>
  );
};

export default React.memo(APIClientView);
