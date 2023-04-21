import { Button, Empty, Input, Select, Space, Spin } from "antd";
import React, { useCallback, useState } from "react";
import Split from "react-split";
import { RQAPI, RequestMethod } from "./types";
import RequestTabs from "./request/RequestTabs";
import ResponseTabs from "./response/ResponseTabs";
import { CloseCircleFilled } from "@ant-design/icons";
import { makeRequest } from "./apiUtils";

interface Props {}

const requestMethodOptions = Object.values(RequestMethod).map((method) => ({
  value: method,
  label: method,
}));

const getEmptyAPIEntry = (): RQAPI.Entry => {
  return {
    request: {
      url: "",
      queryParams: [],
      method: RequestMethod.GET,
      headers: [],
      body: "",
    },
    response: null,
  };
};

const APIClientView: React.FC<Props> = () => {
  const [entry, setEntry] = useState<RQAPI.Entry>(getEmptyAPIEntry());
  const [isFailed, setIsFailed] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

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
    setEntry((entry) => ({
      ...entry,
      request: {
        ...entry.request,
        method,
      },
    }));
  }, []);

  const setQueryParams = useCallback((queryParams: RQAPI.QueryParam[]) => {
    setEntry((entry) => ({
      ...entry,
      request: {
        ...entry.request,
        queryParams,
      },
    }));
  }, []);

  const setRequestHeaders = useCallback((headers: RQAPI.Header[]) => {
    setEntry((entry) => ({
      ...entry,
      request: {
        ...entry.request,
        headers,
      },
    }));
  }, []);

  const addUrlSchemeIfMissing = useCallback(() => {
    if (entry.request.url && !/^https?:\/\//.test(entry.request.url)) {
      setEntry((entry) => ({
        ...entry,
        request: {
          ...entry.request,
          url: "https://" + entry.request.url,
        },
      }));
    }
  }, [entry]);

  const onSendButtonClick = useCallback(() => {
    const sanitizedEntry: RQAPI.Entry = {
      ...entry,
      request: {
        ...entry.request,
        queryParams: entry.request.queryParams.filter((param) => param.key.length),
        headers: entry.request.headers.filter((param) => param.name.length),
      },
      response: null,
    };

    setEntry(sanitizedEntry);
    setIsFailed(false);
    setIsLoadingResponse(true);

    makeRequest(sanitizedEntry.request).then((response) => {
      if (response) {
        setEntry((entry) => ({ ...entry, response }));
      } else {
        setIsFailed(true);
      }
      setIsLoadingResponse(false);
    });
  }, [entry]);

  return (
    <div className="api-client-view">
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
            onBlur={addUrlSchemeIfMissing}
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
        sizes={[50, 50]}
        minSize={200}
        gutterSize={6}
        gutterAlign="center"
        snapOffset={30}
      >
        <RequestTabs request={entry.request} setQueryParams={setQueryParams} setRequestHeaders={setRequestHeaders} />
        <div className="api-response-view">
          {entry.response ? (
            <ResponseTabs response={entry.response} />
          ) : (
            <div className="api-response-empty-placeholder">
              {isLoadingResponse ? (
                <Spin size="large" tip="Request in progress..." />
              ) : isFailed ? (
                <div className="api-response-empty-placeholder">
                  <Space>
                    <CloseCircleFilled style={{ color: "#ff4d4f" }} />
                    Failed to send the request. Please check if the URL is valid.
                  </Space>
                </div>
              ) : (
                <Empty description="No request sent." />
              )}
            </div>
          )}
        </div>
      </Split>
    </div>
  );
};

export default APIClientView;
