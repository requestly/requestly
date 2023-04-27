import { Har, HarEntry, HarHeaderEntry, HarRequest, HarResponse, HeaderMap, Log } from "./types";

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

const convertLogToHarEntry = (log: Log) => {
  const harRequest: HarRequest = {
    bodySize: -1,
    headersSize: -1,
    httpVersion: "HTTP/1.1",
    cookies: [],
    method: log.request.method,
    queryString: [],
    url: log.url,
    headers: createHarHeaders(log.request.headers),
  };
  const harResponse: HarResponse = {
    status: log.response.statusCode,
    httpVersion: "HTTP/1.1",
    cookies: [],
    content: {
      size: 33,
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

    RQDetails: {
      id: log.id,
      actions: log.actions,
      requestShellCurl: log.requestShellCurl,
      consoleLogs: log.consoleLogs,
      requestState: log.requestState,
    },
  };

  return entry;
};

export function createLogsHar(logs: Log[]) {
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
