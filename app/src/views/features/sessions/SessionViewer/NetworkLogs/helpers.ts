import { v4 as uuidv4 } from "uuid";
import { NetworkLog } from "../types";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable";

const getRequestObject = (networkLog: NetworkLog) => {
  const { searchParams } = new URL(networkLog.url);
  const queryString = [] as RQNetworkLog["entry"]["request"]["queryString"];

  searchParams.forEach((value: string, key: string) => queryString.push({ name: key, value }));

  return {
    headers: [],
    queryString,
    url: networkLog.url,
    method: networkLog.method,
  } as RQNetworkLog["entry"]["request"];
};

const getResponseObject = (networkLog: NetworkLog) => {
  return {
    status: networkLog.status,
    statusText: networkLog.statusText,
    cookies: [],
    headers: [],
    content: {
      mimeType: networkLog.contentType,
      text: networkLog.response,
      comment: "",
    },
    redirectURL: networkLog.responseURL,
    comment: "",
  } as RQNetworkLog["entry"]["response"];
};

export const convertSessionRecordingNetworkLogsToRQNetworkLogs = (networkLogs: NetworkLog[]) => {
  return networkLogs.map(
    (networkLog: NetworkLog) =>
      ({
        id: uuidv4(),
        errors: networkLog.errors,
        entry: {
          startedDateTime: String(networkLog.timestamp),
          request: getRequestObject(networkLog),
          response: getResponseObject(networkLog),
        },
      } as RQNetworkLog)
  );
};
