import { NetworkEvent, RQNetworkEvent } from "../../types";

export function getGraphQLDetails(event: NetworkEvent): RQNetworkEvent["metadata"]["GQLDetails"] {
  const method = event.request.method;

  let GQLQuery = null,
    GQLVariables = null,
    GQLOperationName = null;

  if (method === "GET" || method === "HEAD") {
    const urlSearchParams = event.request.queryString;
    GQLQuery = urlSearchParams.find((param) => param.name === "query")?.value;
    GQLVariables = urlSearchParams.find((param) => param.name === "variables")?.value;
    GQLOperationName = urlSearchParams.find((param) => param.name === "operationName")?.value;
  } else if (method === "POST") {
    const postData = event.request.postData;
    if (postData) {
      const postDataText = postData.text;
      try {
        const postDataJson = JSON.parse(postDataText);
        GQLQuery = postDataJson.query ?? null;
        GQLVariables = postDataJson.variables ?? null;
        GQLOperationName = postDataJson.operationName ?? null;
      } catch (e) {
        // skip
      }
    }
  }

  if (GQLQuery || GQLOperationName) {
    return {
      query: GQLQuery,
      variables: GQLVariables,
      operationName: GQLOperationName,
    };
  }

  return null;
}
