import { saveAs } from "file-saver";

import { createLogsHar } from "./converter";
import { Har, RQNetworkLog } from "./types";

export function downloadLogs(logs: RQNetworkLog[]) {
  const harLogs = createLogsHar(logs);
  const jsonBlob = new Blob([JSON.stringify(harLogs, null, 2)], { type: "application/json" });

  saveAs(jsonBlob, "requestly_logs.har");
}

export function downloadHar(har: Har, preferredName?: string) {
  const jsonBlob = new Blob([JSON.stringify(har, null, 2)], { type: "application/json" });
  saveAs(jsonBlob, preferredName ? `${preferredName}.har` : "requestly_logs.har");
}
