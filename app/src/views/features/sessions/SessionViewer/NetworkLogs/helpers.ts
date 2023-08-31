import { v4 as uuidv4 } from "uuid";
import { NetworkLog } from "../types";
import { RQNetworkEventErrorCodes, RQSessionAttributes } from "@requestly/web-sdk";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";

const getRequestObject = (networkLog: NetworkLog) => {
  const { searchParams } = new URL(networkLog.url);
  const queryString = [] as RQNetworkLog["entry"]["request"]["queryString"];

  searchParams.forEach((value: string, key: string) => queryString.push({ name: key, value }));

  return {
    headers: [],
    queryString,
    url: networkLog.url,
    method: networkLog.method,
    postData: {
      mimeType: "",
      text: networkLog?.errors?.includes(RQNetworkEventErrorCodes.REQUEST_TOO_LARGE)
        ? "Payload too large to capture"
        : networkLog.requestData,
      comment: "",
    },
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
      text: networkLog?.errors?.includes(RQNetworkEventErrorCodes.RESPONSE_TOO_LARGE)
        ? "Payload too large to capture"
        : networkLog.response,
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
        entry: {
          time: networkLog.responseTime,
          startedDateTime: String(networkLog.timestamp),
          request: getRequestObject(networkLog),
          response: getResponseObject(networkLog),
        },
      } as RQNetworkLog)
  );
};

export const getOffset = (log: RQNetworkLog, sessionRecordingStartTime: RQSessionAttributes["startTime"]) => {
  let offset = Math.floor((new Date(Number(log.entry.startedDateTime)).getTime() - sessionRecordingStartTime) / 1000);
  offset = offset >= 0 ? offset : 0; // Sometimes offset comes out negative.
  return offset;
};
