import { RulePairSource, SourceKey, SourceOperator } from "../../../types/rules";
import { BLACKLISTED_DOMAINS } from "../constants";
import { ExtensionRequestMethod, ExtensionResourceType, ExtensionRuleCondition } from "../types";

const createRegexForWildcardString = (value: string): string => {
  // TODO: convert all * to .* and escape all special chars for regex
  return value.replace(/([?.-])/g, "\\$1").replace(/(\*)/g, "(.*)");
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

const parseUrlParametersFromSource = (source: RulePairSource): ExtensionRuleCondition => {
  // rules like query, headers, script, delay can be applied on all URLs
  if (source.value === "") {
    return {
      urlFilter: "*",
    };
  }

  if (source.key === SourceKey.URL) {
    switch (source.operator) {
      case SourceOperator.EQUALS:
        return { urlFilter: `|${source.value}|` };

      case SourceOperator.CONTAINS:
        return { urlFilter: source.value };

      case SourceOperator.MATCHES: {
        const { pattern, flags } = parseRegex(source.value);
        return {
          regexFilter: pattern,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case SourceOperator.WILDCARD_MATCHES:
        return { regexFilter: createRegexForWildcardString(source.value) };
    }
  }

  // Host patterns for operators other than EQUALS may false match other parts of URL as well. TODO: fix
  if (source.key === SourceKey.HOST) {
    switch (source.operator) {
      case SourceOperator.EQUALS:
        return { urlFilter: `||${source.value}^` }; // host.com matches both host.com a.host.com

      case SourceOperator.CONTAINS:
        return { urlFilter: `||${source.value}*^` }; // host.c matches a.host.com but not ahost.com

      case SourceOperator.MATCHES: {
        const { pattern, flags } = parseRegex(source.value);
        return {
          regexFilter: `^https?://${pattern}(/|$)`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case SourceOperator.WILDCARD_MATCHES: {
        const { pattern, flags } = parseRegex(createRegexForWildcardString(source.value));
        return {
          regexFilter: `^https?://${pattern}(/|$)`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }
    }
  }

  if (source.key === SourceKey.PATH) {
    switch (source.operator) {
      case SourceOperator.EQUALS: {
        const path = source.value.startsWith("/") ? source.value : "/" + source.value;
        return { urlFilter: `${path}^` }; // both "/path/to/resource" and "/to/" match https://example.com/path/to/resource. TODO: fix
      }

      case SourceOperator.CONTAINS: {
        if (source.value.startsWith("/")) {
          return { urlFilter: source.value };
        }
        return { urlFilter: `/*${source.value}` }; // TODO: fix
      }

      case SourceOperator.MATCHES:
        return { regexFilter: source.value }; // TODO: fix

      case SourceOperator.WILDCARD_MATCHES:
        return { regexFilter: createRegexForWildcardString(source.value) }; // TODO: fix
    }
  }

  return null;
};

export const parseFiltersFromSource = (source: RulePairSource): ExtensionRuleCondition => {
  const condition: ExtensionRuleCondition = {};
  const filters = source.filters?.filter((filter) => filter !== null);

  const requestMethods = new Set<ExtensionRequestMethod>();
  const resourceTypes = new Set<ExtensionResourceType>();

  filters?.forEach((filter) => {
    filter?.requestMethod?.forEach((method) => {
      requestMethods.add(method.toLowerCase() as ExtensionRequestMethod);
    });
    filter?.resourceType?.forEach((resourceType) => {
      resourceTypes.add(resourceType as ExtensionResourceType);
    });
  });

  if (requestMethods.size) {
    condition.requestMethods = Array.from(requestMethods);
  }

  if (resourceTypes.size) {
    condition.resourceTypes = Array.from(resourceTypes);
  }

  return condition;
};

export const parseConditionFromSource = (source: RulePairSource): ExtensionRuleCondition => {
  return {
    ...parseUrlParametersFromSource(source),
    ...parseFiltersFromSource(source),
    excludedInitiatorDomains: BLACKLISTED_DOMAINS,
    excludedRequestDomains: BLACKLISTED_DOMAINS,
  };
};
