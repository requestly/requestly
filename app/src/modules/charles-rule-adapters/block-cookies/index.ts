import { get } from "lodash";
import { BlockCookiesRule, CharlesRuleType, ParsedRule } from "../types";
import { getGroupName, getHeaders, getSourcesData } from "../utils";
import { headersConfig } from "./header-config";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { HeadersRule, RuleType, Status } from "types";

export const blockCookiesRuleAdapter = (rules: BlockCookiesRule): ParsedRule<HeadersRule> => {
  const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch");

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
    type: CharlesRuleType.BLOCK_COOKIES,
    groups: [
      {
        rules: exportedRules,
        status: isToolEnabled,
        name: getGroupName(CharlesRuleType.BLOCK_COOKIES),
      },
    ],
  };
};
