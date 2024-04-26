import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { RequestRulePair, RuleType } from "common/types";
import { cacheRulesOnPage } from "../utils";

const cacheRequestRules = async () => {
  const requestRules = await getEnabledRules(RuleType.REQUEST);

  if (!requestRules.length) {
    return;
  }

  cacheRulesOnPage(
    JSON.stringify(
      requestRules.map((rule) => {
        const requestRulePair = rule.pairs[0] as RequestRulePair;
        return {
          id: rule.id,
          source: requestRulePair.source,
          request: requestRulePair.request,
        };
      })
    ),
    RuleType.REQUEST
  );
};

export const initRequestRuleHandler = () => {
  onRuleOrGroupChange(cacheRequestRules);
  cacheRequestRules();
};
