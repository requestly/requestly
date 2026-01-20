import { escapeRegExp } from "lodash";
import { BLACKLISTED_DOMAINS } from "../constants";
import { ExtensionRequestMethod, ExtensionResourceType, ExtensionRuleCondition } from "../types";
import { LOGGER as Logger } from "@requestly/utils";
import {
  RulePairSource,
  RuleSourceFilter,
  RuleSourceKey,
  RuleSourceOperator,
} from "@requestly/shared/types/entities/rules";

export const escapeForwardSlashes = (value: string): string => {
  return value.replace(/\//g, "\\/");
};

export const getRegexSubstitutionStringWithIncrementedIndex = (regexSubstitutionString: string, increment = 0) => {
  return regexSubstitutionString.replace(/\$(\d)+/g, (match: string) => {
    const matchedNumber = match.slice(1);
    // The 'match' parameter is the current number found by the regex as a string
    // Convert it to a number, increment it by 1, and return it as a string
    return `$` + (parseInt(matchedNumber, 10) + increment).toString();
  });
};

export const convertRegexSubstitutionStringToDNRSubstitutionString = (regexSubstitutionString: string) => {
  return regexSubstitutionString.replace(/\$(\d)+/g, (match: string) => {
    const matchedNumber = match.slice(1);
    // The 'match' parameter is the current number found by the regex as a string
    // Convert it to a number, increment it by 1, and return it as a string
    return `\\` + parseInt(matchedNumber, 10).toString();
  });
};

export const countCapturingGroups = (regexPattern: string) => {
  var num_groups = new RegExp(regexPattern.toString() + "|").exec("").length - 1;
  return num_groups;
};

const createRegexForWildcardString = (value: string, isWildcardCapturingGroupsEnabled: boolean = true): string => {
  // TODO: convert all * to .* and escape all special chars for regex
  if (isWildcardCapturingGroupsEnabled) {
    return "/" + value.replace(/([?.-])/g, "\\$1").replace(/(\*)/g, "(.*)") + "/";
  } else {
    return "/" + value.replace(/([?.-])/g, "\\$1").replace(/(\*)/g, "(?:.*)") + "/";
  }
};

// regex: /pattern/flags
export const parseRegex = (regex: string): { pattern?: string; flags?: string } => {
  const matchesRegexPattern = regex.match(/^\/(.*)\/([dgimsuy]*)$/);
  if (matchesRegexPattern) {
    const [, pattern, flags] = matchesRegexPattern;
    return { pattern, flags };
  }

  return {};
};

export const parseUrlParametersFromSourceV2 = (
  source: RulePairSource,
  useRegexOnlyFilter: boolean = false,
  isWildcardCapturingGroupsEnabled?: boolean
): ExtensionRuleCondition => {
  // rules like query, headers, script, delay can be applied on all URLs
  if (source.value === "") {
    return {
      regexFilter: ".*",
      isUrlFilterCaseSensitive: true,
    };
  }

  if (source.key === RuleSourceKey.URL) {
    switch (source.operator) {
      case RuleSourceOperator.EQUALS:
        if (useRegexOnlyFilter) {
          return {
            regexFilter: `^${escapeRegExp(source.value)}$`,
            isUrlFilterCaseSensitive: true,
          };
        }

        return {
          urlFilter: `|${source.value}|`,
          isUrlFilterCaseSensitive: true,
        };

      case RuleSourceOperator.CONTAINS:
        if (useRegexOnlyFilter) {
          return {
            regexFilter: `.*${escapeRegExp(source.value)}.*`,
            isUrlFilterCaseSensitive: true,
          };
        }

        return {
          urlFilter: `${source.value}`,
          isUrlFilterCaseSensitive: true,
        };

      case RuleSourceOperator.MATCHES: {
        const { pattern, flags } = parseRegex(source.value);

        if (!pattern) {
          Logger.log("Invalid regex");
          throw new Error("Invalid Regex");
        }

        return {
          // To handle case for regexSubsitution as replaces inplace instead of replace whole. So we match the whole url instead
          // https://linear.app/requestly/issue/ENGG-1831
          // https://arc.net/l/quote/erozzfqb
          regexFilter: `.*?${pattern}.*`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case RuleSourceOperator.WILDCARD_MATCHES: {
        const { pattern, flags } = parseRegex(
          createRegexForWildcardString(source.value, isWildcardCapturingGroupsEnabled)
        );

        if (!pattern) {
          Logger.log("Invalid regex");
          throw new Error("Invalid Regex");
        }

        return {
          regexFilter: `^${pattern}$`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }
    }
  }

  if (source.key === RuleSourceKey.HOST) {
    switch (source.operator) {
      case RuleSourceOperator.EQUALS:
        return {
          regexFilter: `^https?://${escapeRegExp(source.value)}(?:[/?#].*)?$`,
          isUrlFilterCaseSensitive: true,
        };

      case RuleSourceOperator.CONTAINS:
        return {
          regexFilter: `^https?://[a-z0-9:.-]*${escapeRegExp(source.value)}[a-z0-9:.-]*(?:[/?#].*)?$`,
          isUrlFilterCaseSensitive: true,
        };

      case RuleSourceOperator.MATCHES: {
        const { pattern, flags } = parseRegex(source.value);

        if (!pattern) {
          Logger.log("Invalid regex");
          throw new Error("Invalid Regex");
        }

        // Allows only accepted characters in the source incase of open rule (.*, .+, .?)
        const cleanedPattern = pattern.replace(/\.([+*?])/g, "[a-z0-9:.-]$1");
        return {
          regexFilter: `^https?://[a-z0-9:.-]*?${cleanedPattern}[a-z0-9:.-]*(?:[/?#].*)?$`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case RuleSourceOperator.WILDCARD_MATCHES: {
        const { pattern, flags } = parseRegex(
          createRegexForWildcardString(source.value, isWildcardCapturingGroupsEnabled)
        );

        if (!pattern) {
          Logger.log("Invalid regex");
          throw new Error("Invalid Regex");
        }

        // Allows only accepted characters in the source incase of open rule (.*, .+, .?)
        const cleanedPattern = pattern.replace(/\.([+*?])/g, "[a-z0-9:.-]$1");
        return {
          regexFilter: `^https?://${cleanedPattern}(?:[/?#].*)?$`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }
    }
  }

  // TODO: Support path in future

  return null;
};

export const parseFiltersFromSource = (source: RulePairSource): ExtensionRuleCondition => {
  const condition: ExtensionRuleCondition = {};
  const filters =
    Array.isArray(source.filters) && source.filters.length ? source.filters : [source.filters as RuleSourceFilter];

  const requestMethods = new Set<ExtensionRequestMethod>();
  const resourceTypes = new Set<ExtensionResourceType>();
  let pageDomains: string[];

  filters?.forEach((filter) => {
    filter?.requestMethod?.forEach((method) => {
      requestMethods.add(method.toLowerCase() as ExtensionRequestMethod);
    });
    filter?.resourceType?.forEach((resourceType) => {
      resourceTypes.add((resourceType as unknown) as ExtensionResourceType);
    });
    if (filter?.pageDomains?.length) {
      pageDomains = filter?.pageDomains;
    }
  });

  if (requestMethods.size) {
    condition.requestMethods = Array.from(requestMethods);
  }

  if (resourceTypes.size) {
    condition.resourceTypes = Array.from(resourceTypes);
  }

  if (pageDomains?.length) {
    condition.initiatorDomains = pageDomains;
  }

  return condition;
};

export const parseConditionFromSource = (
  source: RulePairSource,
  useRegexOnlyFilter: boolean = false,
  isWildcardCapturingGroupsEnabled?: boolean
): ExtensionRuleCondition => {
  return {
    ...parseUrlParametersFromSourceV2(source, useRegexOnlyFilter, isWildcardCapturingGroupsEnabled),
    ...parseFiltersFromSource(source),
    excludedInitiatorDomains: BLACKLISTED_DOMAINS,
    excludedRequestDomains: BLACKLISTED_DOMAINS,
  };
};
