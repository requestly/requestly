import { saveAs } from "file-saver";

import { createLogsHar } from "./converter";
import { Har, RQNetworkLog, HarEntry } from "./types";

export function downloadLogs(logs: RQNetworkLog[]) {
  const harLogs = createLogsHar(logs);
  const jsonBlob = new Blob([JSON.stringify(harLogs, null, 2)], { type: "application/json" });

  saveAs(jsonBlob, "requestly_logs.har");
}

export function downloadHar(har: Har, preferredName?: string) {
  const jsonBlob = new Blob([JSON.stringify(har, null, 2)], { type: "application/json" });
  saveAs(jsonBlob, preferredName ? `${preferredName}.har` : "requestly_logs.har");
}

export function getGraphQLDetails(harEntry: HarEntry): RQNetworkLog["metadata"]["GQLDetails"] {
  const method = harEntry.request.method;

  let GQLQuery = null,
    GQLVariables = null,
    GQLOperationName = null;

  if (method === "GET" || method === "HEAD") {
    const urlSearchParams = harEntry.request.queryString;
    GQLQuery = urlSearchParams.find((param) => param.name === "query")?.value;
    GQLVariables = urlSearchParams.find((param) => param.name === "variables")?.value;
    GQLOperationName = urlSearchParams.find((param) => param.name === "operationName")?.value;
  } else if (method === "POST") {
    const postData = harEntry.request.postData;
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
