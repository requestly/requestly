import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";

export const graphQLEntryToHttpEntryAdapter = (entry: RQAPI.GraphQLApiEntry): RQAPI.HttpApiEntry => {
  const requestBody: any = {
    query: entry.request.operation,
    variables: entry.request.variables,
  };
  if (entry.request.operationName) {
    requestBody.operationName = entry.request.operationName;
  }
  const headers: KeyValuePair[] = [
    ...entry.request.headers,
    // Temp: Adding content type header for testing execution
    {
      id: 0,
      isEnabled: true,
      key: "Content-Type",
      value: "application/json",
    },
  ];

  return {
    ...entry,
    request: {
      method: RequestMethod.POST,
      url: entry.request.url,
      headers,
      queryParams: [],
      body: JSON.stringify(requestBody),
      contentType: RequestContentType.JSON,
    },
    response: null,
    type: RQAPI.ApiEntryType.HTTP,
    auth: entry.auth,
    testResults: entry.testResults,
    scripts: entry.scripts,
  };
};
