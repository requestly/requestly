import React, { useMemo } from "react";
import { Collapse, Tabs } from "antd";
import { RequestExecutionResult } from "features/apiClient/slices/common/runResults/types";
import { RQAPI, KeyValuePair } from "features/apiClient/types";
import { PropertiesGrid } from "componentsV2/PropertiesGrid/PropertiesGrid";
import Editor from "componentsV2/CodeEditor";
import { getEditorLanguageFromContentType } from "componentsV2/CodeEditor";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import "./runResultDetailedView.scss";
import { EmptyState } from "../../EmptyState/EmptyState";
import EmptyInboxIcon from "/assets/media/rules/empty-inbox.svg";

interface Props {
  onClose: () => void;
  requestExecutionResult: RequestExecutionResult | null;
}

const RequestTab: React.FC<{ request: RQAPI.Request | undefined }> = ({ request }) => {
  const isHttpRequest = request ? "method" in request : false;
  const httpRequest = isHttpRequest && request ? (request as RQAPI.HttpRequest) : null;
  const graphqlRequest = !isHttpRequest && request ? (request as RQAPI.GraphQLRequest) : null;

  const headers = useMemo(() => {
    const headerData = httpRequest?.headers || graphqlRequest?.headers || [];
    return headerData.map((header) => ({
      key: header.key,
      value: header.value,
    }));
  }, [httpRequest, graphqlRequest]);

  const queryParams = useMemo(() => {
    if (!httpRequest?.queryParams) return [];
    return httpRequest.queryParams.map((param) => ({
      key: param.key,
      value: param.value,
    }));
  }, [httpRequest]);

  const body = useMemo(() => {
    if (httpRequest?.body) {
      if (typeof httpRequest.body === "string") {
        return httpRequest.body;
      }
      if (Array.isArray(httpRequest.body)) {
        return JSON.stringify(httpRequest.body, null, 2);
      }
    }
    if (graphqlRequest?.operation) {
      return graphqlRequest.operation;
    }
    return "";
  }, [httpRequest, graphqlRequest]);

  const contentType = useMemo(() => {
    if (httpRequest?.contentType) {
      return httpRequest.contentType;
    }
    if (graphqlRequest) {
      return "application/json";
    }
    return "text/plain";
  }, [httpRequest, graphqlRequest]);

  if (!request) {
    return <EmptyState title="Request data not available" description="" imageSrc={EmptyInboxIcon} />;
  }

  return (
    <div className="request-details-tab">
      <Collapse defaultActiveKey={["body"]} ghost>
        <Collapse.Panel header="Body" key="body">
          {body ? (
            <div className="request-details-editor">
              <Editor
                value={body}
                language={getEditorLanguageFromContentType(contentType)}
                isReadOnly
                toolbarOptions={{ title: "" }}
              />
            </div>
          ) : (
            <EmptyState title="Response body not available" description="" imageSrc={EmptyInboxIcon} />
          )}
        </Collapse.Panel>
        <Collapse.Panel header="Headers" key="headers">
          {headers.length > 0 ? (
            <div className="request-details-properties">
              <PropertiesGrid data={headers} />
            </div>
          ) : (
            <EmptyState title="Headers not available" description="" imageSrc={EmptyInboxIcon} />
          )}
        </Collapse.Panel>
        {httpRequest && (
          <Collapse.Panel header="Query Params" key="queryParams">
            {queryParams.length > 0 ? (
              <div className="request-details-properties">
                <PropertiesGrid data={queryParams} />
              </div>
            ) : (
              <EmptyState title="Query parameters not available" description="" imageSrc={EmptyInboxIcon} />
            )}
          </Collapse.Panel>
        )}
      </Collapse>
    </div>
  );
};

const ResponseTab: React.FC<{ response: RQAPI.Response | undefined }> = ({ response }) => {
  const headers = useMemo(() => {
    const headerData = response?.headers || [];
    return headerData.map((header: KeyValuePair) => ({
      key: header.key,
      value: header.value,
    }));
  }, [response]);

  const body = useMemo(() => {
    return response?.body || "";
  }, [response]);

  const contentType = useMemo(() => {
    return getContentTypeFromResponseHeaders(response?.headers || []) || "text/plain";
  }, [response]);

  if (!response) {
    return <EmptyState title="Response data not available" description="" imageSrc={EmptyInboxIcon} />;
  }

  return (
    <div className="response-details-tab">
      <Collapse defaultActiveKey={["body"]} ghost>
        <Collapse.Panel header="BODY" key="body">
          {body ? (
            <div className="request-details-editor">
              <Editor
                value={body}
                language={getEditorLanguageFromContentType(contentType)}
                isReadOnly
                prettifyOnInit
                toolbarOptions={{ title: "" }}
              />
            </div>
          ) : (
            <EmptyState title="No body content" description="" imageSrc={EmptyInboxIcon} />
          )}
        </Collapse.Panel>
        <Collapse.Panel header="HEADERS" key="headers">
          {headers.length > 0 ? (
            <div className="request-details-properties">
              <PropertiesGrid data={headers} />
            </div>
          ) : (
            <EmptyState title="No headers" description="" imageSrc={EmptyInboxIcon} />
          )}
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export const RunResultDetailedView: React.FC<Props> = ({ onClose, requestExecutionResult }) => {
  const tabItems = useMemo(() => {
    return [
      {
        key: "response",
        label: "Response",
        children: <ResponseTab response={requestExecutionResult?.response} />,
      },
      {
        key: "request",
        label: "Request",
        children: <RequestTab request={requestExecutionResult?.request} />,
      },
    ];
  }, [requestExecutionResult]);

  if (!requestExecutionResult) {
    return null;
  }

  return (
    <div className="request-details-content">
      <Tabs items={tabItems} defaultActiveKey="response" />
    </div>
  );
};
