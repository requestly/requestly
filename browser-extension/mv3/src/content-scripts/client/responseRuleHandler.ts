import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { ResponseRulePair, RuleType } from "common/types";
import { cacheRulesOnPage } from "../utils";

const cacheResponseRules = async () => {
  const reponseRules = await getEnabledRules(RuleType.RESPONSE);

  if (!reponseRules.length) {
    return;
  }

  cacheRulesOnPage(
    JSON.stringify(
      reponseRules.map((rule) => {
        const responseRulePair = rule.pairs[0] as ResponseRulePair;
        return {
          id: rule.id,
          source: responseRulePair.source,
          response: responseRulePair.response,
        };
      })
    ),
    RuleType.RESPONSE
  );
};

export const initResponseRuleHandler = () => {
  onRuleOrGroupChange(cacheResponseRules);
  cacheResponseRules();
};
