import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { ResponseRulePair, RuleType } from "common/types";
import { cacheJsonOnPage } from "../../utility-scripts/cacheJson/cacheJsonUtils";

const cacheResponseRules = async () => {
  const responseRules = await getEnabledRules(RuleType.RESPONSE);

  if (!responseRules.length) {
    return;
  }

  cacheJsonOnPage({
    responseRules: responseRules.map((rule) => {
      const responseRulePair = rule.pairs[0] as ResponseRulePair;
      return {
        id: rule.id,
        source: responseRulePair.source,
        response: responseRulePair.response,
      };
    }),
  });
};

export const initResponseRuleHandler = () => {
  onRuleOrGroupChange(cacheResponseRules);
  cacheResponseRules();
};
