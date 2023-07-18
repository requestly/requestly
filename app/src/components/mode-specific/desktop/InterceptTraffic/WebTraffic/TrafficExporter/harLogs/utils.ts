import { saveAs } from "file-saver";

import { createLogsHar } from "./converter";
import { Har, RQNetworkLog } from "./types";
import { cloneDeep } from "lodash";
import { HTTPSnippet } from "httpsnippet";

export function downloadLogs(logs: RQNetworkLog[]) {
  const harLogs = createLogsHar(logs);
  const jsonBlob = new Blob([JSON.stringify(harLogs, null, 2)], { type: "application/json" });

  saveAs(jsonBlob, "requestly_logs.har");
}

export function downloadHar(har: Har, preferredName?: string) {
  const jsonBlob = new Blob([JSON.stringify(har, null, 2)], { type: "application/json" });
  saveAs(jsonBlob, preferredName ? `${preferredName}.har` : "requestly_logs.har");
}

// gets curl for all the requests in the har
export function getCurlFromHar(har: Har): string {
  try {
    const harClone = cloneDeep(har);

    // To workaround a bug in httpsnippet, until the following fix is merged
    // https://github.com/Kong/httpsnippet/pull/323
    harClone.log.entries.forEach((entry) => {
      if (!entry.request.postData) {
        entry.request.postData = { mimeType: "" };
      }
    });

    const requestCurl = new HTTPSnippet(harClone).convert("shell", "curl", {
      indent: " ",
    });

    // Covering all possible types of requestCurl
    if (typeof requestCurl === "boolean") return "";
    if (Array.isArray(requestCurl)) return requestCurl[0];

    return requestCurl;
  } catch (err) {
    console.error(`LoggerMiddleware.generate_curl_from_har Error: ${err}`);
    return "";
  }
}
