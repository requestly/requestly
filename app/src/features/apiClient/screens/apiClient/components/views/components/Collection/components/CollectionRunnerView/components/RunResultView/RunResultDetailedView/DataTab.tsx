import React, { useMemo } from "react";
import { Collapse } from "antd";
import { RQAPI } from "features/apiClient/types";
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
  const isGraphqlRequest = type === "request" && data && "operation" in data;

  const headers = useMemo(() => {
    const headerData = data?.headers || [];
    return headerData.map((header) => ({
      key: header.key,
      value: header.value,
    }));
  }, [data]);

  const queryParams = useMemo(() => {
    if (!isHttpRequest) return [];
    const httpRequest = data as RQAPI.HttpRequest;
    return (httpRequest.queryParams || []).map((param) => ({
      key: param.key,
      value: param.value,
    }));
  }, [isHttpRequest, data]);

  const body = useMemo(() => {
    if (type === "request") {
      if (isHttpRequest) {
        const httpRequest = data as RQAPI.HttpRequest;
        const requestBody = httpRequest.body;
        if (!requestBody) return "";
        if (typeof requestBody === "string") return requestBody;
        if (Array.isArray(requestBody)) return JSON.stringify(requestBody, null, 2);
      }
      if (isGraphqlRequest) {
        const graphqlRequest = data as RQAPI.GraphQLRequest;
        return graphqlRequest.operation || "";
      }
      return "";
    }
    const responseData = data as RQAPI.Response;
    return responseData?.body || "";
  }, [type, isHttpRequest, isGraphqlRequest, data]);

  const contentType = useMemo(() => {
    if (type === "request") {
      if (isHttpRequest) {
        const httpRequest = data as RQAPI.HttpRequest;
        return httpRequest.contentType || "text/plain";
      }
      if (isGraphqlRequest) {
        return "application/json";
      }
      return "text/plain";
    }
    const responseData = data as RQAPI.Response;
    return getContentTypeFromResponseHeaders(responseData?.headers || []) || "text/plain";
  }, [type, isHttpRequest, isGraphqlRequest, data]);

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
            <ResponseBody responseText={body} contentTypeHeader={contentType} />
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
        {isHttpRequest && (
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
