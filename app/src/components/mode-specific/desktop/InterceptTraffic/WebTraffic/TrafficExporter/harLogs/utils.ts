import { saveAs } from "file-saver";

import { createLogsHar } from "./converter";
import { Har, HarEntry, RQNetworkLog } from "./types";
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

export function getCurlFromHarEntry(harEntry: HarEntry): string {
  try {
    const entry = cloneDeep(harEntry);
    // @ts-ignore because HTTPSnippet uses its own HAREntry Type
    let requestCurl = new HTTPSnippet(entry).convert("shell", "curl", {
      indent: " ",
    });
    if (typeof requestCurl === "boolean") return "";
    if (Array.isArray(requestCurl)) return requestCurl[0]; // hacky & untested. Covering all possible types
    return requestCurl;
  } catch (err) {
    console.error(`LoggerMiddleware.generate_curl_from_har Error: ${err}`);
    return "";
  }
}
