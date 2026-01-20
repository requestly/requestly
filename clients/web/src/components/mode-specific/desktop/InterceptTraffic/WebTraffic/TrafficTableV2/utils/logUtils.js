import { getRequestApp, getRequestDomain } from ".";
import { convertHarJsonToRQLogs } from "../../TrafficExporter/harLogs/converter";

export const convertProxyLogToUILog = (log) => {
  if (!log) {
    return;
  }
  let finalLog = convertHarJsonToRQLogs(log.finalHar)[0];
  finalLog.id = log.id;
  finalLog.actions = log.actions || [];
  finalLog.requestState = log.requestState || "";
  finalLog.consoleLogs = log.consoleLogs || [];

  // TODO: This should be moved to background process
  finalLog.app = getRequestApp(finalLog);
  finalLog.domain = getRequestDomain(finalLog);
  return finalLog;
};
