const RuleMatcher = {};

/**
 *
 * @param finalString String having $values e.g. http://www.example.com?q=$1&p=$2
 * @param matches Array of matches in Regex and wildcard matches
 * @returns String after replacing $s with match values
 */
RuleMatcher.populateMatchesInString = function (finalString, matches) {
  matches.forEach(function (matchValue, index) {
    // First match is the full string in Regex and empty string in wildcard match
    if (index === 0) {
      return;
    }

    // Issue: 73 We should not leave $i in the Url otherwise browser will encode that.
    // Even if match is not found, just replace that placeholder with empty string
    matchValue = matchValue || "";

    // Replace all $index values in destinationUrl with the matched groups
    finalString = finalString.replace(new RegExp("[$]" + index, "g"), matchValue);
  });

  return finalString;
};

/**
 *
 * @param regexString Value Field in source object
 * @param inputString UrlComponent of Source - host/url/path
 * @param finalString destinationurl - We need to place the values of groups in this string e.g. http://yahoo.com?q=$1
 * @returns {*}
 */
RuleMatcher.checkRegexMatch = function (regexString, inputString, finalString) {
  var regex = RQ.Utils.toRegex(regexString),
    matches;

  // Do not match when regex is invalid or regex does not match with Url
  if (!regex || inputString.search(regex) === -1) {
    return null;
  }

  matches = regex.exec(inputString) || [];
  return RuleMatcher.populateMatchesInString(finalString, matches);
};

/**
 *
 * @param wildCardString
 * @param inputString
 * @param finalString
 */
RuleMatcher.checkWildCardMatch = function (wildCardString, inputString, finalString) {
  var matches = [],
    wildCardSplits,
    index,
    substr,
    positionInInput;

  // Wrap wildCardString and inputString with '|' with front and end to handle * in first and last
  wildCardString = "|" + wildCardString + "|";
  inputString = "|" + inputString + "|";

  // Split with '*'
  wildCardSplits = wildCardString.split("*");

  // Traverse over first array, Search the indexOf first[i] in input
  for (index = 0; index < wildCardSplits.length; index++) {
    substr = wildCardSplits[index];
    positionInInput = inputString.indexOf(substr);

    if (positionInInput === -1) {
      return null;
    } else if (positionInInput === 0) {
      matches.push("");
    } else {
      matches.push(inputString.substr(0, positionInInput));
    }

    inputString = inputString.slice(positionInInput + substr.length);
  }

  return RuleMatcher.populateMatchesInString(finalString, matches);
};

/**
 * Checks if intercepted HTTP Request Url matches with any Rule
 *
 * @param sourceObject Object e.g. { key: 'Url/host/path', operator: 'Contains/Matches/Equals', value: 'google' }
 * @param url Url for which HTTP Request is intercepted.
 * @param destination String e.g. 'http://www.example.com?a=$1'
 *
 * @returns Empty string ('') If rule should be applied and source object does not affect resulting url.
 * In some cases like wildcard match or regex match, resultingUrl will be destination+replaced group variables.
 */
RuleMatcher.matchUrlWithRuleSource = function (sourceObject, url, requestUrlTabId, destination) {
  var operator = sourceObject.operator,
    urlComponent = RQ.Utils.extractUrlComponent(url, sourceObject.key),
    value = sourceObject.value,
    blackListedDomains = RQ.BLACK_LIST_DOMAINS || [];

  if (RQ.Utils.isAppURL(window.tabService.getTabUrl(requestUrlTabId))) {
    return null;
  }

  for (var index = 0; index < blackListedDomains.length; index++) {
    if (url.includes(blackListedDomains[index])) {
      return null;
    }
  }

  return RuleMatcher.matchUrlCriteria(urlComponent, operator, value, destination);
};

/**
 * Checks if intercepted HTTP Request Url matches with any Page Source
 *
 * @param sourceObject Object e.g. { key: 'Url/host/path', operator: 'Contains/Matches/Equals', value: 'google' }
 * @param url Url for which HTTP Request is intercepted.
 *
 * @returns Empty string ('') If rule should be applied and source object does not affect resulting url.
 * In some cases like wildcard match or regex match, resultingUrl will be destination+replaced group variables.
 */
RuleMatcher.matchUrlWithPageSource = function (sourceObject, url) {
  var operator = sourceObject.operator,
    urlComponent = RQ.Utils.extractUrlComponent(url, sourceObject.key),
    value = sourceObject.value;

  return RuleMatcher.matchUrlCriteria(urlComponent, operator, value, null);
};

RuleMatcher.matchUrlCriteria = function (urlComponent, operator, value, destination) {
  // urlComponent comes undefined sometimes
  // e.g. pageUrl comes undefined when request is for HTML and tabService returns undefined for -1 tabId
  if (!urlComponent) return;

  const resultingUrl = destination || ""; // Destination Url is not present in all rule types (e.g. Cancel, QueryParam)

  switch (operator) {
    case RQ.RULE_OPERATORS.EQUALS:
      if (value === urlComponent) {
        return resultingUrl;
      }
      break;

    case RQ.RULE_OPERATORS.CONTAINS:
      if (urlComponent.indexOf(value) !== -1) {
        return resultingUrl;
      }
      break;

    case RQ.RULE_OPERATORS.MATCHES: {
      return RuleMatcher.checkRegexMatch(value, urlComponent, resultingUrl);
    }

    case RQ.RULE_OPERATORS.WILDCARD_MATCHES: {
      return RuleMatcher.checkWildCardMatch(value, urlComponent, resultingUrl);
    }
  }

  return null;
};

/**
 *
 * @param pairs RulePairs used in Redirect and Cancel Rules
 * @param url Url which is matched with RulePairs
 * @param requestDetails details of request
 * @returns ResultingUrl which is obtained after applying rulePairs to input Url
 */
RuleMatcher.matchUrlWithRulePairs = function (pairs, url, requestDetails) {
  var pairIndex,
    resultingUrl = url,
    newResultingUrl,
    destination,
    pair;

  for (pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
    pair = pairs[pairIndex];
    destination = typeof pair.destination !== "undefined" ? pair.destination : null; // We pass destination as null in Cancel ruleType

    if (pair?.destination?.startsWith("file://")) {
      continue;
    }

    if (RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, requestDetails)) {
      newResultingUrl = RuleMatcher.matchUrlWithRuleSource(
        pair.source,
        resultingUrl,
        requestDetails.tabId,
        pair.destination
      );
      if (newResultingUrl !== null) {
        resultingUrl = newResultingUrl;
      }
    }
  }

  return resultingUrl !== url ? resultingUrl : null;
};

RuleMatcher.matchRequestWithRuleSourceFilters = function (sourceFilters, requestDetails) {
  if (!sourceFilters || !requestDetails) {
    return true;
  }

  if (!Array.isArray(sourceFilters)) {
    sourceFilters = [sourceFilters];
  }

  return sourceFilters.every((sourceObject) => {
    for (let filter in sourceObject) {
      let filterValues = sourceObject[filter] || [];

      // RQLY-61 Handle pageUrl value is object instead of array So wrap inside array
      if (filterValues?.constructor?.name === "Object") filterValues = [filterValues];

      switch (filter) {
        case RQ.RULE_SOURCE_FILTER_TYPES.PAGE_URL:
          const matched = filterValues.every((pageUrlFilter) =>
            RuleMatcher.matchPageUrlFilter(pageUrlFilter, requestDetails)
          );
          if (!matched) {
            return false;
          }
          break;

        case RQ.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD:
          if (!filterValues.some((requestMethodFilter) => requestDetails.method === requestMethodFilter)) {
            return false;
          }
          break;

        case RQ.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE:
          if (!filterValues.some((requestTypeFilter) => requestDetails.type === requestTypeFilter)) {
            return false;
          }
          break;
      }
    }

    return true;
  });
};

RuleMatcher.matchPageUrlFilter = function (pageUrlFilter, requestDetails) {
  const pageUrl = window.tabService.getTabUrl(requestDetails.tabId);
  return RuleMatcher.matchUrlCriteria(pageUrl, pageUrlFilter.operator, pageUrlFilter.value) !== null;
};

/**
 * Matches given value with predefined function patterns,
 * If pattern exists, replaces the pattern with computed value otherwise returns the original value
 * @param value
 * @param requestDetails
 */
RuleMatcher.matchValueForPredefinedFunctions = function (value, requestDetails) {
  if (!value) return value;

  for (var preDefFuncName in RQ.PreDefinedFunctions) {
    var preDefFunc = RQ.PreDefinedFunctions[preDefFuncName];
    value = preDefFunc.eval(value, requestDetails);
  }

  return value;
};
