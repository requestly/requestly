/**
 * This is a HACK
 * Currently used for making rules from the network interceptor of Desktop App
 */

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { generateObjectId } from "../../../../../utils/FormattingHelper";
import APP_CONSTANTS from "config/constants";
import { saveRule } from "../../../../../views/features/rules/RuleEditor/components/Header/ActionButtons/actions";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import Logger from "lib/logger";

const { RULE_TYPES_CONFIG } = APP_CONSTANTS;

const generate_blank_rule_format = (rule_type, rule_id = null) => {
  if (!rule_id) {
    rule_id = `${rule_type}_${generateObjectId()}`;
  }

  let blankRuleFormat = {
    creationDate: generateObjectCreationDate(),
    description: "",
    groupId: "",
    id: rule_id,
    isSample: false,
    name: rule_id,
    objectType: GLOBAL_CONSTANTS.OBJECT_TYPES.RULE,
    pairs: [],
    ruleType: rule_type,
    status: GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE,
  };

  return blankRuleFormat;
};

export const createResponseRule = (appMode, source_url, response_body, dispatch) => {
  const rule_type = GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE;

  let rule = generate_blank_rule_format(rule_type);
  rule.pairs.push(createResponseRulePair(source_url, response_body));
  saveRule(appMode, dispatch, rule).catch((e) => {
    Logger.log("createResponseRule:Error in create rule:", e);
  });
  return rule;
};

const createResponseRulePair = (source_url, response_body) => {
  const rule_type = GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE;

  let pair = {
    ...RULE_TYPES_CONFIG[rule_type].EMPTY_PAIR_FORMAT,
    id: generateObjectId(),
  };

  pair.source.value = source_url;
  pair.response.value = response_body;

  return pair;
};

export const updateResponseRule = (appMode, rule_id, source_url, response_body, dispatch) => {
  const rule_type = GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE;

  let rule = generate_blank_rule_format(rule_type, rule_id);
  rule.pairs.push(createResponseRulePair(source_url, response_body));
  saveRule(appMode, dispatch, rule).catch((e) => {
    Logger.log("updateResponseRule: Error in saving rule:", e);
  });
};

export const getRuleLevelInitialConfigs = (ruleType) => {
  switch (ruleType) {
    case GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT:
      return {
        preserveCookie: false,
      };
    default:
      return {};
  }
};
