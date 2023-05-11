import { get } from "lodash";
import { ParsedRule, RewriteRule, RewriteSet } from "../types";
import { ReplaceRule, HeadersRule, RequestRule, ResponseRule, QueryParamRule } from "types";
import { convertToArray, getSourceUrls } from "../utils";
import { rewriteRuleActionTypes } from "./constants";
import {
  createModifyBodyRule,
  createModifyHeaderRule,
  createModifyQueryParamRule,
  createModifyStatusRule,
  createReplaceRule,
} from "./actions";

export const rewriteRuleAdapter = (rules: RewriteRule): ParsedRule => {
  const rewriteRules = get(rules, "rewrite.sets.rewriteSet");
  const updatedRewriteRules = convertToArray<RewriteSet>(rewriteRules);

  if (!rules || !rewriteRules) {
    return;
  }

  const groupsToBeImported = updatedRewriteRules.reduce((result, { active, hosts, rules }: RewriteSet) => {
    const locations = hosts?.locationPatterns?.locationMatch;

    if (!locations) {
      return result;
    }

    const rewriteRulePairs = convertToArray(rules.rewriteRule);

    const rulesToBeImported = rewriteRulePairs.reduce((result, pair) => {
      switch (rewriteRuleActionTypes[pair.ruleType]) {
        case rewriteRuleActionTypes[1]:
        case rewriteRuleActionTypes[2]:
        case rewriteRuleActionTypes[3]:
          return result.concat(createModifyHeaderRule(pair));
        case rewriteRuleActionTypes[4]:
        case rewriteRuleActionTypes[5]:
        case rewriteRuleActionTypes[6]:
          return result.concat(createReplaceRule(pair));
        case rewriteRuleActionTypes[7]:
          return result.concat(createModifyBodyRule(pair));
        case rewriteRuleActionTypes[8]:
        case rewriteRuleActionTypes[9]:
        case rewriteRuleActionTypes[10]:
          return result.concat(createModifyQueryParamRule(pair));
        case rewriteRuleActionTypes[11]:
          return result.concat(createModifyStatusRule(pair));
        default:
          return [];
      }
    }, []);

    const sourceUrls = getSourceUrls(locations);
    const groups = sourceUrls.reduce((result, { value, operator, status: groupStatus }) => {
      const updatedRules = rulesToBeImported.map(
        (rule: HeadersRule | QueryParamRule | ReplaceRule | RequestRule | ResponseRule) => ({
          ...rule,
          pairs: [
            {
              ...rule.pairs[0],
              source: { ...rule.pairs[0].source, value, operator },
            },
          ],
        })
      );

      return [...result, { status: active && groupStatus, name: value, rules: updatedRules }];
    }, []);

    console.log({ groups });

    return { ...result, groups: [...(result.groups ?? []), ...groups] } as ParsedRule;
  }, {} as ParsedRule);

  return groupsToBeImported;
};
