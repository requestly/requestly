import { getIntrospectionQuery, IntrospectionQuery } from "graphql";
import { KeyValuePair, RQAPI } from "../types";
import { makeRequest } from "../screens/apiClient/utils";
import { graphQLRequestToHttpRequestAdapter } from "../screens/apiClient/components/views/graphql/utils";
import { SimpleKeyValuePair } from "../store/autogenerateStore";

const createGraphQLIntrospectionRequest = (url: string, headers: KeyValuePair[]): RQAPI.GraphQLRequest => {
  return {
    url,
    headers,
    operation: getIntrospectionQuery(),
    variables: "",
  };
};

export type IntrospectionData = IntrospectionQuery;

export const fetchGraphQLIntrospectionData = async (
  url: string,
  appMode: string,
  headers: SimpleKeyValuePair[],
  queryParams: SimpleKeyValuePair[]
): Promise<IntrospectionData> => {
  const formattedHeaders: KeyValuePair[] = headers.map((header, index) => ({
    id: index,
    isEnabled: true,
    key: header.key,
    value: header.value,
  }));

  const requestUrl = new URL(url);
  queryParams.forEach((param) => {
    requestUrl.searchParams.append(param.key, param.value);
  });

  const request = createGraphQLIntrospectionRequest(requestUrl.toString(), formattedHeaders);
  const httpRequest = graphQLRequestToHttpRequestAdapter(request);
  const response = await makeRequest(appMode, httpRequest);

  if (response?.status !== 200) {
    throw new Error(`Failed to fetch introspection data: ${response?.status ?? ""}`);
  }

  try {
    const responseBodyJson = JSON.parse(response.body);

    if (!responseBodyJson.data.__schema) {
      throw new Error("Invalid introspection data received");
    }

    return responseBodyJson.data;
  } catch (error) {
    throw new Error(`Failed to parse introspection data: ${error.message}`);
  }
};
