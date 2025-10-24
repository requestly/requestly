import { extractUrlComponent, toRegex, traverseJsonByPath } from "../../utils";
import { PREDEFINED_FUNCTIONS, PATTERNS } from "./predefinedFunctions";
import CONSTANTS from "../../constants";

class RuleMatcher {
  /**
   *
   * @param finalString String having $values e.g. http://www.example.com?q=$1&p=$2
   * @param matches Array of matches in Regex and wildcard matches
   * @returns String after replacing $s with match values
   */
  static populateMatchesInString(finalString, matches) {
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
  }

  /**
   *
   * @param regexString Value Field in source object
   * @param inputString UrlComponent of Source - host/url/path
   * @param finalString destinationURL - We need to place the values of groups in this string e.g. http://yahoo.com?q=$1
   * @returns {*}
   */
  static checkRegexMatch(regexString, inputString, finalString) {
    var regex = toRegex(regexString),
      matches;

    // Do not match when regex is invalid or regex does not match with Url
    if (!regex || inputString.search(regex) === -1) {
      return { destination: null, matches: [] };
    }

    //extract all the matches from regex.exec results and ignore extra properties index, input, groups
    matches = regex.exec(inputString)?.map((match) => match) || [];
    return { destination: RuleMatcher.populateMatchesInString(finalString, matches), matches };
  }

  /**
   *
   * @param wildCardString
   * @param inputString
   * @param finalString
   */
  static checkWildCardMatch(wildCardString, inputString, finalString) {
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
        return { destination: null, matches: [] };
      } else if (positionInInput === 0) {
        matches.push("");
      } else {
        matches.push(inputString.substr(0, positionInInput));
      }

      inputString = inputString.slice(positionInInput + substr.length);
    }

    return { destination: RuleMatcher.populateMatchesInString(finalString, matches), matches };
  }

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
  static matchUrlWithRuleSource(sourceObject, url, destination) {
    return RuleMatcher.matchUrlWithRuleSourceWithExtraInfo(sourceObject, url, destination).destination;
  }

  static matchUrlWithRuleSourceWithExtraInfo(sourceObject, url, destination) {
    var operator = sourceObject.operator,
      urlComponent = extractUrlComponent(url, sourceObject.key),
      value = sourceObject.value,
      blackListedDomains = CONSTANTS.BLACK_LIST_DOMAINS || [];

    for (var index = 0; index < blackListedDomains.length; index++) {
      if (url.indexOf(blackListedDomains[index]) !== -1) {
        return { destination: null };
      }
    }
    return RuleMatcher.matchUrlCriteria(urlComponent, operator, value, destination);
  }

  // Destination Url is not present in all rule types (e.g. Cancel, QueryParam)
  // We return null when urlComponent doesn't match with the value
  // If urlComponent matches with value, we return "" empty string
  static matchUrlCriteria(urlComponent, operator, value, destination) {
    const resultingUrl = destination || "";

    switch (operator) {
      case CONSTANTS.RULE_OPERATORS.EQUALS:
        if (value === urlComponent) {
          return { destination: resultingUrl };
        }
        break;

      case CONSTANTS.RULE_OPERATORS.CONTAINS:
        if (urlComponent.indexOf(value) !== -1) {
          return { destination: resultingUrl };
        }
        break;

      case CONSTANTS.RULE_OPERATORS.MATCHES: {
        return RuleMatcher.checkRegexMatch(value, urlComponent, resultingUrl);
      }

      case CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES: {
        return RuleMatcher.checkWildCardMatch(value, urlComponent, resultingUrl);
      }
    }

    return { destination: null };
  }

  /**
   * @param pair RulePair used in Redirect, Headers etc
   * @param url Url which is matched with RulePairs
   * @param requestDetails details of request
   * @returns ResultingUrl which is obtained after applying rulePairs to input Url
   */
  static matchUrlWithRulePair(pair, url, requestDetails) {
    // We pass destination as null in Cancel ruleType
    let destination = typeof pair.destination !== "undefined" ? pair.destination : null;
    let newResultingUrl = null;

    if (RuleMatcher.matchRequestWithRuleSourceFilters(pair.source.filters, requestDetails)) {
      newResultingUrl = RuleMatcher.matchUrlWithRuleSource(pair.source, url, destination);
    }

    return newResultingUrl;
  }

  /**
   *
   * @param pairs RulePairs used in Redirect and Cancel Rules
   * @param url Url which is matched with RulePairs
   * @param requestDetails details of request
   * @returns ResultingUrl which is obtained after applying rulePairs to input Url
   */
  static matchUrlWithRulePairs(pairs, url, requestDetails) {
    let pairIndex,
      resultingUrl = url,
      newResultingUrl = null;

    for (pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
      newResultingUrl = this.matchUrlWithRulePair(pairs[pairIndex], resultingUrl, requestDetails);
      if (newResultingUrl !== null) {
        resultingUrl = newResultingUrl;
      }
    }

    return resultingUrl !== url ? resultingUrl : null;
  }

  static matchRequestWithRuleSourceFilters(sourceFilters, requestDetails) {
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
          case CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL:
            // eslint-disable-next-line no-case-declarations
            const matched = filterValues.every((pageUrlFilter) =>
              RuleMatcher.matchPageUrlFilter(pageUrlFilter, requestDetails)
            );
            if (!matched) {
              return false;
            }
            break;

          case CONSTANTS.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD:
            if (!filterValues.some((requestMethodFilter) => requestDetails.method === requestMethodFilter)) {
              return false;
            }
            break;

          case CONSTANTS.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE:
            if (!filterValues.some((requestTypeFilter) => requestDetails.type === requestTypeFilter)) {
              return false;
            }
            break;

          case CONSTANTS.RULE_SOURCE_FILTER_TYPES.REQUEST_DATA:
            if (
              // although currently only accepts one entry from UI
              // but this is to be compatible with changes made to accept array of filter values
              !filterValues.some((filterValue) =>
                this.isRequestPayloadFilterApplicable(requestDetails.requestData, filterValue)
              )
            ) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }

  static matchPageUrlFilter(pageUrlFilter, requestDetails) {
    // const pageUrl = window.tabService.getTabUrl(requestDetails.tabId);

    // currently proxy does not pass pageUrl inside request details
    // so for now skipping this filter and then hiding it in the UI
    // Tracked in RQLY-765
    if (!requestDetails.pageUrl) {
      return true;
    }

    const pageUrl = requestDetails.pageUrl;
    if (!Array.isArray(pageUrlFilter)) {
      pageUrlFilter = [pageUrlFilter];
    }
    return pageUrlFilter.every((urlFilter) => {
      return RuleMatcher.matchUrlCriteria(pageUrl, urlFilter.operator, urlFilter.value)?.destination !== null;
    });
  }

  /**
   * Matches given value with predefined function patterns,
   * If pattern exists, replaces the pattern with computed value otherwise returns the original value
   * @param value
   */
  static matchValueForPredefinedFunctions(value, payload = {}) {
    if (!value) return value;

    for (const preDefFuncName in PREDEFINED_FUNCTIONS) {
      const preDefFunc = PREDEFINED_FUNCTIONS[preDefFuncName];

      if (typeof preDefFunc.argumentEvaluator !== "function") {
        return value;
      }

      let argumentPattern;
      if (preDefFunc.argument.constructor === Array && preDefFunc.argument.length > 0) {
        // multiple arguments
        argumentPattern = preDefFunc.argument[0];
        for (var index = 1; index < preDefFunc.argument.length; index++) {
          argumentPattern += "(" + PATTERNS.COMMA + preDefFunc.argument[index] + ")?";
        }
      } else {
        argumentPattern = preDefFunc.argument;
      }

      const pattern = preDefFunc.pattern || new RegExp(preDefFunc.name + "\\(" + argumentPattern + "\\)", "ig");

      value = value.replace(pattern, function (token) {
        var matches = token.match(new RegExp(preDefFunc.name + "\\((.*)\\)", "i")), // extract argument from rq_func(argument)
          args = [];

        if (matches != null && matches.length > 1) {
          matches[1].split(",").forEach(function (arg) {
            args.push(arg.trim());
          });

          return preDefFunc.argumentEvaluator(args, payload);
        }

        return token;
      });
    }

    return value;
  }

  static getHeaderModification(ruleType, rulePair) {
    var modification;

    if (ruleType === CONSTANTS.RULE_TYPES.USERAGENT) {
      return {
        source: rulePair.source,
        target: CONSTANTS.HEADERS_TARGET.REQUEST,
        type: CONSTANTS.MODIFICATION_TYPES.REPLACE,
        header: CONSTANTS.HEADER_NAMES.USER_AGENT,
        value: rulePair.userAgent,
      };
    }

    modification = rulePair;
    modification.source = modification.source || {};
    return modification;
  }

  static addHeader(headers, newHeader) {
    headers.push({ name: newHeader.name, value: newHeader.value });
  }

  static removeHeader(headers, name) {
    for (var i = headers.length - 1; i >= 0; i--) {
      var header = headers[i];
      if (header.name && header.name.toLowerCase() === name.toLowerCase()) {
        headers.splice(i, 1);
      }
    }
  }

  static modifyHeaderIfExists(headers, newHeader) {
    for (var i = headers.length - 1; i >= 0; i--) {
      var header = headers[i];
      if (header.name && header.name.toLowerCase() === newHeader.name.toLowerCase()) {
        header.value = newHeader.value;
        break;
      }
    }
  }

  static replaceHeader(headers, newHeader) {
    this.removeHeader(headers, newHeader.name);
    this.addHeader(headers, newHeader);
  }
  // Copied from browser-extension - browser-extension/mv3/src/common/ruleMatcher.ts
  static isRequestPayloadFilterApplicable(requestData, requestPayloadFilter) {
    if (!requestPayloadFilter) return true;
    if (typeof requestPayloadFilter === "object" && Object.keys(requestPayloadFilter).length === 0) return true;

    // We only allow request payload targeting when requestData is JSON
    if (!requestData || typeof requestData !== "object") return false;
    if (Object.keys(requestData).length === 0) return false;

    requestPayloadFilter = requestPayloadFilter || {};
    const targettedKey = requestPayloadFilter?.key;
    const targettedValue = requestPayloadFilter?.value;

    // tagettedKey is the json path e.g. a.b.0.c
    if (targettedKey && typeof targettedValue !== "undefined") {
      const valueInRequestData = traverseJsonByPath(requestData, targettedKey);
      const operator = requestPayloadFilter?.operator;

      let valueInRequestDataString = "";

      if (typeof valueInRequestData === "object") {
        // Do nothing for now.
        // valueInRequestDataString = JSON.stringify(valueInRequestData);
      } else {
        valueInRequestDataString = valueInRequestData?.toString();
      }

      if (!operator || operator === "Equals") {
        return valueInRequestDataString === targettedValue;
      }

      if (operator === "Contains") {
        return valueInRequestDataString?.includes(targettedValue);
      }
    }

    return false;
  }
}

export default RuleMatcher;
