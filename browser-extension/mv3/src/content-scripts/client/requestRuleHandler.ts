import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { RequestRulePair, RuleType } from "common/types";
import { executeDynamicScriptOnPage } from "../utils";
import { PUBLIC_NAMESPACE } from "common/constants";

const cacheRequestRules = async () => {
  const requestRules = await getEnabledRules(RuleType.REQUEST);

  executeDynamicScriptOnPage(
    `
    window.${PUBLIC_NAMESPACE}=window.${PUBLIC_NAMESPACE}||{};
    window.${PUBLIC_NAMESPACE}.requestRules=${JSON.stringify(
      requestRules.map((rule) => {
        const requestRulePair = rule.pairs[0] as RequestRulePair;
        return {
          id: rule.id,
          source: requestRulePair.source,
          request: requestRulePair.request,
        };
      })
    )};
    `
  );
};

export const initRequestRuleHandler = () => {
  onRuleOrGroupChange(cacheRequestRules);
  cacheRequestRules();
};
