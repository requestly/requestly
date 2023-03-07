import parser from "ua-parser-js";

/**
 * Recieves all the request logs and groups it by domain name
 *
 * @param {Object} requestsLog
 * @returns {Object} Contains all the domains and request logs for each domain
 */
export const groupByDomain = (requestsLog) => {
  const domainLogs = {};
  const domainArray = [];

  if (requestsLog) {
    const domainSet = new Set();

    requestsLog.forEach((element) => {
      const domain = element.request.host;
      domainSet.add(domain);
      if (!(domain in domainLogs)) {
        domainLogs[domain] = [];
      }
      domainLogs[domain].push(element);
    });

    domainSet.forEach((domain) => {
      domainArray.push({
        domain,
      });
    });
  }
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
  const appLogs = {};
  const appArray = [];
  if (requestsLog) {
    const appSet = new Set();
    requestsLog.forEach((element) => {
      const ua = element.request.headers["user-agent"];
      if (ua) {
        const appName = getAppNameFromUA(ua);
        appSet.add(appName);
        if (!(appName in appLogs)) {
          appLogs[appName] = [];
        }
        appLogs[appName].push(element);
      }
    });

    appSet.forEach((appName) => {
      appArray.push({
        appName,
      });
    });
  }
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

const deduplicateLogs = (logsArr) => {
  let existsMap = {};

  return logsArr.filter((log) => {
    if (existsMap[log.id]) {
      if (existsMap[log.id].timestamp > log.timestamp) {
        existsMap[log.id] = log;
        return true;
      } else {
        return false;
      }
    } else {
      existsMap[log.id] = log;
      return true;
    }
  });
};

export const getFinalLogs = (networkLogsArray, searchKeyword) => {
  console.time("GettingLogs");

  let localMap = [...networkLogsArray];
  const logs = deduplicateLogs(localMap).sort(
    (log1, log2) => log2.timestamp - log1.timestamp
  );

  console.log("total logs", logs.length);

  if (searchKeyword) {
    const reg = new RegExp(searchKeyword, "i");
    const filteredLogs = logs.filter((log) => {
      return log.url.match(reg);
    });

    console.log("total filtered logs", filteredLogs.length);
    console.timeEnd("GettingLogs");
    return filteredLogs;
  }

  console.timeEnd("GettingLogs");
  return logs;
};
