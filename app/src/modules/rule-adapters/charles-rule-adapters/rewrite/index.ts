import { get } from "lodash";
import { CharlesRuleType, ParsedRule, RewriteRule, RewriteRulePair, RewriteSet, SourceData } from "../types";
import { convertToArray, getGroupName, getSourcesData } from "../../utils";
import { rewriteRuleActionTypes } from "./constants";
import {
  createModifyBodyRule,
  createModifyHeaderRule,
  createModifyQueryParamRule,
  createModifyStatusRule,
  createReplaceRule,
} from "./actions";

const getRulesToBeImported = (rewriteRulePairs: RewriteRulePair[], source: SourceData) => {
  return rewriteRulePairs.reduce((result, pair) => {
    switch (rewriteRuleActionTypes[pair.ruleType]) {
      case rewriteRuleActionTypes[1]:
      case rewriteRuleActionTypes[2]:
      case rewriteRuleActionTypes[3]:
        return result.concat(createModifyHeaderRule(pair, source));
      case rewriteRuleActionTypes[4]:
      case rewriteRuleActionTypes[5]:
      case rewriteRuleActionTypes[6]:
        return result.concat(createReplaceRule(pair, source));
      case rewriteRuleActionTypes[7]:
        return result.concat(createModifyBodyRule(pair, source));
      case rewriteRuleActionTypes[8]:
      case rewriteRuleActionTypes[9]:
      case rewriteRuleActionTypes[10]:
        return result.concat(createModifyQueryParamRule(pair, source));
      case rewriteRuleActionTypes[11]:
        return result.concat(createModifyStatusRule(pair, source));
      default:
        return [];
    }
  }, []);
};

export const rewriteRuleAdapter = (rules: RewriteRule): ParsedRule => {
  const rewriteRules = get(rules, "rewrite.sets.rewriteSet");
  const updatedRewriteRules = convertToArray<RewriteSet>(rewriteRules);

  if (!rules || !rewriteRules) {
    return;
  }

  const groupsToBeImported = updatedRewriteRules.reduce(
    (result, { active, hosts, rules }: RewriteSet) => {
      const locations = hosts?.locationPatterns?.locationMatch;

      if (!locations) {
        return result;
      }

      const rewriteRulePairs = convertToArray(rules.rewriteRule);
      const sources = getSourcesData(locations);
      const groups = sources.reduce((result, source) => {
        return [
          ...result,
          {
            status: active && source.status,
            name: getGroupName(source.value),
            rules: getRulesToBeImported(rewriteRulePairs, source),
          },
        ];
      }, []);

      return { ...result, groups: [...(result.groups ?? []), ...groups] } as ParsedRule;
    },
    { type: CharlesRuleType.REWRITE } as ParsedRule
  );

  return groupsToBeImported;
};
