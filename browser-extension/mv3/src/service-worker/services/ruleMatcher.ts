import {
  UrlSource,
  SourceKey,
  SourceOperator,
  RuleSourceFilter,
  Rule,
  RuleType,
  SourceFilterTypes,
  RulePair,
} from "common/types";
import { AJAXRequestDetails } from "./requestProcessor/types";

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

const extractUrlComponent = (url: string, key: SourceKey): string => {
  const urlObj = new URL(url);

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
  if (!sourceFilters || !requestDetails) {
    return true;
  }

  const sourceObject = Array.isArray(sourceFilters) ? sourceFilters[0] : sourceFilters;

  return Object.entries(sourceObject).every(([key, values]) => {
    switch (key) {
      case SourceFilterTypes.PAGE_DOMAINS:
        return values.includes(requestDetails.initiatorDomain);
      case SourceFilterTypes.REQUEST_METHOD:
        return values.includes(requestDetails.method);
      case SourceFilterTypes.RESOURCE_TYPE:
        return values.includes(requestDetails.type);
      default:
        return true;
    }
  });
};

export const matchRuleWithRequest = function (rule: Rule, requestDetails: AJAXRequestDetails) {
  const matchedPair = rule?.pairs?.find(
    (pair) =>
      matchSourceUrl(pair.source, requestDetails.url) &&
      matchRequestWithRuleSourceFilters(pair.source.filters, requestDetails)
  );

  if (!matchedPair) {
    return null;
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
    if (matchedRule) {
      return matchedRule;
    }
  }
  return null;
};
