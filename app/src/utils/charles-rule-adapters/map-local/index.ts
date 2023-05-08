import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { generateObjectId } from "utils/FormattingHelper";
import { RuleType, Status, RedirectRule, RedirectDestinationType } from "types";
import { createNewGroupAndSave, getLocation } from "../utils";
import { CharlesRuleType, MapLocalRule, MapLocalRuleMappings } from "../types";

export const mapLocalRuleAdapter = (appMode: string, rules: MapLocalRule): Promise<void> => {
  return new Promise((resolve, reject) => {
    const mappings = get(rules, "mapLocal.mappings.mapLocalMapping") as MapLocalRuleMappings;
    const updatedMappings = Array.isArray(mappings) ? mappings : [mappings];

    if (!mappings) {
      reject();
      return;
    }

    const exportedRules = updatedMappings.map(({ dest, sourceLocation, enabled }) => {
      const source = getLocation(sourceLocation);
      const rule = getNewRule(RuleType.REDIRECT) as RedirectRule;
      return {
        ...rule,
        isCharlesExported: true,
        name: `${source.value} to ${dest}`,
        status: enabled ? Status.ACTIVE : Status.INACTIVE,
        pairs: [
          {
            ...rule.pairs[0],
            id: generateObjectId(),
            destination: `file://${dest}`,
            destinationType: RedirectDestinationType.MAP_LOCAL,
            source: { ...rule.pairs[0].source, value: source.value, operator: source.operator },
          },
        ],
      };
    });

    const isToolEnabled = get(rules, "mapLocal.toolEnabled");
    createNewGroupAndSave({
      appMode,
      rules: exportedRules,
      status: isToolEnabled,
      onError: reject,
      onSuccess: resolve,
      groupName: CharlesRuleType.MAP_LOCAL,
    });
  });
};
