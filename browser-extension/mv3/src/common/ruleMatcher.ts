import {
  UrlSource,
  SourceKey,
  SourceOperator,
  RuleSourceFilter,
  Rule,
  RuleType,
  SourceFilterTypes,
  RulePair,
  RequestPayloadFilter,
} from "common/types";
import { AJAXRequestDetails } from "../service-worker/services/requestProcessor/types";
import { getUrlObject, isBlacklistedURL } from "../utils";

const toRegex = (regexStr: string): RegExp => {
  const matchRegExp = regexStr.match(new RegExp("^/(.+)/(|i|g|ig|gi)$"));

  if (!matchRegExp) {
    return null;
  }
  try {
    return new RegExp(matchRegExp[1], matchRegExp[2]);
  } catch (e) {
    return null;
  }
};

const checkRegexMatch = (regexString: string, inputString: string): boolean => {
  if (!regexString.startsWith("/")) {
    regexString = `/${regexString}/`; // Keeping enclosing slashes for regex as optional
  }

  const regex = toRegex(regexString);
  return regex?.test(inputString);
};

const createRegexForWildcardString = (wildCardString: string): string => {
  return "/^" + wildCardString.replace(/([?.-])/g, "\\$1").replace(/(\*)/g, "(.*)") + "$/";
};

const checkWildCardMatch = (wildCardString: string, inputString: string): boolean => {
  const regexString = createRegexForWildcardString(wildCardString);
  return checkRegexMatch(regexString, inputString);
};

const extractUrlComponent = (url: string, key: SourceKey): string | null => {
  let urlObj = null;
  try {
    urlObj = new URL(url);
  } catch (err) {
    // NOOP
  }

  if (!urlObj) {
    return undefined;
  }

  switch (key) {
    case SourceKey.URL:
      return url;
    case SourceKey.HOST:
      return urlObj.host;
    case SourceKey.PATH:
      return urlObj.pathname;
  }
};

export const matchSourceUrl = (sourceObject: UrlSource, url: string): boolean => {
  const urlComponent = extractUrlComponent(url, sourceObject.key);
  const value = sourceObject.value;
  const isActive = sourceObject.isActive ?? true;

  if (!isActive) {
    return false;
  }

  if (!urlComponent) {
    return false;
  }

  switch (sourceObject.operator) {
    case SourceOperator.EQUALS:
      if (value === urlComponent) {
        return true;
      }
      break;

    case SourceOperator.CONTAINS:
      if (urlComponent.indexOf(value) !== -1) {
        return true;
      }
      break;

    case SourceOperator.MATCHES: {
      return checkRegexMatch(value, urlComponent);
    }

    case SourceOperator.WILDCARD_MATCHES: {
      return checkWildCardMatch(value, urlComponent);
    }
  }

  return false;
};

const matchRequestWithRuleSourceFilters = function (
  sourceFilters: RuleSourceFilter[],
  requestDetails: AJAXRequestDetails
) {
  if (!sourceFilters || !requestDetails || (Array.isArray(sourceFilters) && sourceFilters?.length === 0)) {
    return true;
  }

  const sourceObject = Array.isArray(sourceFilters) ? sourceFilters[0] : sourceFilters;

  return Object.entries(sourceObject).every(([key, values]) => {
    switch (key) {
      case SourceFilterTypes.PAGE_DOMAINS:
        return values.some((value: string) => {
          // page domains filter should match all subdomains as well
          const url = getUrlObject(requestDetails.initiator);
          const requestInitiatorDomain = url?.hostname || "";
          return requestInitiatorDomain.endsWith(value);
        });
      case SourceFilterTypes.REQUEST_METHOD:
        return values.includes(requestDetails.method);
      case SourceFilterTypes.RESOURCE_TYPE:
        return values.includes(requestDetails.type);
      case SourceFilterTypes.REQUEST_PAYLOAD:
        return matchRequestPayload(values, requestDetails.requestData);
      default:
        return true;
    }
  });
};

const matchRequestPayload = (requestPayloadFilter: RequestPayloadFilter, requestData: any) => {
  if (!requestPayloadFilter) return true;
  if (typeof requestPayloadFilter === "object" && Object.keys(requestPayloadFilter).length === 0) return true;

  // We only allow request payload targeting when requestData is JSON
  if (!requestData || typeof requestData !== "object") return false;
  if (Object.keys(requestData).length === 0) return false;

  const targetedKey = requestPayloadFilter?.key;
  const targetedValue = requestPayloadFilter?.value;

  // tagetedKey is the json path e.g. a.b.0.c
  if (targetedKey && typeof targetedValue !== "undefined") {
    const valueInRequestData = traverseJsonByPath(requestData, targetedKey);
    const operator = requestPayloadFilter?.operator;

    let valueInRequestDataString = "";

    if (typeof valueInRequestData === "object") {
      // Do nothing for now.
      // valueInRequestDataString = JSON.stringify(valueInRequestData);
    } else {
      valueInRequestDataString = valueInRequestData?.toString();
    }

    if (!operator || operator === "Equals") {
      return valueInRequestDataString === targetedValue;
    }

    if (operator === "Contains") {
      return valueInRequestDataString?.includes(targetedValue);
    }
  }

  return false;
};

export const matchRuleWithRequest = function (rule: Rule, requestDetails: AJAXRequestDetails) {
  if (isBlacklistedURL(requestDetails.initiator) || isBlacklistedURL(requestDetails.url)) {
    return {};
  }

  const matchedPair = rule?.pairs?.find(
    (pair) =>
      matchSourceUrl(pair.source, requestDetails.url) &&
      matchRequestWithRuleSourceFilters(pair.source.filters, requestDetails)
  );

  if (!matchedPair) {
    return {
      isApplied: false,
    };
  }

  const destinationUrl = populateRedirectedUrl(matchedPair, rule.ruleType, requestDetails);

  return {
    isApplied: true,
    matchedPair: matchedPair,
    destinationUrl: destinationUrl,
  };
};

/**
 *
 * @param finalString String having $values e.g. http://www.example.com?q=$1&p=$2
 * @param matches Array of matches in Regex and wildcard matches
 * @returns String after replacing $s with match values
 */
export const populateMatchesInString = function (finalString: string, matches: string[]): string {
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

export const populateRedirectedUrl = (rulePair: RulePair, ruleType: RuleType, requestDetails: AJAXRequestDetails) => {
  switch (ruleType) {
    case RuleType.REPLACE:
      const redirectedUrl = requestDetails.url.replace(rulePair.from, rulePair.to);
      if (redirectedUrl === requestDetails.url) {
        return null;
      } else {
        return redirectedUrl;
      }

    case RuleType.REDIRECT: {
      if (rulePair.source.operator === SourceOperator.MATCHES) {
        const matches = toRegex(rulePair.source.value)?.exec(requestDetails.url);

        if (!matches) {
          return rulePair.destination;
        }

        return populateMatchesInString(rulePair.destination, matches);
      } else if (rulePair.source.operator === SourceOperator.WILDCARD_MATCHES) {
        const wildCardString = rulePair.source.value;
        const regexString = createRegexForWildcardString(wildCardString);

        const matches = toRegex(regexString)?.exec(requestDetails.url);

        if (!matches) {
          return rulePair.destination;
        }

        return populateMatchesInString(rulePair.destination, matches);
      } else {
        return rulePair.destination;
      }
    }

    default:
      return null;
  }
};

export const findMatchingRule = (rules: Rule[], requestDetails: AJAXRequestDetails) => {
  for (const rule of rules) {
    const matchedRule = matchRuleWithRequest(rule, requestDetails);
    if (matchedRule.isApplied) {
      return matchedRule;
    }
  }
  return null;
};

/**
 * @param {Object} json
 * @param {String} path -> "a", "a.b", "a.0.b (If a is an array containing list of objects"
 * Also copied in shared/utils.js for the sake of testing
 */
export const traverseJsonByPath = (jsonObject: Record<any, any>, path: string) => {
  if (!path) return;

  const pathParts = path.split(".");

  try {
    // Reach the last node but not the leaf node.
    for (let i = 0; i < pathParts.length - 1; i++) {
      jsonObject = jsonObject[pathParts[i]];
    }

    return jsonObject[pathParts[pathParts.length - 1]];
  } catch (e) {
    /* Do nothing */
  }
};
