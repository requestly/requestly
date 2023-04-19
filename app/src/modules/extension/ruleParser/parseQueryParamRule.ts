import { QueryParamRule, QueryParamModificationType, QueryParamRuleModification } from "../../../types/rules";
import { ExtensionRule, ExtensionRuleAction, QueryParamRuleTransform, RuleActionType } from "../types";
import { parseConditionFromSource } from "./utils";

const parseQueryParams = (modifications: QueryParamRuleModification[]): QueryParamRuleTransform => {
  const transform: QueryParamRuleTransform = {
    queryTransform: {
      addOrReplaceParams: [],
      removeParams: [],
    },
  };

  modifications.forEach((modification) => {
    if (modification.type === QueryParamModificationType.ADD) {
      transform.queryTransform.addOrReplaceParams.push({
        key: modification.param,
        value: modification.value,
      });
    } else if (modification.type === QueryParamModificationType.REMOVE) {
      transform.queryTransform.removeParams.push(modification.param);
    } else {
      transform.query = "";
    }
  });

  return transform;
};

const parseQueryParamRule = (rule: QueryParamRule): ExtensionRule[] => {
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
