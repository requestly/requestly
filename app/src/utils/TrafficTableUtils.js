import parser from "ua-parser-js";

/**
 * Recieves all the request logs and groups it by domain name
 *
 * @param {Object} requestsLog
 * @returns {Object} Contains all the domains and request logs for each domain
 */
export const groupByDomain = (requestsLog) => {
  const domainSet = new Set();
  const domainLogs = {};

  requestsLog.forEach((element) => {
    const domain = element.request.host;
    domainSet.add(domain);
    if (!(domain in domainLogs)) {
      domainLogs[domain] = [];
    }
    domainLogs[domain].push(element);
  });

  const domainArray = [];
  domainSet.forEach((domain) => {
    domainArray.push({
      domain,
    });
  });

  return {
    domainArray,
    domainLogs,
  };
};

/**
 * Recieves all the request logs and groups it by App name
 *
 * @param {Object} requestsLog
 * @returns {Object} Contains all the app name and request logs for each app
 */

export const groupByApp = (requestsLog) => {
  const appSet = new Set();
  const appLogs = {};

  requestsLog.forEach((element) => {
    const ua = element.request.headers["user-agent"];
    if (ua) {
      const appName = getAppNameFromUA(ua)?.trim();
      appSet.add(appName);
      if (!(appName in appLogs)) {
        appLogs[appName] = [];
      }
      appLogs[appName].push(element);
    }
  });

  const appArray = [];
  appSet.forEach((appName) => {
    appArray.push({
      appName: appName.trim(),
    });
  });

  return {
    appArray,
    appLogs,
  };
};

/**
 * Processes user agent string of request header and gives back the app name.
 * It uses ua-parser-js library which returns browser name directly but if its an electron app,
 * in place of browser name "electron" is returned then by doing some string manipulations on the user-agent string
 * electron app name is obtained else if it is not an electron app the parser returns 'undefined', so app nam is
 * obtained from the user-agent string.
 *
 * @param {String} userAgent User Agent String
 * @returns {String} name of the app
 */

export const getAppNameFromUA = (userAgent) => {
  const { browser } = parser(userAgent);

  let appName;
  if (browser.name === "Electron") {
    appName = userAgent.split(")")[2].split("/")[0];
  } else if (!browser.name) {
    appName = userAgent.split("/")[0];
  } else {
    appName = browser.name;
  }
  return appName;
};
