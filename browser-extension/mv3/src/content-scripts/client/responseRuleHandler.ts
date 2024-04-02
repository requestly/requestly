import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { ResponseRulePair, RuleType } from "common/types";
import { executeDynamicScriptOnPage } from "../utils";
import { PUBLIC_NAMESPACE } from "common/constants";

const cacheResponseRules = async () => {
  const reponseRules = await getEnabledRules(RuleType.RESPONSE);

  executeDynamicScriptOnPage(
    `
    window.${PUBLIC_NAMESPACE}=window.${PUBLIC_NAMESPACE}||{};
    window.${PUBLIC_NAMESPACE}.responseRules=${JSON.stringify(
      reponseRules.map((rule) => {
        const responseRulePair = rule.pairs[0] as ResponseRulePair;
        return {
          id: rule.id,
          source: responseRulePair.source,
          response: responseRulePair.response,
        };
      })
    )};
    `
  );
};

export const initResponseRuleHandler = () => {
  onRuleOrGroupChange(cacheResponseRules);
  cacheResponseRules();
};
