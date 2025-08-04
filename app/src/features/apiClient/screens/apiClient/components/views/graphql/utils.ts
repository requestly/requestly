import { RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { isEmpty } from "lodash";

export const graphQLEntryToHttpEntryAdapter = (entry: RQAPI.GraphQLApiEntry): RQAPI.HttpApiEntry => {
  if (isEmpty(entry)) {
    throw new Error("GraphQL entry cannot be empty");
  }

  const httpRequest = graphQLRequestToHttpRequestAdapter(entry.request);
  const httpResponse = graphQLResponseToHttpResponseAdapter(entry.response);

  return {
    ...entry,
    request: httpRequest,
    response: httpResponse,
    type: RQAPI.ApiEntryType.HTTP,
  };
};

export const httpEntryToGraphQLEntryAdapter = (entry: RQAPI.HttpApiEntry): RQAPI.GraphQLApiEntry => {
  if (isEmpty(entry)) {
    throw new Error("HTTP entry cannot be empty");
  }

  const graphQLRequest = httpRequestToGraphQLRequestAdapter(entry.request);
  const graphQLResponse = httpResponseToGraphQLResponseAdapter(entry.response);

  return {
    ...entry,
    request: graphQLRequest,
    response: graphQLResponse,
    type: RQAPI.ApiEntryType.GRAPHQL,
  };
};

export const graphQLRequestToHttpRequestAdapter = (request: RQAPI.GraphQLRequest): RQAPI.HttpRequest => {
  if (isEmpty(request)) {
    throw new Error("GraphQL request cannot be empty");
  }

  const requestBody: Record<string, any> = {
    query: request.operation,
  };

  if (request.variables) {
    requestBody.variables = request.variables;
  }

  const stringifiedRequestBody: RQAPI.RequestJsonBody = JSON.stringify(requestBody);

  const httpRequest: RQAPI.HttpRequest = {
    url: request.url,
    method: RequestMethod.POST,
    headers: [
      ...request.headers,
      // Temp: Adding content type header for testing execution
      // {
      //   id: 0,
      //   isEnabled: true,
      //   key: "Content-Type",
      //   value: "application/json",
      // },
    ],
    queryParams: [],
    body: stringifiedRequestBody,
    contentType: RequestContentType.JSON,
  };

  return httpRequest;
};

export const httpRequestToGraphQLRequestAdapter = (request: RQAPI.HttpRequest): RQAPI.GraphQLRequest => {
  if (isEmpty(request)) {
    throw new Error("HTTP request cannot be empty");
  }

  const graphQLRequest: RQAPI.GraphQLRequest = {
    url: request.url,
    headers: request.headers,
    operation: "",
    variables: "",
  };

  if (request.body && typeof request.body === "string") {
    try {
      const parsedBody = JSON.parse(request.body);
      graphQLRequest.operation = parsedBody.query || "";
      graphQLRequest.variables = parsedBody.variables || "";
      graphQLRequest.operationName = parsedBody.operationName || "";
    } catch (error) {
      console.error("Failed to parse GraphQL request body", error);
    }
  }

  return graphQLRequest;
};

export const httpResponseToGraphQLResponseAdapter = (response: RQAPI.HttpResponse): RQAPI.GraphQLResponse => {
  if (isEmpty(response)) {
    return null as RQAPI.GraphQLResponse;
  }

  return {
    type: "http",
    body: response.body,
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
    time: response.time,
  };
};

export const graphQLResponseToHttpResponseAdapter = (response: RQAPI.GraphQLResponse): RQAPI.HttpResponse => {
  if (isEmpty(response)) {
    return null as RQAPI.HttpResponse;
  }

  return {
    body: response.body,
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
    time: response.time,
    redirectedUrl: "", // GraphQL responses do not have a redirected URL
  };
};
