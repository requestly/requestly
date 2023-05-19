import { convertHarJsonToRQLogs } from "../../TrafficExporter/harLogs/converter";

export const convertProxyLogToUILog = (log) => {
  if (!log) {
    return;
  }
  let finalLog = convertHarJsonToRQLogs(log.finalHar)[0];
  finalLog.id = log.id;
  finalLog.actions = log.actions || [];
  finalLog.requestShellCurl = log.requestShellCurl || "";
  finalLog.requestState = log.requestState || "";
  finalLog.consoleLogs = log.consoleLogs || [];
  return finalLog;
};
export const getSortedMenuItems = (items, key) => {
  return [...(items ?? [])].sort((a, b) => (a[key].trim() < b[key].trim() ? -1 : 1));
};
