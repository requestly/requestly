import CONSTANTS from "../../constants";
import ReplaceRuleProcessor from "./processors/ReplaceRuleProcessor";
import RedirectRuleProcessor from "./processors/RedirectRuleProcessor";
import HeadersRuleProcessor from "./processors/HeadersRuleProcessor";
import BlockRequestRuleProcessor from "./processors/BlockRequestRuleProcessor";
import QueryParamsRuleProcessor from "./processors/QueryParamsRuleProcessor";
import ScriptRuleProcessor from "./processors/ScriptRuleProcessor";
import UserAgentRuleProcessor from "./processors/UserAgentRuleProcessor";
import DelayRequestRuleProcessor from "./processors/DelayRequestRuleProcessor";
import ModifyResponseRuleProcessor from "./processors/ModifyResponseRuleProcessor";
import ModifyRequestRuleProcessor from "./processors/ModifyRequestRuleProcessor";

class RuleProcessorFactory {
  static getRuleProcessorInstance(ruleType) {
    switch (ruleType.toLowerCase()) {
      case CONSTANTS.RULE_TYPES.REDIRECT.toLowerCase():
        return RedirectRuleProcessor;
      case CONSTANTS.RULE_TYPES.REPLACE.toLowerCase():
        return ReplaceRuleProcessor;
      case CONSTANTS.RULE_TYPES.HEADERS.toLowerCase():
        return HeadersRuleProcessor;
      case CONSTANTS.RULE_TYPES.CANCEL.toLowerCase():
        return BlockRequestRuleProcessor;
      case CONSTANTS.RULE_TYPES.QUERYPARAM.toLowerCase():
        return QueryParamsRuleProcessor;
      case CONSTANTS.RULE_TYPES.SCRIPT.toLowerCase():
        return ScriptRuleProcessor;
      case CONSTANTS.RULE_TYPES.USERAGENT.toLowerCase():
        return UserAgentRuleProcessor;
      case CONSTANTS.RULE_TYPES.DELAY.toLowerCase():
        return DelayRequestRuleProcessor;
      case CONSTANTS.RULE_TYPES.RESPONSE.toLowerCase():
        return ModifyResponseRuleProcessor;
      case CONSTANTS.RULE_TYPES.REQUEST.toLowerCase():
        return ModifyRequestRuleProcessor;
      default:
        return null;
    }

    // throw new Error("Unable to find Rule Processor for rule type: " + ruleType);
  }
}

export default RuleProcessorFactory;
