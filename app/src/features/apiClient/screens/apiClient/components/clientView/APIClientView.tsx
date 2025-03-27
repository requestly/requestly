import { Select, Space } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import * as Sentry from "@sentry/react";
import { QueryParamSyncType, RQAPI, RequestContentType, RequestMethod } from "../../../../types";
import RequestTabs from "./components/request/components/RequestTabs/RequestTabs";
import {
  getContentTypeFromResponseHeaders,
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
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
import { BottomSheetLayout, useBottomSheetContext } from "componentsV2/BottomSheet";
import { BottomSheetPlacement, SheetLayout } from "componentsV2/BottomSheet/types";
import { ApiClientBottomSheet } from "./components/response/ApiClientBottomSheet/ApiClientBottomSheet";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useHasUnsavedChanges } from "hooks";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import { ApiClientExecutor } from "features/apiClient/helpers/apiClientExecutor/apiClientExecutor";
import CopyAsModal from "../modals/CopyAsModal/CopyAsModal";
import { RBACButton, RevertViewModeChangesAlert, RoleBasedComponent } from "features/rbac";
import { Conditional } from "components/common/Conditional";
import { IoMdCode } from "@react-icons/all-files/io/IoMdCode";

interface Props {
  openInModal?: boolean;
  apiEntry?: RQAPI.Entry;
  notifyApiRequestFinished?: (apiEntry: RQAPI.Entry) => void;
  apiEntryDetails?: RQAPI.ApiRecord;
}

const requestMethodOptions = Object.values(RequestMethod).map((method) => ({
  value: method,
  label: method,
}));

const APIClientView: React.FC<Props> = ({ apiEntry, apiEntryDetails, notifyApiRequestFinished, openInModal }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const user = useSelector(getUserAuthDetails);
  const [searchParams] = useSearchParams();
  const isCreateMode = searchParams.has("create");
  const { requestId } = useParams();

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
  const [entry, setEntry] = useState<RQAPI.Entry>(apiEntry);
  const [isFailed, setIsFailed] = useState(false);
  const [error, setError] = useState<RQAPI.ExecutionError>(null);
  const [warning, setWarning] = useState<RQAPI.ExecutionWarning>(null);
  const [isRequestSaving, setIsRequestSaving] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isRequestCancelled, setIsRequestCancelled] = useState(false);
  const [apiClientExecutor, setApiClientExecutor] = useState<ApiClientExecutor | null>(null);

  // const abortControllerRef = useRef<AbortController>(null);
  const { response, testResults = undefined, ...entryWithoutResponse } = entry;

  // Passing sanitized entry because response and empty key value pairs are saved in DB
  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(sanitizeEntry(entryWithoutResponse));
  const { updateTab, activeTab } = useTabsLayoutContext();

  const [copyAsModalOpen, setCopyAsModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const bottomSheetPlacement = window.innerWidth < 1440 ? BottomSheetPlacement.BOTTOM : BottomSheetPlacement.RIGHT;
      toggleSheetPlacement(bottomSheetPlacement);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [toggleSheetPlacement]);

  useEffect(() => {
    const tabId = isCreateMode ? requestId : apiEntryDetails?.id;

    updateTab(tabId, { hasUnsavedChanges: hasUnsavedChanges });
  }, [updateTab, isCreateMode, requestId, apiEntryDetails?.id, hasUnsavedChanges]);

  useEffect(() => {
    const tabId = apiEntryDetails?.id;

    if (activeTab?.id === tabId && hasUnsavedChanges) {
      updateTab(tabId, { isPreview: false });
    }
  }, [updateTab, activeTab?.id, requestId, apiEntryDetails?.id, hasUnsavedChanges]);

  useEffect(() => {
    if (apiEntry) {
      setRequestName("");
    }
  }, [apiEntry]);

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
    updateTab(apiEntryDetails?.id, { isPreview: false });

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
        trackRequestFailed(error.message);
        trackRQLastActivity(API_CLIENT.REQUEST_FAILED);
        trackRQDesktopLastActivity(API_CLIENT.REQUEST_FAILED);
      }

      notifyApiRequestFinished?.(executedEntry);
    } catch (e) {
      setIsFailed(true);
      setError({
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
    updateTab,
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

    console.log("kkkk", apiEntryDetails, record);

    const result = isCreateMode
      ? await apiClientRecordsRepository.createRecordWithId(record, requestId)
      : await apiClientRecordsRepository.updateRecord(record, record.id);

    if (result.success && result.data.type === RQAPI.RecordType.API) {
      onSaveRecord(
        { ...(apiEntryDetails ?? {}), ...result.data, data: { ...result.data.data, ...record.data } },
        isCreateMode ? "replace" : "open"
      );
      trackRequestRenamed("breadcrumb");
      setRequestName("");

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

    if (apiEntryDetails?.id) {
      record.id = apiEntryDetails?.id;
    }

    const result = isCreateMode
      ? await apiClientRecordsRepository.createRecordWithId(record, requestId)
      : await apiClientRecordsRepository.updateRecord(record, record.id);

    if (result.success && result.data.type === RQAPI.RecordType.API) {
      onSaveRecord(
        { ...(apiEntryDetails ?? {}), ...result.data, data: { ...result.data.data, ...record.data } },
        isCreateMode ? "replace" : "open"
      );
      setEntry({ ...result.data.data, response: entry.response, testResults: entry.testResults });
      resetChanges();
      trackRequestSaved({
        src: "api_client_view",
        has_scripts: Boolean(entry.scripts?.preRequest),
        auth_type: entry?.auth?.currentAuthType,
      });
      toast.success("Request saved!");
    } else {
      toast.error(result?.message || `Could not save Request.`);
    }

    setIsRequestSaving(false);
  }, [
    entry,
    apiEntryDetails,
    onSaveRecord,
    setEntry,
    resetChanges,
    isCreateMode,
    apiClientRecordsRepository,
    requestId,
  ]);

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
    setEntry(apiEntry);
  };

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
            {user.loggedIn && !openInModal ? (
              <RQBreadcrumb
                placeholder="New Request"
                recordName={apiEntryDetails?.name}
                onRecordNameUpdate={setRequestName}
                onBlur={handleRecordNameUpdate}
                // Auto focus breadcrumb input when a new record is created
                autoFocus={location.search.includes("new")}
              />
            ) : null}
            <RQButton
              type="transparent"
              icon={<IoMdCode />}
              size="small"
              className="api-client-view_get-code-btn"
              onClick={() => {
                apiClientExecutor.updateApiRecords(apiClientRecords);
                apiClientExecutor.updateEntryDetails({
                  entry: sanitizeEntry(entry),
                  recordId: apiEntryDetails?.id,
                  collectionId: apiEntryDetails?.collectionId,
                });
                setCopyAsModalOpen(true);
              }}
            >
              Get client code
            </RQButton>
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
              {/* <Input
              className="api-request-url"
              placeholder="https://example.com"
              value={entry.request.url}
              onChange={(evt) => setUrl(evt.target.value)}
              onPressEnter={onUrlInputEnterPressed}
              onBlur={onUrlInputBlur}
              prefix={<Favicon size="small" url={entry.request.url} debounceWait={500} style={{ marginRight: 2 }} />}
            /> */}
              <RQSingleLineEditor
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
            key={requestId}
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
            key={requestId}
            requestId={apiEntryDetails?.id}
            collectionId={apiEntryDetails?.collectionId}
            requestEntry={entry}
            setRequestEntry={setRequestEntry}
            setContentType={setContentType}
            handleAuthChange={handleAuthChange}
          />
        </div>
      </BottomSheetLayout>
      {copyAsModalOpen ? (
        <CopyAsModal
          apiRequest={apiClientExecutor.prepareRequest()}
          open={copyAsModalOpen}
          onClose={() => setCopyAsModalOpen(false)}
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
