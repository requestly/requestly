import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { RuleType } from "common/types";
import { cacheJsonOnPage } from "../../utility-scripts/cacheJson/cacheJsonUtils";

const cacheRedirectRules = async () => {
  const redirectRules = await getEnabledRules(RuleType.REDIRECT);

  if (redirectRules.length) {
    cacheJsonOnPage({
      redirectRules: redirectRules.map((rule) => {
        return {
          id: rule.id,
          pairs: rule.pairs,
        };
      }),
    });
  }
};

export const initRedirectRuleHandler = () => {
  onRuleOrGroupChange(cacheRedirectRules);
  cacheRedirectRules();
};
