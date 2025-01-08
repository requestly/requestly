import { Select, Skeleton, Space } from "antd";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { upsertApiRecord } from "backend/apiClient";
import { toast } from "utils/Toast";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
import { BottomSheetLayout, useBottomSheetContext } from "componentsV2/BottomSheet";
import { SheetLayout } from "componentsV2/BottomSheet/types";
import { ApiClientBottomSheet } from "./components/response/ApiClientBottomSheet/ApiClientBottomSheet";
import { executeAPIRequest } from "features/apiClient/helpers/APIClientManager";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { getCollectionVariables } from "store/features/variables/selectors";
import { useLocation } from "react-router-dom";
import { useHasUnsavedChanges } from "hooks";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import { REQUEST_METHOD_COLORS } from "../../../../../../constants";

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
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const collectionVariables = useSelector(getCollectionVariables);

  const { toggleBottomSheet } = useBottomSheetContext();
  const { apiClientRecords, onSaveRecord } = useApiClientContext();
  const environmentManager = useEnvironmentManager();
  const { getVariablesWithPrecedence } = environmentManager;
  const currentEnvironmentVariables = useMemo(() => getVariablesWithPrecedence(apiEntryDetails?.collectionId), [
    apiEntryDetails?.collectionId,
    getVariablesWithPrecedence,
  ]);

  const [requestName, setRequestName] = useState(apiEntryDetails?.name || "");
  const [entry, setEntry] = useState<RQAPI.Entry>({ ...(apiEntry ?? getEmptyAPIEntry()) });
  const [isFailed, setIsFailed] = useState(false);
  const [error, setError] = useState<RQAPI.RequestErrorEntry["error"]>(null);
  const [isRequestSaving, setIsRequestSaving] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isRequestCancelled, setIsRequestCancelled] = useState(false);

  const abortControllerRef = useRef<AbortController>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationTimerRef = useRef<NodeJS.Timeout>();
  const { response, ...entryWithoutResponse } = entry;

  // Passing sanitized entry because response and empty key value pairs are saved in DB
  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(sanitizeEntry(entryWithoutResponse), isAnimating);
  const { updateTab } = useTabsLayoutContext();

  useEffect(() => {
    updateTab(apiEntryDetails?.id, { hasUnsavedChanges: hasUnsavedChanges });
  }, [updateTab, apiEntryDetails?.id, hasUnsavedChanges]);

  useEffect(() => {
    if (apiEntry) {
      setEntry({
        ...apiEntry,
        request: { ...apiEntry.request, ...syncQueryParams(apiEntry.request.queryParams, apiEntry.request.url) },
      });
      setRequestName("");
    }

    animationTimerRef.current = setTimeout(() => setIsAnimating(false), 800);

    return () => {
      clearTimeout(animationTimerRef.current);
    };
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

  const onSendButtonClick = useCallback(() => {
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

    const sanitizedEntry = sanitizeEntry(entry);
    sanitizedEntry.response = null;

    abortControllerRef.current = new AbortController();

    setIsFailed(false);
    setError(null);
    setIsLoadingResponse(true);
    setIsRequestCancelled(false);

    executeAPIRequest(
      appMode,
      apiClientRecords,
      sanitizedEntry,
      {
        id: apiEntryDetails?.id,
        collectionId: apiEntryDetails?.collectionId,
      },
      environmentManager,
      collectionVariables[apiEntryDetails?.collectionId]?.variables || {},
      abortControllerRef.current.signal
    )
      .then((executedEntry) => {
        const response = executedEntry.response;
        // TODO: Add an entry in history
        const entryWithResponse = { ...entry, response };
        const renderedEntryWithResponse = { ...executedEntry, response };

        if (response) {
          setEntry(entryWithResponse);
          trackResponseLoaded({
            type: getContentTypeFromResponseHeaders(response.headers),
            time: Math.round(response.time / 1000),
          });
          trackRQLastActivity(API_CLIENT.RESPONSE_LOADED);
          trackRQDesktopLastActivity(API_CLIENT.RESPONSE_LOADED);
        } else {
          const erroredEntry = entry as RQAPI.RequestErrorEntry;

          setIsFailed(true);
          setError(erroredEntry?.error ?? null);
          if (erroredEntry?.error) {
            Sentry.withScope((scope) => {
              scope.setTag("error_type", "api_request_failure");
              scope.setContext("request_details", {
                url: sanitizedEntry.request.url,
                method: sanitizedEntry.request.method,
                headers: sanitizedEntry.request.headers,
                queryParams: sanitizedEntry.request.queryParams,
              });
              scope.setFingerprint(["api_request_error", sanitizedEntry.request.method, erroredEntry.error.source]);
              Sentry.captureException(
                new Error(`API Request Failed: ${erroredEntry.error.message || "Unknown error"}`)
              );
            });
          }
          trackRequestFailed();
          trackRQLastActivity(API_CLIENT.REQUEST_FAILED);
          trackRQDesktopLastActivity(API_CLIENT.REQUEST_FAILED);
        }
        notifyApiRequestFinished?.(renderedEntryWithResponse);
      })
      .catch(() => {
        if (abortControllerRef.current?.signal.aborted) {
          setIsRequestCancelled(true);
        }
      })
      .finally(() => {
        abortControllerRef.current = null;
        setIsLoadingResponse(false);
      });

    trackRQLastActivity(API_CLIENT.REQUEST_SENT);
    trackRQDesktopLastActivity(API_CLIENT.REQUEST_SENT);
  }, [
    apiClientRecords,
    apiEntryDetails?.id,
    apiEntryDetails?.collectionId,
    appMode,
    dispatch,
    entry,
    environmentManager,
    notifyApiRequestFinished,
    toggleBottomSheet,
    collectionVariables,
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

    const result = await upsertApiRecord(uid, record, teamId);

    if (result.success && result.data.type === RQAPI.RecordType.API) {
      onSaveRecord({ ...(apiEntryDetails ?? {}), ...result.data, data: { ...result.data.data, ...record.data } });
      trackRequestRenamed("breadcrumb");
      setRequestName("");

      toast.success("Request name updated!");
    } else {
      toast.error("Something went wrong!");
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

    const result = await upsertApiRecord(uid, record, teamId);

    if (result.success && result.data.type === RQAPI.RecordType.API) {
      onSaveRecord({ ...(apiEntryDetails ?? {}), ...result.data, data: { ...result.data.data, ...record.data } });
      setEntry({ ...result.data.data, response: entry.response });
      resetChanges();
      trackRequestSaved("api_client_view");
      toast.success("Request saved!");
    } else {
      toast.error("Something went wrong!");
    }

    setIsRequestSaving(false);
  }, [entry, apiEntryDetails, onSaveRecord, setEntry, teamId, uid, resetChanges]);

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    trackAPIRequestCancelled();
  }, []);

  const handleAuthChange = useCallback((authOptions: RQAPI.AuthOptions) => {
    setEntry((prevEntry) => {
      const updatedEntry = { ...prevEntry };
      updatedEntry.auth = authOptions;
      return updatedEntry;
    });
  }, []);

  const onUrlInputEnterPressed = useCallback((evt: KeyboardEvent) => {
    (evt.target as HTMLInputElement).blur();
  }, []);

  return isExtensionEnabled ? (
    <div className="api-client-view">
      <div className="api-client-header-container">
        {user.loggedIn && !openInModal ? (
          <RQBreadcrumb
            loading={isAnimating}
            placeholder="New Request"
            recordName={apiEntryDetails?.name}
            onRecordNameUpdate={setRequestName}
            onBlur={handleRecordNameUpdate}
            // Auto focus breadcrumb input when a new record is created
            autoFocus={location.search.includes("new")}
          />
        ) : null}
      </div>
      <BottomSheetLayout
        layout={SheetLayout.SPLIT}
        bottomSheet={
          <ApiClientBottomSheet
            response={entry.response}
            isLoading={isLoadingResponse}
            isFailed={isFailed}
            isRequestCancelled={isRequestCancelled}
            onCancelRequest={cancelRequest}
            error={error}
          />
        }
        minSize={35}
      >
        <div className="api-client-body">
          <Skeleton loading={isAnimating} active>
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
              {user.loggedIn && !openInModal ? (
                <RQButton
                  showHotKeyText
                  hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST.hotKey}
                  onClick={onSaveButtonClick}
                  loading={isRequestSaving}
                >
                  Save
                </RQButton>
              ) : null}
            </div>
            <RequestTabs
              collectionId={apiEntryDetails?.collectionId}
              requestEntry={entry}
              setRequestEntry={setRequestEntry}
              setContentType={setContentType}
              handleAuthChange={handleAuthChange}
            />
          </Skeleton>
        </div>
      </BottomSheetLayout>
    </div>
  ) : (
    <div className="w-full">
      <ExtensionDeactivationMessage />
    </div>
  );
};

export default React.memo(APIClientView);
