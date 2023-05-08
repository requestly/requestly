import { get } from "lodash";
import { BlocklistRule, CharlesRuleType } from "../types";
import { getSourceUrls } from "../utils";
import { Rule, CancelRule, RuleType, Status, ResponseRuleResourceType } from "types";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { createNewGroup } from "components/features/rules/ChangeRuleGroupModal/actions";
import { StorageService } from "init";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const generate403ResponseRule = (sourceUrl: string, status: boolean, operator: string) => {
  const rule = getNewRule(RuleType.RESPONSE);
  return {
    ...rule,
    isCharlesExport: true,
    name: `return 403_${sourceUrl}`,
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

export const blocklistAdapter = <T = BlocklistRule>(rules: T, appMode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const locations = get(rules, "blacklist.locations.locationPatterns.locationMatch");
    if (!locations) {
      reject();
      return;
    }

    let exportedRules: Rule[] = [];

    const blockingAction = get(rules, "blacklist.action");
    /* 
        if blockingAction is 0, default behaviour (Drop connection)
        if blocing Action is 1, return 403 response
    */

    const sourceUrls = getSourceUrls(locations);
    sourceUrls.forEach(({ value, status, operator }) => {
      if (blockingAction === 1) {
        const responseRule = generate403ResponseRule(value, status, operator);
        exportedRules.push(responseRule);
      }
      const rule = getNewRule(RuleType.CANCEL) as CancelRule;
      exportedRules.push({
        ...rule,
        isCharlesExport: true,
        name: `block_${value}`,
        status: status ? Status.ACTIVE : Status.INACTIVE,
        pairs: [
          {
            ...rule.pairs[0],
            source: { ...rule.pairs[0].source, value, operator },
          },
        ],
      });
    });

    createNewGroup(appMode, CharlesRuleType.BLOCK_LIST, (groupId: string) => {
      const updatedRules = exportedRules.map((rule) => ({ ...rule, groupId }));
      StorageService(appMode)
        .saveMultipleRulesOrGroups(updatedRules)
        .then(() => resolve())
        .catch(() => reject());
    });
  });
};
