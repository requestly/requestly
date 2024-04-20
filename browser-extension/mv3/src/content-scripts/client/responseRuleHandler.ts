import { onRuleOrGroupChange } from "common/rulesStore";
import { RuleType } from "common/types";
import { cacheRulesOnPage } from "../utils";

const cacheResponseRules = async () => cacheRulesOnPage(RuleType.RESPONSE);

export const initResponseRuleHandler = () => {
  onRuleOrGroupChange(cacheResponseRules);
  cacheResponseRules();
};
