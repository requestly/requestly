import { Avatar, Tooltip } from "antd";
import APPNAMES from "../Tables/GROUPBYAPP_CONSTANTS";

// TODO: Remove this. UI should support this type of log format only
// No need to convert the logs
export const convertProxyLogToUILog = (log) => {
  if (!log) {
    return;
  }
  let finalLog = convertHarJsonToRQLog(log.finalHar);
  finalLog.id = log.id;
  finalLog.actions = log.actions || [];
  finalLog.requestShellCurl = log.requestShellCurl || "";
  finalLog.requestState = log.requestState || "";
  finalLog.consoleLogs = log.consoleLogs || [];
  return finalLog;
};

const convertHarJsonToRQLog = (har) => {
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
    // id: id,
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

const getLogAvatar = (text = "", avatarUrl) => {
  return (
    <>
      <Tooltip mouseEnterDelay={0.3} placement="topLeft" title={text.length > 24 ? text : ""}>
        <Avatar size={18} src={avatarUrl} style={{ display: "inline-block", marginRight: "4px" }} />
        <span>{`  ${text}`}</span>
      </Tooltip>
    </>
  );
};

const getApplogAvatar = (text) => {
  text = text.trim();
  text = decodeURIComponent(text);
  const avatarDomain = APPNAMES[text.split(" ")[0].toLowerCase()];
  const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
  return getLogAvatar(text, avatarUrl);
};

const getDomainLogAvatar = (text) => {
  text = text.trim();
  const domainParts = text.split(".");
  const avatarDomain = domainParts.splice(domainParts.length - 2, 2).join(".");
  const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
  return getLogAvatar(text, avatarUrl);
};

const getSortedMenuItems = (items, key) => {
  return [...(items ?? [])].sort((a, b) => (a[key].trim() < b[key].trim() ? -1 : 1));
};

export const getAppLogsMenuItem = (apps) => {
  return getSortedMenuItems(apps, "appName").map(({ appName }) => ({
    key: `app ${appName}`,
    label: getApplogAvatar(appName),
  }));
};

export const getDomainLogsMenuItem = (domains) => {
  return getSortedMenuItems(domains, "domain").map(({ domain }) => ({
    key: `domain ${domain}`,
    label: getDomainLogAvatar(domain),
  }));
};
