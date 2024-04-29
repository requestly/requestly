import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { RequestRulePair, RuleType } from "common/types";
import { cacheJsonOnPage } from "../../utility-scripts/cacheJson/cacheJsonUtils";

const cacheRequestRules = async () => {
  const requestRules = await getEnabledRules(RuleType.REQUEST);

  if (!requestRules.length) {
    return;
  }

  cacheJsonOnPage({
    requestRules: requestRules.map((rule) => {
      const requestRulePair = rule.pairs[0] as RequestRulePair;
      return {
        id: rule.id,
        source: requestRulePair.source,
        request: requestRulePair.request,
      };
    }),
  });
};

export const initRequestRuleHandler = () => {
  onRuleOrGroupChange(cacheRequestRules);
  cacheRequestRules();
};
