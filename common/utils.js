import CONSTANTS from "./constants";

export const regexFormat = "^/(.+)/(|i|g|ig|gi)$";

export function isValidRegex(regexStr) {
  return regexStr.search(new RegExp(regexFormat)) !== -1;
}

export function toRegex(regexStr) {
  var isRegexStringValid = isValidRegex(regexStr),
    matchRegExp;

  if (!isRegexStringValid) {
    return null;
  }

  matchRegExp = regexStr.match(new RegExp(regexFormat));

  return new RegExp(matchRegExp[1], matchRegExp[2]);
}

/**
 * @param {Object} json
 * @param {String} path -> "a", "a.b", "a.0.b (If a is an array containing list of objects"
 * Also copied in shared/utils.js for the sake of testing
 */
export const traverseJsonByPath = (jsonObject, path) => {
  if (!path) return;

  const pathParts = path.split(".");

  try {
    let i = 0;
    // Reach the last node but not the leaf node.
    for (i = 0; i < pathParts.length - 1; i++) {
      jsonObject = jsonObject[pathParts[i]];
    }

    return jsonObject[pathParts[pathParts.length - 1]];
  } catch (e) {
    /* Do nothing */
    console.log(e);
  }
};

export function isValidUrl(url) {
  return url.search(/^http:|https:|ftp:|javascript:/) === 0;
}

export function getId() {
  return Date.now();
}

export function getCurrentTime() {
  return Date.now();
}

export function formatDate(dateInMilis, format) {
  const d = new Date(dateInMilis);

  if (dateInMilis && format === "yyyy-mm-dd") {
    let month = d.getMonth() + 1,
      date = d.getDate();

    date = String(date).length < 2 ? "0" + date : String(date);
    month = String(month).length < 2 ? "0" + month : String(month);

    return d.getFullYear() + "-" + month + "-" + date;
  }
}

export function reloadPage(wait) {
  wait = wait || 0;

  setTimeout(function () {
    window.location.reload();
  }, wait);
}

export function removeLastPart(str, separater) {
  str = str || "";

  // Return original string when separator is not present
  if (str.indexOf(separater) === -1) {
    return str;
  }

  str = str.split(separater);

  // Remove last part
  str.length--;

  return str.join(separater);
}

export function setCookie(name, value, maxAge) {
  if (document) document.cookie = name + "=" + value + "; path=/" + "; max-age=" + maxAge;
}

export function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document?.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
}

export function eraseCookie(name) {
  setCookie(name, "", 1);
}

/**
 *
 * @param url Url from which component has to be extracted
 * @param name Url component name - host, path, url, query, fragment etc.
 */
export function extractUrlComponent(url, name) {
  const myUrl = new URL(url);

  switch (name) {
    case CONSTANTS.URL_COMPONENTS.URL:
      return url;
    case CONSTANTS.URL_COMPONENTS.PROTOCOL:
      return myUrl.protocol;
    case CONSTANTS.URL_COMPONENTS.HOST:
      return myUrl.host;
    case CONSTANTS.URL_COMPONENTS.PATH:
      return myUrl.pathname;
    case CONSTANTS.URL_COMPONENTS.QUERY:
      return myUrl.search;
    case CONSTANTS.URL_COMPONENTS.HASH:
      return myUrl.hash;
  }

  console.error("Invalid source key", url, name);
}

/**
 *
 * @param queryString e.g. ?a=1&b=2 or a=1 or ''
 * @returns object { paramName -> [value1, value2] }
 */
export function getQueryParamsMap(queryString) {
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
}

/**
 * Convert a map to keyvalue pair string (Used for query params)
 * @param queryParamsMap
 * @returns {string}
 */
export function convertQueryParamMapToString(queryParamsMap) {
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
}

export function getUrlWithoutQueryParamsAndHash(url) {
  var urlWithoutHash = url.split("#")[0];

  return urlWithoutHash.split("?")[0];
}

/**
 * Add a Query Param to URL
 * @param {string} url Url to which query string has to be added
 * @param {string} paramName The paramName to be added
 * @param {string} paramValue The paramValue of the paramName
 * @param {boolean} overwrite Whether to overwrite the existing queryStrign or not
 * @returns {string} A well formatted url with addition of given query param
 */
export function addQueryParamToURL(url, paramName, paramValue, overwrite) {
  let resultingUrl = url,
    urlWithoutQueryParamsAndHash = getUrlWithoutQueryParamsAndHash(url),
    urlHash = extractUrlComponent(url, CONSTANTS.URL_COMPONENTS.HASH),
    queryString = extractUrlComponent(url, CONSTANTS.URL_COMPONENTS.QUERY),
    queryParamsMap = getQueryParamsMap(queryString);

  if (overwrite) {
    queryParamsMap[paramName] = [];
  } else {
    queryParamsMap[paramName] = queryParamsMap[paramName] || [];
  }

  queryParamsMap[paramName].push(paramValue);

  queryString = convertQueryParamMapToString(queryParamsMap);

  resultingUrl = queryString ? urlWithoutQueryParamsAndHash + "?" + queryString : urlWithoutQueryParamsAndHash;
  resultingUrl += urlHash;

  return resultingUrl;
}

/**
 * Adds Delay by running a loop for desired time
 * @param {Number} milliseconds Time in ms for which to add delay
 * @returns {Void} Void
 */
export function addDelay(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
