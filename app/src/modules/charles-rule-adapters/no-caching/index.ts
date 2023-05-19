import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { RuleType, HeadersRule, Status } from "types";
import { getSourcesData, getHeaders } from "../utils";
import { CharlesRuleType, NoCachingRule, ParsedRule, SourceUrl } from "../types";
import { headersConfig } from "./headers-config";

export const noCachingRuleAdapter = (rules: NoCachingRule): ParsedRule<HeadersRule> => {
  const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch") as SourceUrl[];

  if (!rules || !locations) {
    return;
  }

  const sources = getSourcesData(locations);
  const { requestHeaders, responseHeaders } = getHeaders(headersConfig);
  const exportedRules = sources.map(({ value, status, operator }) => {
    const rule = getNewRule(RuleType.HEADERS) as HeadersRule;

    return {
      ...rule,
      name: `${value}`,
      isCharlesImport: true,
      status: status ? Status.ACTIVE : Status.INACTIVE,
      pairs: [
        {
          ...rule.pairs[0],
          source: { ...rule.pairs[0].source, value, operator },
          modifications: {
            ...rule.pairs[0].modifications,
            Request: [...requestHeaders],
            Response: [...responseHeaders],
          },
        },
      ],
    };
  });

  const isToolEnabled = get(rules, "selectedHostsTool.toolEnabled");
  return {
    type: CharlesRuleType.NO_CACHING,
    groups: [
      {
        rules: exportedRules,
        status: isToolEnabled,
        name: CharlesRuleType.NO_CACHING,
      },
    ],
  };
};
