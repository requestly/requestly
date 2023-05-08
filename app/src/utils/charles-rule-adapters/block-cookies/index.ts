import { get } from "lodash";
import { BlockCookiesRule, CharlesRuleType } from "../types";
import { createNewGroupAndSave, getHeaders, getSourceUrls } from "../utils";
import { headersConfig } from "./header-config";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { HeadersRule, RuleType, Status } from "types";

export const blockCookiesRuleAdapter = <T = BlockCookiesRule>(rules: T, appMode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch");

    if (!locations) {
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
    createNewGroupAndSave({
      appMode,
      rules: exportedRules,
      status: isToolEnabled,
      onError: reject,
      onSuccess: resolve,
      groupName: CharlesRuleType.BLOCK_COOKIES,
    });
  });
};
