import { get } from "lodash";
import { BlockCookiesRule, CharlesRuleType, ParsedRule } from "../types";
import { getHeaders, getSourceUrls } from "../utils";
import { headersConfig } from "./header-config";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { HeadersRule, RuleType, Status } from "types";

export const blockCookiesRuleAdapter = (appMode: string, rules: BlockCookiesRule): Promise<ParsedRule> => {
  return new Promise((resolve, reject) => {
    const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch");

    if (!rules || !locations) {
      reject();
      return;
    }

    const sourceUrls = getSourceUrls(locations);
    const { requestHeaders, responseHeaders } = getHeaders(headersConfig);
    const exportedRules = sourceUrls.map(({ value, status, operator }) => {
      const rule = getNewRule(RuleType.HEADERS) as HeadersRule;
      return {
        ...rule,
        name: `${value}`,
        isCharlesExported: true,
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
    resolve({
      appMode,
      rules: exportedRules,
      status: isToolEnabled,
      groupName: CharlesRuleType.BLOCK_COOKIES,
    });
  });
};
