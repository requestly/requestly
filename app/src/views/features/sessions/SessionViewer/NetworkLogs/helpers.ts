import { v4 as uuidv4 } from "uuid";
import { NetworkLog } from "../types";
import {
  RQNetworkLog,
  RQNetworkLogType,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";

const getRequestObject = (networkLog: NetworkLog) => {
  const { pathname, host, port, searchParams } = new URL(networkLog.url);
  const queryParams = [] as RQNetworkLog["request"]["queryParams"];

  searchParams.forEach((value: string, key: string) => queryParams.push({ name: key, value }));

  return {
    host,
    port,
    headers: {},
    path: pathname,
    method: networkLog.method,
    body: networkLog.requestData as any,
    queryParams,
  } as RQNetworkLog["request"];
};

const getResponseObject = (networkLog: NetworkLog) => {
  return {
    headers: {},
    statusCode: networkLog.status,
    statusText: networkLog.statusText,
    contentType: networkLog.contentType,
    body: networkLog.response,
    timestamp: networkLog.responseTime,
    url: networkLog.responseURL,
  } as RQNetworkLog["response"];
};

export const convertSessionRecordingNetworkLogsToRQNetworkLogs = (networkLogs: NetworkLog[]) => {
  return networkLogs.map(
    (networkLog: NetworkLog) =>
      ({
        id: uuidv4(),
        url: networkLog.url,
        timestamp: networkLog.timestamp,
        timeOffset: networkLog.timeOffset,
        errors: networkLog.errors,
        request: getRequestObject(networkLog),
        response: getResponseObject(networkLog),
        requestShellCurl: "",
        consoleLogs: [],
        logType: RQNetworkLogType.SESSION_RECORDING,
      } as RQNetworkLog)
  );
};
