import { saveAs } from "file-saver";

import { createLogsHar } from "./converter";
import { Log } from "./types";

export function downloadLogs(logs: Log[]) {
  const harLogs = createLogsHar(logs);
  const jsonBlob = new Blob([JSON.stringify(harLogs, null, 2)], { type: "application/json" });

  saveAs(jsonBlob, "requestly_logs.json");
}

// todo
// export function saveLogsToLocaStorage()
