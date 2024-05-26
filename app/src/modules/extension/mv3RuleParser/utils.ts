import { RulePairSource, SourceFilter, SourceKey, SourceOperator } from "../../../types/rules";
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
          // To handle case for regexSubsitution as replaces inplace instead of replace whole. So we match the whole url instead
          // https://linear.app/requestly/issue/ENGG-1831
          // https://arc.net/l/quote/erozzfqb
          regexFilter: `.*?${pattern}.*`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case SourceOperator.WILDCARD_MATCHES:
        return { regexFilter: createRegexForWildcardString(source.value) };
    }
  }

  if (source.key === SourceKey.HOST) {
    switch (source.operator) {
      case SourceOperator.EQUALS:
        return {
          regexFilter: `^(https?://)?(www.)?${source.value}([/:?#].*)?$`,
          // source.value=host.com should match only the domain (host.com) and not match with the subdomain (a.host.com)
        };

      case SourceOperator.CONTAINS:
        return { urlFilter: `||${source.value}*^` }; // host.c matches a.host.com but not ahost.com

      case SourceOperator.MATCHES: {
        const { pattern, flags } = parseRegex(source.value);
        return {
          regexFilter: `^https?://[a-z0-9:.-]*?${pattern}[a-z0-9:.-]*.*`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }

      case SourceOperator.WILDCARD_MATCHES: {
        const { pattern, flags } = parseRegex(createRegexForWildcardString(source.value));
        return {
          regexFilter: `^https?://[a-z0-9:.-]*?${pattern}[a-z0-9:.-]*.*`,
          isUrlFilterCaseSensitive: !flags?.includes("i"),
        };
      }
    }
  }

  // deprecated
  // TODO: to be removed
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
    ...parseUrlParametersFromSource(source),
    ...parseFiltersFromSource(source),
    excludedInitiatorDomains: BLACKLISTED_DOMAINS,
    excludedRequestDomains: BLACKLISTED_DOMAINS,
  };
};
