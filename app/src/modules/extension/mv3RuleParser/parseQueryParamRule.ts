import { QueryParamRule } from "@requestly/shared/types/entities/rules";
import { ExtensionRule, ExtensionRuleAction, QueryParamRuleTransform, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const parseQueryParams = (modifications: QueryParamRule.QueryParamRuleModification[]): QueryParamRuleTransform => {
  const transform: QueryParamRuleTransform = {
    queryTransform: {
      addOrReplaceParams: [],
      removeParams: [],
    },
  };

  for (const modification of modifications) {
    if (modification.type === QueryParamRule.QueryParamModificationType.ADD) {
      transform.queryTransform.addOrReplaceParams.push({
        key: modification.param,
        value: modification.value,
      });
    } else if (modification.type === QueryParamRule.QueryParamModificationType.REMOVE) {
      transform.queryTransform.removeParams.push(modification.param);
    } else {
      // case remove all
      transform.query = "";
      // queryTransform is not needed if query is present
      delete transform.queryTransform;
      break;
    }
  }

  return transform;
};

const parseQueryParamRule = (rule: QueryParamRule.Record): ExtensionRule[] => {
  return rule.pairs.map(
    (rulePair): ExtensionRule => {
      const condition = parseConditionFromSource(rulePair.source);
      const action: ExtensionRuleAction = {
        type: RuleActionType.REDIRECT,
        redirect: {
          transform: parseQueryParams(rulePair.modifications),
        },
      };

      return { action, condition };
    }
  );
};

export default parseQueryParamRule;
