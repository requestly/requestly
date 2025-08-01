import { getIntrospectionQuery } from "graphql";
import { RQAPI } from "../types";
import { makeRequest } from "../screens/apiClient/utils";
import { graphQLRequestToHttpRequestAdapter } from "../screens/apiClient/components/views/graphql/utils";

const createGraphQLIntrospectionRequest = (url: string): RQAPI.GraphQLRequest => {
  return {
    url,
    headers: [
      // {
      //   id: 0,
      //   isEnabled: true,
      //   key: "Content-Type",
      //   value: "application/json",
      // },
    ],
    operation: getIntrospectionQuery(),
    variables: "",
  };
};

export type IntrospectionData = Record<string, any>;

export const fetchGraphQLIntrospectionData = async (url: string, appMode: string): Promise<IntrospectionData> => {
  const request = createGraphQLIntrospectionRequest(url);
  const httpRequest = graphQLRequestToHttpRequestAdapter(request);
  const response = await makeRequest(appMode, httpRequest);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch introspection data: ${response.statusText}`);
  }

  try {
    const responseBodyJson = JSON.parse(response.body);
    return responseBodyJson.data;
  } catch (error) {
    throw new Error(`Failed to parse introspection data: ${error.message}`);
  }
};
