import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { RuleType } from "common/types";
import { cacheJsonOnPage } from "../../utility-scripts/cacheJson/cacheJsonUtils";

const cacheReplaceRules = async () => {
  const replaceRules = await getEnabledRules(RuleType.REPLACE);

  if (replaceRules.length) {
    cacheJsonOnPage({
      redirectRules: replaceRules.map((rule) => {
        return {
          id: rule.id,
          pairs: rule.pairs,
        };
      }),
    });
  }
};

export const initReplaceRuleHandler = () => {
  onRuleOrGroupChange(cacheReplaceRules);
  cacheReplaceRules();
};
