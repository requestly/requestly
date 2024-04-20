import { onRuleOrGroupChange } from "common/rulesStore";
import { RuleType } from "common/types";
import { cacheRulesOnPage } from "../utils";

const cacheRequestRules = async () => cacheRulesOnPage(RuleType.REQUEST);

export const initRequestRuleHandler = () => {
  onRuleOrGroupChange(cacheRequestRules);
  cacheRequestRules();
};
