window.RQ = window.RQ || {};
RQ.Utils = RQ.Utils || {};

RQ.Utils.regexFormat = "^/(.+)/(|i|g|ig|gi)$";

RQ.Utils.toRegex = function (regexStr) {
  const matchRegExp = regexStr.match(new RegExp(RQ.Utils.regexFormat));

  if (!matchRegExp) {
    return null;
  }
  try {
    return new RegExp(matchRegExp[1], matchRegExp[2]);
  } catch {
    return null;
  }
};

RQ.Utils.isValidUrl = function (url) {
  return url.search(/^http:|https:|ftp:|javascript:/) === 0;
};

RQ.Utils.getId = function () {
  return Date.now();
};

RQ.Utils.getCurrentTime = function () {
  return Date.now();
};

RQ.Utils.formatDate = function (dateInMilis, format) {
  const d = new Date(dateInMilis);

  if (dateInMilis && format === "yyyy-mm-dd") {
    let month = d.getMonth() + 1,
      date = d.getDate();

    date = String(date).length < 2 ? "0" + date : String(date);
    month = String(month).length < 2 ? "0" + month : String(month);

    return d.getFullYear() + "-" + month + "-" + date;
  }
};

RQ.Utils.reloadPage = function (wait) {
  wait = wait || 0;

  setTimeout(function () {
    window.location.reload();
  }, wait);
};

RQ.Utils.removeLastPart = function (str, separater) {
  str = str || "";

  // Return original string when separator is not present
  if (str.indexOf(separater) === -1) {
    return str;
  }

  str = str.split(separater);

  // Remove last part
  str.length--;

  return str.join(separater);
};

RQ.Utils.setCookie = function (name, value, maxAge) {
  document.cookie = name + "=" + value + "; path=/" + "; max-age=" + maxAge;
};

RQ.Utils.readCookie = function (name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

RQ.Utils.eraseCookie = function (name) {
  RQ.Utils.setCookie(name, "", 1);
};

/**
 *
 * @param url Url from which component has to be extracted
 * @param name Url component name - host, path, url, query, fragment etc.
 */
RQ.Utils.extractUrlComponent = function (url, name) {
  if (!window.dummyAnchor) {
    window.dummyAnchor = document.createElement("a");
  }

  window.dummyAnchor.href = url;

  switch (name) {
    case RQ.URL_COMPONENTS.URL:
      return url;
    case RQ.URL_COMPONENTS.PROTOCOL:
      return window.dummyAnchor.protocol;
    case RQ.URL_COMPONENTS.HOST:
      return window.dummyAnchor.host;
    case RQ.URL_COMPONENTS.PATH:
      return window.dummyAnchor.pathname;
    case RQ.URL_COMPONENTS.QUERY:
      return window.dummyAnchor.search;
    case RQ.URL_COMPONENTS.HASH:
      return window.dummyAnchor.hash;
    case RQ.URL_COMPONENTS.ORIGIN:
      return window.dummyAnchor.origin;
  }

  console.error("Invalid source key", url, name);
};

/**
 *
 * @param queryString e.g. ?a=1&b=2 or a=1 or ''
 * @returns object { paramName -> [value1, value2] }
 */
RQ.Utils.getQueryParamsMap = function (queryString) {
  var map = {},
    queryParams;

  if (!queryString || queryString === "?") {
    return map;
  }

  if (queryString[0] === "?") {
    queryString = queryString.substr(1);
  }

  queryParams = queryString.split("&");

  queryParams.forEach(function (queryParam) {
    var paramName = queryParam.split("=")[0],
      paramValue = queryParam.split("=")[1];

    // We are keeping value of param as array so that in future we can support multiple param values of same name
    // And we do not want to lose the params if url already contains multiple params of same name
    map[paramName] = map[paramName] || [];
    map[paramName].push(paramValue);
  });

  return map;
};

/**
 * Convert a map to keyvalue pair string (Used for query params)
 * @param queryParamsMap
 * @returns {string}
 */
RQ.Utils.convertQueryParamMapToString = function (queryParamsMap) {
  var queryParamsArr = [];

  for (var paramName in queryParamsMap) {
    var values = queryParamsMap[paramName] || [];

    values.forEach(function (paramValue) {
      if (typeof paramValue === "undefined") {
        queryParamsArr.push(paramName);
      } else {
        queryParamsArr.push(paramName + "=" + paramValue);
      }
    });
  }

  return queryParamsArr.join("&");
};

RQ.Utils.getUrlWithoutQueryParamsAndHash = function (url) {
  var urlWithoutHash = url.split("#")[0];

  return urlWithoutHash.split("?")[0];
};

/**
 * Add a Query Param to URL
 * @param {string} url Url to which query string has to be added
 * @param {string} paramName The paramName to be added
 * @param {string} paramValue The paramValue of the paramName
 * @param {boolean} overwrite Whether to overwrite the existing queryStrign or not
 * @returns {string} A well formatted url with addition of given query param
 */
RQ.Utils.addQueryParamToURL = function (url, paramName, paramValue, overwrite) {
  let resultingUrl = url,
    urlWithoutQueryParamsAndHash = RQ.Utils.getUrlWithoutQueryParamsAndHash(url),
    urlHash = RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.HASH),
    queryString = RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.QUERY),
    queryParamsMap = RQ.Utils.getQueryParamsMap(queryString);

  if (overwrite) {
    queryParamsMap[paramName] = [];
  } else {
    queryParamsMap[paramName] = queryParamsMap[paramName] || [];
  }

  queryParamsMap[paramName].push(paramValue);

  queryString = RQ.Utils.convertQueryParamMapToString(queryParamsMap);

  resultingUrl = queryString ? urlWithoutQueryParamsAndHash + "?" + queryString : urlWithoutQueryParamsAndHash;
  resultingUrl += urlHash;

  return resultingUrl;
};

/**
 * Adds Delay by running a loop for desired time
 * @param {Number} milliseconds Time in ms for which to add delay
 * @returns {Void} Void
 */
RQ.Utils.addDelay = function (milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};

/**
 * Generates Id for a execution log- a random 6 digit number is added to current epoch time
 * to generate a unique ID. I works as the number of digits in current time wont be affected
 * by adding an 6 digit number.
 * Also added an unit test to verify ID length
 * @returns {String} id
 */

RQ.Utils.generateExecutionLogId = function () {
  return `executionLog_${Date.now() + Math.floor(Math.random() * 1000000)}`;
};

/**
 * This code is also copied in responseRuleHandler.js So if you change anything inside this, please update there as well
 * And test across multiple sites using Modify Response Rule
 * @param {String} mightBeJSONString
 * @returns JSON Object if the string is JSON String otherwise returns the same string
 */
RQ.Utils.jsonifyValidJSONString = (mightBeJSONString) => {
  if (typeof mightBeJSONString !== "string") return mightBeJSONString;

  try {
    return JSON.parse(mightBeJSONString);
  } catch (e) {
    /* Do Nothing. Unable to parse the param value */
  }

  return mightBeJSONString;
};

/**
 * This code is also copied in responseRuleHandler.js So if you change anything inside this, please update there as well
 * And test across multiple sites using Modify Response Rule
 * @param {String} url
 * @returns JSON Object for the searchParams. Handle decoding of Params and JSON Strings
 */
RQ.Utils.convertSearchParamsToJSON = (url) => {
  const result = {};

  if (!url || url === "?" || url.indexOf("?") === -1) {
    return result;
  }

  // https://stackoverflow.com/a/50147341/816213
  // (URL decoding is already handled in URLSearchParams)
  const searchParamsString = url.split("?")[1];
  const paramsObject = Object.fromEntries(new URLSearchParams(searchParamsString));

  // Traverse paramsObject to convert JSON strings into JSON object
  for (paramName in paramsObject) {
    const paramValue = paramsObject[paramName];
    paramsObject[paramName] = RQ.Utils.jsonifyValidJSONString(paramValue);
  }

  return paramsObject;
};
/**
 * This code is also copied in responseRuleHandler.js So if you change anything inside this, please update there as well
 * And test across multiple sites using Modify Response Rule
 * @param {Object} json
 * @param {String} path -> "a", "a.b", "a.0.b (If a is an array containing list of objects"
 * @returns value or undefined
 */
RQ.Utils.traverseJsonByPath = (jsonObject, path) => {
  if (!path) return;

  const pathParts = path.split(".");

  try {
    // Reach the last node but not the leaf node.
    for (i = 0; i < pathParts.length - 1; i++) {
      jsonObject = jsonObject[pathParts[i]];
    }

    return jsonObject[pathParts[pathParts.length - 1]];
  } catch (e) {
    /* Do nothing */
  }
};

/**
 * Set given value in an Object at given Path. Modifies the original object.
 * @param {Object} incomingObject Object to be modified
 * @param {String} path example -> "a", "a.b", "a.0.b
 * @param {*} value The value to be path
 * @returns value or undefined
 */
RQ.Utils.setObjectValueAtPath = (incomingObject, path, value) => {
  if (typeof incomingObject !== "object" || Array.isArray(incomingObject) || incomingObject === null) return;

  if (typeof path !== "string") return;

  let schema = incomingObject;
  const pList = path.split(".");
  const len = pList.length;
  for (let i = 0; i < len - 1; i++) {
    const elem = pList[i];
    if (!schema[elem]) schema[elem] = {};
    schema = schema[elem];
  }
  schema[pList[len - 1]] = value;
};

RQ.Utils.isOlderVersion = (version, baseVersion) => {
  return (
    version.localeCompare(baseVersion, undefined, {
      numeric: true,
      sensitivity: "base",
    }) === -1
  );
};

RQ.Utils.getPageSourceOrigin = (url) => {
  if (!url) {
    return null;
  }

  return RQ.Utils.extractUrlComponent(url, RQ.URL_COMPONENTS.ORIGIN);
};

RQ.Utils.fireAjax = (requestURL, async) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", requestURL, async);
    request.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 400) {
          resolve(JSON.parse(this.responseText));
        } else {
          reject();
        }
      }
    };
    request.send();
  });
};

RQ.Utils.getAllSupportedWebURLs = () => {
  const webURLsSet = new Set([RQ.configs.WEB_URL, ...RQ.configs.OTHER_WEB_URLS]);
  return [...webURLsSet];
};

RQ.Utils.isAppURL = (url) => {
  return !!url && RQ.Utils.getAllSupportedWebURLs().some((webURL) => url.includes(webURL));
};
