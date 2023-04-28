// TODO: Remove this. UI should support this type of log format only

import { convertHarJsonToRQLogs } from "../../TrafficExporter/harLogs/converter";

// No need to convert the logs
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
// // todo: shift to trafficExporter/harlogs/converter.ts
// const convertHarJsonToRQLog = (har) => {
//   let entry = {};
//   if (har?.log?.entries) {
//     entry = har?.log?.entries[0]; // todo, change this to handle multiple entries
//   } else {
//     return null;
//   }

//   const request = entry?.request || {};
//   const response = entry?.response || {};

//   const requestHeaders = {};
//   request.headers.forEach((headerObj) => {
//     requestHeaders[headerObj.name] = headerObj.value;
//   });

//   const responseHeaders = {};
//   response.headers.forEach((headerObj) => {
//     responseHeaders[headerObj.name] = headerObj.value;
//   });

//   const url = new URL(request?.url);

//   const time = new Date(entry.startedDateTime).getTime() / 1000;

//   const rqLog = {
//     // id: id,
//     timestamp: time,
//     url: request?.url,
//     request: {
//       method: request?.method,
//       path: url.pathname, //Change to path
//       host: url.hostname, //Change to host
//       port: url.port, //Change to port
//       headers: requestHeaders,
//       body: request?.postData?.text,
//     },
//     response: {
//       statusCode: response?.status,
//       headers: responseHeaders,
//       contentType: response?.content?.mimeType,
//       // Hack to fix dictionary coming into body
//       body:
//         typeof response?.content?.text == "string" ? response?.content?.text : JSON.stringify(response?.content?.text),
//     },
//     requestShellCurl: "",
//     actions: [],
//     requestState: "",
//   };

//   return rqLog;
// };

export const getSortedMenuItems = (items, key) => {
  return [...(items ?? [])].sort((a, b) => (a[key].trim() < b[key].trim() ? -1 : 1));
};
