import { get } from "lodash";
import { BlockListRule, CharlesRuleType, ParsedRule } from "../types";
import { getSourceUrls } from "../utils";
import { CancelRule, RuleType, Status, ResponseRuleResourceType, ResponseRule } from "types";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const generate403ResponseRule = (sourceUrl: string, status: boolean, operator: string) => {
  const rule = getNewRule(RuleType.RESPONSE) as ResponseRule;
  return {
    ...rule,
    isCharlesExport: true,
    name: `${sourceUrl}`,
    status: status ? Status.ACTIVE : Status.INACTIVE,
    pairs: [
      {
        ...rule.pairs[0],
        source: { ...rule.pairs[0].source, value: sourceUrl, operator },
        response: {
          ...rule.pairs[0].response,
          type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
          statusCode: "403",
          statusText: "Forbidden",
          resourceType: ResponseRuleResourceType.REST_API,
          value: RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE].RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE,
        },
      },
    ],
  };
};

export const blockListRuleAdapter = (appMode: string, rules: BlockListRule): Promise<ParsedRule> => {
  return new Promise((resolve, reject) => {
    const locations = get(rules, "blacklist.locations.locationPatterns.locationMatch");

    if (!rules || !locations) {
      reject();
      return;
    }

    // If blockingAction is 0, default behaviour (Drop connection)
    // If blockingAction is 1, return 403 response
    const blockingAction = rules?.blacklist.action;
    const sourceUrls = getSourceUrls(locations);
    const exportedRules = sourceUrls.map(({ value, status, operator }) => {
      if (blockingAction === 1) {
        return generate403ResponseRule(value, status, operator);
      }

      const rule = getNewRule(RuleType.CANCEL) as CancelRule;
      return {
        ...rule,
        isCharlesExported: true,
        name: value,
        status: status ? Status.ACTIVE : Status.INACTIVE,
        pairs: [
          {
            ...rule.pairs[0],
            source: { ...rule.pairs[0].source, value, operator },
          },
        ],
      };
    });

    const isToolEnabled = rules?.blacklist.toolEnabled;
    resolve({
      appMode,
      rules: exportedRules,
      status: isToolEnabled,
      groupName: CharlesRuleType.BLOCK_LIST,
    });
  });
};
