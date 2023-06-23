import { Har, HarEntry, HarHeaderEntry, HarRequest, HarResponse, HeaderMap, RQNetworkLog } from "./types";

import { v4 as uuidv4 } from "uuid";

const createHarHeaders = (headersObject: HeaderMap) => {
  const headers: HarHeaderEntry[] = [];
  for (const key in headersObject) {
    headers.push({
      name: key,
      value: headersObject[key],
    });
  }
  return headers;
};

const convertLogToHarEntry = (log: RQNetworkLog) => {
  const harRequest: HarRequest = {
    bodySize: -1,
    headersSize: -1,
    httpVersion: "HTTP/1.1",
    cookies: [],
    method: log.request.method,
    queryString: log.request.queryParams,
    url: log.url,
    postData: {
      text: log.request.body,
    },
    headers: createHarHeaders(log.request.headers),
  };
  const harResponse: HarResponse = {
    status: log.response.statusCode,
    httpVersion: "HTTP/1.1",
    cookies: [],
    content: {
      size: 0,
      compression: 0,
      text: log.response.body,
      mimeType: log.response.contentType,
    },
    headers: createHarHeaders(log.response.headers),
  };

  const entry: HarEntry = {
    startedDateTime: new Date(log.timestamp).toISOString(),
    request: harRequest,
    response: harResponse,
    cache: {},
    timings: {},

    _RQDetails: {
      id: log.id,
      actions: log.actions,
      requestShellCurl: log.requestShellCurl,
      consoleLogs: log.consoleLogs,
      requestState: log.requestState,
    },
  };

  return entry;
};

export function createLogsHar(logs: RQNetworkLog[]) {
  const logEntries = logs.map((log) => {
    return convertLogToHarEntry(log);
  });
  const result: Har = {
    log: {
      version: "1.2",
      creator: {},
      browser: {},
      pages: [],
      entries: logEntries,
    },
  };

  return result;
}

/**
 * The optional chaining is so that this function is able
 * to convert all sources of network har objects
 * - Live from RQ proxy
 * - importing har that was exported from RQ
 * - importing any random (but valid) har file too!
 */
export const convertHarJsonToRQLogs = (har: Har): RQNetworkLog[] => {
  const res: RQNetworkLog[] = har?.log?.entries?.map((entry) => {
    const requestHeaders: Record<string, string> = {};
    entry.request.headers.forEach((headerObj) => {
      requestHeaders[headerObj.name] = headerObj.value;
    });

    const responseHeaders: Record<string, string> = {};
    entry.response.headers.forEach((headerObj) => {
      responseHeaders[headerObj.name] = headerObj.value;
    });

    const url = new URL(entry.request.url);

    const rqLog: RQNetworkLog = {
      id: entry?._RQDetails?.id || uuidv4(),
      timestamp: new Date(entry.startedDateTime).getTime() / 1000,
      url: url.toString(),
      request: {
        method: entry.request.method,
        path: url.pathname, //Change to path
        host: url.hostname, //Change to host
        port: url.port, //Change to port
        headers: requestHeaders,
        body: entry.request.postData?.text,
        queryParams: entry.request.queryString,
      },
      response: {
        statusCode: entry.response.status,
        headers: responseHeaders,
        contentType: entry.response.content?.mimeType,
        // Hack to fix dictionary coming into body
        body:
          typeof entry.response.content?.text == "string"
            ? entry.response.content?.text
            : JSON.stringify(entry.response.content?.text),
      },
      requestShellCurl: entry?._RQDetails?.requestShellCurl || "",
      actions: entry?._RQDetails?.actions || [],
      requestState: entry?._RQDetails?.requestState || "",
      consoleLogs: entry?._RQDetails?.consoleLogs || [],
    };
    return rqLog;
  });

  return res;
};
