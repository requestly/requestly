import { Empty, Select, Skeleton, Space, Spin } from "antd";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Split from "react-split";
import { KeyValuePair, RQAPI, RequestContentType, RequestMethod } from "../../../../types";
import RequestTabs from "./request/RequestTabs";
import { getEmptyPair } from "./request/KeyValueForm";
import ResponseTabs from "./response/ResponseTabs";
import { CloseCircleFilled } from "@ant-design/icons";
import {
  addUrlSchemeIfMissing,
  getContentTypeFromResponseHeaders,
  getEmptyAPIEntry,
  makeRequest,
  sanitizeKeyValuePairs,
  supportsRequestBody,
} from "../../utils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import {
  trackAPIRequestCancelled,
  trackAPIRequestSent,
  trackRequestFailed,
  trackResponseLoaded,
  trackInstallExtensionDialogShown,
  trackRequestSaved,
  trackRequestRenamed,
} from "modules/analytics/events/features/apiClient";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { actions } from "store";
import { getAppMode, getIsExtensionEnabled, getUserAuthDetails } from "store/selectors";
import { CONTENT_TYPE_HEADER, DEMO_API_URL } from "../../../../constants";
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
import PATHS from "config/constants/sub/paths";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
import { ResponseScriptParser } from "../../parseResponseScript";

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
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const { onSaveRecord } = useApiClientContext();
  const environmentManager = useEnvironmentManager();
  const { renderVariables, getCurrentEnvironmentVariables } = environmentManager;

  const currentEnvironmentVariables = getCurrentEnvironmentVariables();

  const [requestName, setRequestName] = useState(apiEntryDetails?.name || "");
  const [entry, setEntry] = useState<RQAPI.Entry>(getEmptyAPIEntry());
  const [isFailed, setIsFailed] = useState(false);
  const [isRequestSaving, setIsRequestSaving] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isRequestCancelled, setIsRequestCancelled] = useState(false);

  const abortControllerRef = useRef<AbortController>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (apiEntry) {
      clearTimeout(animationTimerRef.current);
      setIsAnimating(true);
      setEntry(apiEntry);
      setRequestName("");
      animationTimerRef.current = setTimeout(() => setIsAnimating(false), 500);
    }

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

  const setQueryParams = useCallback((queryParams: KeyValuePair[]) => {
    setEntry((entry) => ({
      ...entry,
      request: {
        ...entry.request,
        queryParams,
      },
    }));
  }, []);

  const setBody = useCallback((body: string) => {
    setEntry((entry) => ({
      ...entry,
      request: {
        ...entry.request,
        body,
      },
    }));
  }, []);

  const setRequestHeaders = useCallback((headers: KeyValuePair[]) => {
    setEntry((entry) => ({
      ...entry,
      request: {
        ...entry.request,
        headers,
      },
    }));
  }, []);

  const setContentType = useCallback((contentType: RequestContentType) => {
    setEntry((entry) => {
      const newEntry: RQAPI.Entry = {
        ...entry,
        request: {
          ...entry.request,
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

  const sanitizeEntry = (entry: RQAPI.Entry, removeDisabledKeys = true) => {
    const sanitizedEntry: RQAPI.Entry = {
      ...entry,
      request: {
        ...entry.request,
        queryParams: sanitizeKeyValuePairs(entry.request.queryParams, removeDisabledKeys),
        headers: sanitizeKeyValuePairs(entry.request.headers, removeDisabledKeys),
      },
    };

    if (!supportsRequestBody(entry.request.method)) {
      sanitizedEntry.request.body = null;
    } else if (entry.request.contentType === RequestContentType.FORM) {
      sanitizedEntry.request.body = sanitizeKeyValuePairs(
        sanitizedEntry.request.body as KeyValuePair[],
        removeDisabledKeys
      );
    }

    return sanitizedEntry;
  };

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
      // @ts-ignore
      dispatch(actions.toggleActiveModal({ modalName: "extensionModal", newProps: modalProps }));
      trackInstallExtensionDialogShown({ src: "api_client" });
      return;
    }

    const sanitizedEntry = sanitizeEntry(entry);
    sanitizedEntry.response = null;

    const renderedRequest = renderVariables<RQAPI.Request>(sanitizedEntry.request);
    renderedRequest.url = addUrlSchemeIfMissing(renderedRequest.url);

    const renderedEntry = { ...sanitizedEntry, request: renderedRequest };

    abortControllerRef.current = new AbortController();

    setIsFailed(false);
    setIsLoadingResponse(true);
    setIsRequestCancelled(false);

    makeRequest(appMode, renderedRequest, abortControllerRef.current.signal)
      .then((response) => {
        // TODO: Add an entry in history
        const entryWithResponse = { ...entry, response };
        const renderedEntryWithResponse = { ...renderedEntry, response };

        const script = `
          const a=window.localStorage.getItem('install_date');
          console.log("!!!debug item",a);
          console.log("!!!debug",rq.response);
          rq.environment.set("testKeyBoolean",true);
        `;

        const parser = new ResponseScriptParser(script, renderedEntryWithResponse.response.body, environmentManager);
        console.log("!!!debug", "before parsing", response.body);
        parser.parse();

        if (response) {
          setEntry(entryWithResponse);
          trackResponseLoaded({
            type: getContentTypeFromResponseHeaders(response.headers),
            time: Math.round(response.time / 1000),
          });
          trackRQLastActivity(API_CLIENT.RESPONSE_LOADED);
          trackRQDesktopLastActivity(API_CLIENT.RESPONSE_LOADED);
        } else {
          setIsFailed(true);
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

    trackAPIRequestSent({
      method: renderedEntry.request.method,
      queryParamsCount: renderedEntry.request.queryParams.length,
      headersCount: renderedEntry.request.headers.length,
      requestContentType: renderedEntry.request.contentType,
      isDemoURL: renderedEntry.request.url === DEMO_API_URL,
      path: location.pathname,
    });
    trackRQLastActivity(API_CLIENT.REQUEST_SENT);
    trackRQDesktopLastActivity(API_CLIENT.REQUEST_SENT);
  }, [entry, appMode, location.pathname, dispatch, notifyApiRequestFinished, renderVariables]);

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
      onSaveRecord({ ...result.data, data: { ...result.data.data, ...record.data } });
      trackRequestRenamed("breadcrumb");
      setRequestName("");

      toast.success("Request name updated!");
    } else {
      toast.error("Something went wrong!");
    }
  };

  const onSaveButtonClick = async () => {
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
      onSaveRecord({ ...result.data, data: { ...result.data.data, ...record.data } });

      trackRequestSaved("api_client_view");
      if (location.pathname.includes("history")) {
        navigate(`${PATHS.API_CLIENT.ABSOLUTE}/request/${result.data.id}`);
      }

      toast.success("Request saved!");
    } else {
      toast.error("Something went wrong!");
    }

    setIsRequestSaving(false);
  };

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    trackAPIRequestCancelled();
  }, []);

  const onUrlInputEnterPressed = useCallback((evt: KeyboardEvent) => {
    (evt.target as HTMLInputElement).blur();
  }, []);

  return isExtensionEnabled ? (
    <div className="api-client-view">
      {user.loggedIn && !openInModal ? (
        <RQBreadcrumb
          placeholder="New Request"
          recordName={apiEntryDetails?.name}
          onRecordNameUpdate={setRequestName}
          onBlur={handleRecordNameUpdate}
        />
      ) : null}

      <Skeleton loading={isAnimating} active>
        <div className="api-client-header">
          <Space.Compact className="api-client-url-container">
            <Select
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
              // value={entry.request.url}
              defaultValue={entry.request.url}
              onChange={(text) => setUrl(text)}
              onPressEnter={onUrlInputEnterPressed}
              variables={currentEnvironmentVariables}
              // prefix={<Favicon size="small" url={entry.request.url} debounceWait={500} style={{ marginRight: 2 }} />}
            />
          </Space.Compact>
          <RQButton
            type="primary"
            onClick={onSendButtonClick}
            loading={isLoadingResponse}
            disabled={!entry.request.url}
          >
            Send
          </RQButton>
          {user.loggedIn && !openInModal ? (
            <RQButton onClick={onSaveButtonClick} loading={isRequestSaving}>
              Save
            </RQButton>
          ) : null}
        </div>
        <Split
          className="api-client-body"
          direction="vertical"
          cursor="row-resize"
          sizes={entry.request.contentType === RequestContentType.JSON ? [60, 40] : [40, 60]}
          minSize={200}
          gutterSize={6}
          gutterAlign="center"
          snapOffset={30}
        >
          <RequestTabs
            request={entry.request}
            setQueryParams={setQueryParams}
            setBody={setBody}
            setRequestHeaders={setRequestHeaders}
            setContentType={setContentType}
          />
          <div className="api-response-view">
            {entry.response ? (
              <ResponseTabs response={entry.response} />
            ) : (
              <div className="api-response-empty-placeholder">
                {isLoadingResponse ? (
                  <>
                    <Spin size="large" tip="Request in progress..." />
                    <RQButton onClick={cancelRequest} style={{ marginTop: 10 }}>
                      Cancel request
                    </RQButton>
                  </>
                ) : isFailed ? (
                  <Space>
                    <CloseCircleFilled style={{ color: "#ff4d4f" }} />
                    Failed to send the request. Please check if the URL is valid.
                  </Space>
                ) : isRequestCancelled ? (
                  <Space>
                    <CloseCircleFilled style={{ color: "#ff4d4f" }} />
                    You have cancelled the request.
                  </Space>
                ) : (
                  <Empty description="No request sent." />
                )}
              </div>
            )}
          </div>
        </Split>
      </Skeleton>
    </div>
  ) : (
    <div className="w-full">
      <ExtensionDeactivationMessage />
    </div>
  );
};

export default memo(APIClientView);
