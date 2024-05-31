import { RulePairSource, SourceFilter, SourceKey, SourceOperator } from "../../../types/rules";
import { BLACKLISTED_DOMAINS } from "../constants";
import { ExtensionRequestMethod, ExtensionResourceType, ExtensionRuleCondition } from "../types";

const escapeForwardSlashes = (value: string): string => {
  return value.replace(/\//g, "\\/");
};

const createRegexForWildcardString = (value: string, isWildcardCapturingGroupsEnabled: boolean = true): string => {
  // TODO: convert all * to .* and escape all special chars for regex
  if (isWildcardCapturingGroupsEnabled) {
    return value.replace(/([?.-])/g, "\\$1").replace(/(\*)/g, "(.*)");
  } else {
    return value.replace(/([?.-])/g, "\\$1").replace(/(\*)/g, "(?:.*)");
  }
};

// regex: /pattern/flags
const parseRegex = (regex: string): { pattern: string; flags?: string } => {
  const matchesRegexPattern = regex.match(/^\/(.*)\/([dgimsuy]*)$/);
  if (matchesRegexPattern) {
    const [, pattern, flags] = matchesRegexPattern;
    return { pattern, flags };
  }
  return { pattern: regex };
};

export const parseUrlParametersFromSourceV2 = (
  source: RulePairSource,
  isWildcardCapturingGroupsEnabled: boolean = true
): ExtensionRuleCondition => {
  // rules like query, headers, script, delay can be applied on all URLs
  if (source.value === "") {
    return {
      regexFilter: ".*",
      isUrlFilterCaseSensitive: true,
    };
  }

  if (source.key === SourceKey.URL) {
    switch (source.operator) {
      case SourceOperator.EQUALS:
        return {
          regexFilter: `^${source.value}$`,
          isUrlFilterCaseSensitive: true,
        };

      case SourceOperator.CONTAINS:
        return {
          regexFilter: `.*${source.value}.*`,
          isUrlFilterCaseSensitive: true,
        };

      case SourceOperator.MATCHES: {
        const { pattern, flags } = parseRegex(source.value);
        return {
          // To handle case for regexSubsitution as replaces inplace instead of replace whole. So we match the whole url instead
          // https://linear.app/requestly/issue/ENGG-1831
          // https://arc.net/l/quote/erozzfqb
          regexFilter: `.*?${pattern}.*`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case SourceOperator.WILDCARD_MATCHES:
        const { pattern, flags } = parseRegex(
          createRegexForWildcardString(source.value, isWildcardCapturingGroupsEnabled)
        );
        return {
          regexFilter: `^${pattern}$`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
    }
  }

  if (source.key === SourceKey.HOST) {
    switch (source.operator) {
      case SourceOperator.EQUALS:
        return {
          regexFilter: `^https?://${source.value}(?:[/?#].*)?$`,
          isUrlFilterCaseSensitive: true,
        };

      case SourceOperator.CONTAINS:
        return {
          regexFilter: `^https?://[a-z0-9:.-]*${source.value}[a-z0-9:.-]*(?:[/?#].*)?$`,
          isUrlFilterCaseSensitive: true,
        };

      case SourceOperator.MATCHES: {
        const { pattern, flags } = parseRegex(source.value);

        // Allows only accepted characters in the source incase of open rule (.*, .+, .?)
        const cleanedPattern = pattern.replace(/\.([+*?])/g, "[a-z0-9:.-]$1");
        return {
          regexFilter: `^https?://[a-z0-9:.-]*?${cleanedPattern}[a-z0-9:.-]*(?:[/?#].*)?$`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case SourceOperator.WILDCARD_MATCHES: {
        const { pattern, flags } = parseRegex(
          createRegexForWildcardString(source.value, isWildcardCapturingGroupsEnabled)
        );

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
    //@ts-ignore
    Array.isArray(source.filters) && source.filters.length ? source.filters : [source.filters as SourceFilter];

  const requestMethods = new Set<ExtensionRequestMethod>();
  const resourceTypes = new Set<ExtensionResourceType>();
  let pageDomains: string[];

  filters?.forEach((filter) => {
    filter?.requestMethod?.forEach((method) => {
      requestMethods.add(method.toLowerCase() as ExtensionRequestMethod);
    });
    filter?.resourceType?.forEach((resourceType) => {
      resourceTypes.add(resourceType as ExtensionResourceType);
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

export const parseConditionFromSource = (source: RulePairSource): ExtensionRuleCondition => {
  return {
    ...parseUrlParametersFromSourceV2(source),
    ...parseFiltersFromSource(source),
    excludedInitiatorDomains: BLACKLISTED_DOMAINS,
    excludedRequestDomains: BLACKLISTED_DOMAINS,
  };
};
