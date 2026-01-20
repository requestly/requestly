import { get } from "lodash";
import { BlockListRule, CharlesRuleType, ParsedRule } from "../types";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { getGroupName, getSourcesData } from "../../utils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { CancelRule, RecordStatus, ResponseRule, Rule, RuleType } from "@requestly/shared/types/entities/rules";

const generate403ResponseRule = (sourceUrl: string, status: boolean, operator: string) => {
  const rule = getNewRule(RuleType.RESPONSE) as ResponseRule.Record;
  return {
    ...rule,
    isCharlesImport: true,
    name: `${sourceUrl}`,
    status: status ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
    pairs: [
      {
        ...rule.pairs[0],
        source: { ...rule.pairs[0].source, value: sourceUrl, operator },
        response: {
          ...rule.pairs[0].response,
          type: GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE,
          statusCode: "403",
          statusText: "Forbidden",
          resourceType: ResponseRule.ResourceType.REST_API,
          value: RULE_TYPES_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE].RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE,
        },
      },
    ],
  };
};

export const blockListRuleAdapter = (rules: BlockListRule): ParsedRule => {
  const locations = get(rules, "blacklist.locations.locationPatterns.locationMatch");

  if (!rules || !locations) {
    return;
  }

  // If blockingAction is 0, default behaviour (Drop connection)
  // If blockingAction is 1, return 403 response
  const blockingAction = rules?.blacklist.action;
  const sources = getSourcesData(locations);
  const exportedRules = sources.map(({ value, status, operator }) => {
    if (blockingAction === 1) {
      return generate403ResponseRule(value, status, operator);
    }

    const rule = getNewRule(RuleType.CANCEL) as CancelRule.Record;
    return {
      ...rule,
      isCharlesImport: true,
      name: value,
      status: status ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...rule.pairs[0],
          source: { ...rule.pairs[0].source, value, operator },
        },
      ],
    };
  });

  const isToolEnabled = rules?.blacklist.toolEnabled;
  return {
    type: CharlesRuleType.BLOCK_LIST,
    groups: [
      {
        rules: exportedRules as Rule[],
        status: isToolEnabled,
        name: getGroupName(CharlesRuleType.BLOCK_LIST),
      },
    ],
  };
};
