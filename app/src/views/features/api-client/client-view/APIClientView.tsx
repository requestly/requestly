import { Button, Empty, Input, Select, Skeleton, Space, Spin } from "antd";
import React, { SyntheticEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Split from "react-split";
import { KeyValuePair, RQAPI, RequestContentType, RequestMethod } from "../types";
import RequestTabs from "./request/RequestTabs";
import { getEmptyPair } from "./request/KeyValueForm";
import ResponseTabs from "./response/ResponseTabs";
import { CloseCircleFilled } from "@ant-design/icons";
import {
  addUrlSchemeIfMissing,
  getContentTypeFromResponseHeaders,
  getEmptyAPIEntry,
  makeRequest,
  removeEmptyKeys,
  supportsRequestBody,
} from "../apiUtils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import {
  trackAPIRequestCancelled,
  trackAPIRequestSent,
  trackRequestFailed,
  trackResponseLoaded,
  trackInstallExtensionDialogShown,
} from "modules/analytics/events/features/apiClient";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { actions } from "store";
import { getAppMode, getIsExtensionEnabled } from "store/selectors";
import Favicon from "components/misc/Favicon";
import { CONTENT_TYPE_HEADER, DEMO_API_URL } from "../constants";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import "./apiClientView.scss";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { API_CLIENT } from "modules/analytics/events/features/constants";

interface Props {
  apiEntry?: RQAPI.Entry;
  notifyApiRequestFinished?: (apiEntry: RQAPI.Entry) => void;
}

const requestMethodOptions = Object.values(RequestMethod).map((method) => ({
  value: method,
  label: method,
}));

const APIClientView: React.FC<Props> = ({ apiEntry, notifyApiRequestFinished }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const [entry, setEntry] = useState<RQAPI.Entry>(getEmptyAPIEntry());
  const [isFailed, setIsFailed] = useState(false);
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

  const onUrlInputBlur = useCallback(() => {
    if (entry.request.url) {
      const urlWithUrlScheme = addUrlSchemeIfMissing(entry.request.url);
      if (urlWithUrlScheme !== entry.request.url) {
        setUrl(urlWithUrlScheme);
      }
    }
  }, [entry.request.url, setUrl]);

  const onSendButtonClick = useCallback(() => {
    if (!entry.request.url) {
      return;
    }

    if (!isExtensionInstalled()) {
      /* SHOW INSTALL EXTENSION MODAL */
      const modalProps = {
        heading: "Install Browser extension to use the API client",
        subHeading:
          "Quickly test your backend with by easily creating a request. Easy to customize the headers, body and query parameters and also analyze the response. Your requests are saved for you to reference later.",
        eventPage: "api_client",
      };
      dispatch(actions.toggleActiveModal({ modalName: "extensionModal", newProps: modalProps }));
      trackInstallExtensionDialogShown({ src: "api_client" });
      return;
    }

    const sanitizedEntry: RQAPI.Entry = {
      ...entry,
      request: {
        ...entry.request,
        queryParams: removeEmptyKeys(entry.request.queryParams),
        headers: removeEmptyKeys(entry.request.headers),
      },
      response: null,
    };

    if (!supportsRequestBody(entry.request.method)) {
      sanitizedEntry.request.body = null;
    } else if (entry.request.contentType === RequestContentType.FORM) {
      sanitizedEntry.request.body = removeEmptyKeys(sanitizedEntry.request.body as KeyValuePair[]);
    }

    abortControllerRef.current = new AbortController();

    setEntry(sanitizedEntry);
    setIsFailed(false);
    setIsLoadingResponse(true);
    setIsRequestCancelled(false);

    makeRequest(appMode, sanitizedEntry.request, abortControllerRef.current.signal)
      .then((response) => {
        const entryWithResponse = { ...sanitizedEntry, response };
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
        notifyApiRequestFinished?.(entryWithResponse);
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
      method: sanitizedEntry.request.method,
      queryParamsCount: sanitizedEntry.request.queryParams.length,
      headersCount: sanitizedEntry.request.headers.length,
      requestContentType: sanitizedEntry.request.contentType,
      isDemoURL: sanitizedEntry.request.url === DEMO_API_URL,
      path: location.pathname,
    });
    trackRQLastActivity(API_CLIENT.REQUEST_SENT);
    trackRQDesktopLastActivity(API_CLIENT.REQUEST_SENT);
  }, [entry, appMode, location.pathname, dispatch, notifyApiRequestFinished]);

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    trackAPIRequestCancelled();
  }, []);

  const onUrlInputEnterPressed = useCallback((evt: SyntheticEvent<HTMLInputElement>) => {
    (evt.target as HTMLInputElement).blur();
  }, []);

  return isExtensionEnabled ? (
    <div className="api-client-view">
      <Skeleton loading={isAnimating} active>
        <div className="api-client-header">
          <Space.Compact className="api-client-url-container">
            <Select
              className="api-request-method-selector"
              options={requestMethodOptions}
              value={entry.request.method}
              onChange={setMethod}
            />
            <Input
              className="api-request-url"
              placeholder="https://example.com"
              value={entry.request.url}
              onChange={(evt) => setUrl(evt.target.value)}
              onPressEnter={onUrlInputEnterPressed}
              onBlur={onUrlInputBlur}
              prefix={<Favicon size="small" url={entry.request.url} debounceWait={500} style={{ marginRight: 2 }} />}
            />
          </Space.Compact>
          <Button type="primary" onClick={onSendButtonClick} loading={isLoadingResponse} disabled={!entry.request.url}>
            Send
          </Button>
        </div>
        <Split
          className="api-client-body"
          direction="vertical"
          cursor="row-resize"
          sizes={[40, 60]}
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
                    <Button onClick={cancelRequest} style={{ marginTop: 10 }}>
                      Cancel request
                    </Button>
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
