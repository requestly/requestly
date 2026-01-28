import React, { useMemo } from "react";
import { Collapse } from "antd";
import { RQAPI, KeyValuePair } from "features/apiClient/types";
import { PropertiesGrid } from "componentsV2/PropertiesGrid/PropertiesGrid";
import { getContentTypeFromResponseHeaders } from "features/apiClient/screens/apiClient/utils";
import { EmptyState } from "../../EmptyState/EmptyState";
import EmptyInboxIcon from "/assets/media/rules/empty-inbox.svg";
import ResponseBody from "../../../../../../response/ResponseBody/ResponseBody";

interface DataTabProps {
  type: "request" | "response";
  request?: RQAPI.Request;
  response?: RQAPI.Response;
  method?: string;
  statusCode?: number;
}

const getEmptyBodyMessage = (type: "request" | "response", method?: string, statusCode?: number): string => {
  if (type === "request") {
    if (method === "GET" || method === "HEAD") {
      return `${method} requests typically don't have a body`;
    }
    return "Request body not available";
  }

  // Response type
  if (statusCode) {
    if (statusCode >= 500) {
      return "Server error - No response body";
    }
    if (statusCode >= 400) {
      return "Client error - No response body";
    }
    if (statusCode === 204) {
      return "No content (204)";
    }
  }

  if (method === "GET" || method === "HEAD") {
    return "No response body received";
  }

  return "No body content";
};

export const DataTab: React.FC<DataTabProps> = ({ type, request, response, method, statusCode }) => {
  const data = type === "request" ? request : response;

  const isHttpRequest = type === "request" && data && "method" in data;
  const httpRequest = isHttpRequest ? (data as RQAPI.HttpRequest) : null;
  const graphqlRequest = type === "request" && data && !isHttpRequest ? (data as RQAPI.GraphQLRequest) : null;
  const responseData = type === "response" && data ? (data as RQAPI.Response) : null;

  const headers = useMemo(() => {
    let headerData: KeyValuePair[] = [];
    if (httpRequest) {
      headerData = httpRequest.headers || [];
    } else if (graphqlRequest) {
      headerData = graphqlRequest.headers || [];
    } else if (responseData) {
      headerData = responseData.headers || [];
    }
    return headerData.map((header) => ({
      key: header.key,
      value: header.value,
    }));
  }, [httpRequest, graphqlRequest, responseData]);

  const queryParams = useMemo(() => {
    if (!httpRequest?.queryParams) return [];
    return httpRequest.queryParams.map((param) => ({
      key: param.key,
      value: param.value,
    }));
  }, [httpRequest]);

  const body = useMemo(() => {
    if (type === "request") {
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
    } else {
      return responseData?.body || "";
    }
    return "";
  }, [type, httpRequest, graphqlRequest, responseData]);

  const contentType = useMemo(() => {
    if (type === "request") {
      if (httpRequest?.contentType) {
        return httpRequest.contentType;
      }
      if (graphqlRequest) {
        return "application/json";
      }
    } else if (responseData) {
      return getContentTypeFromResponseHeaders(responseData.headers) || "text/plain";
    }
    return "text/plain";
  }, [type, httpRequest, graphqlRequest, responseData]);

  const emptyBodyMessage = useMemo(() => getEmptyBodyMessage(type, method, statusCode), [type, method, statusCode]);

  if (!data) {
    return (
      <EmptyState
        title={`${type === "request" ? "Request" : "Response"} data not available`}
        description=""
        imageSrc={EmptyInboxIcon}
      />
    );
  }

  return (
    <div className={`${type}-details-tab`}>
      <Collapse defaultActiveKey={["body"]} ghost>
        <Collapse.Panel header={type === "request" ? "Body" : "BODY"} key="body" className="body-collapse-panel">
          {body ? (
            <ResponseBody responseText={body} contentTypeHeader={contentType} disableResize />
          ) : (
            <EmptyState title={emptyBodyMessage} description="" imageSrc={EmptyInboxIcon} />
          )}
        </Collapse.Panel>
        <Collapse.Panel header={type === "request" ? "Headers" : "HEADERS"} key="headers">
          {headers.length > 0 ? (
            <div className="request-details-properties">
              <PropertiesGrid data={headers} />
            </div>
          ) : (
            <EmptyState
              title={type === "request" ? "Headers not available" : "No headers"}
              description=""
              imageSrc={EmptyInboxIcon}
            />
          )}
        </Collapse.Panel>
        {type === "request" && httpRequest && (
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
