export const convertLogDocIntoRqLog = (doc) => {
  if (!doc || !doc.data()) {
    return;
  }

  const harString = doc.data()?.rq_log?.finalHar || "{}";
  const harObj = JSON.parse(harString);
  let rqLog = convertHarJsonToRQLog(harObj, doc.id);
  rqLog.actions = doc.data()?.rq_log?.actions || [];
  rqLog.requestShellCurl = doc.data()?.rq_log?.requestShellCurl || "";
  rqLog.requestState = doc.data()?.rq_log?.requestState || "";
  return rqLog;
};

const convertHarJsonToRQLog = (har, id) => {
  let entry = {};
  if (har?.log?.entries) {
    entry = har?.log?.entries[0];
  } else {
    return null;
  }

  const request = entry?.request || {};
  const response = entry?.response || {};

  const requestHeaders = {};
  request.headers.forEach((headerObj) => {
    requestHeaders[headerObj.name] = headerObj.value;
  });

  const responseHeaders = {};
  response.headers.forEach((headerObj) => {
    responseHeaders[headerObj.name] = headerObj.value;
  });

  const url = new URL(request?.url);

  const time = new Date(entry.startedDateTime).getTime() / 1000;

  const rqLog = {
    id: id,
    timestamp: time,
    url: request?.url,
    request: {
      method: request?.method,
      path: url.pathname, //Change to path
      host: url.hostname, //Change to host
      port: url.port, //Change to port
      headers: requestHeaders,
      body: request?.postData?.text,
    },
    response: {
      statusCode: response?.status,
      headers: responseHeaders,
      contentType: response?.content?.mimeType,
      // Hack to fix dictionary coming into body
      body:
        typeof response?.content?.text == "string" ? response?.content?.text : JSON.stringify(response?.content?.text),
    },
    requestShellCurl: "",
    actions: [],
    requestState: "",
  };

  return rqLog;
};
