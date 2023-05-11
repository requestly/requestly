import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { generateObjectId } from "utils/FormattingHelper";
import { RuleType, Status, RedirectRule, RedirectDestinationType } from "types";
import { getLocation } from "../utils";
import { CharlesRuleType, MapRemoteRule, MapRemoteRuleMappings, ParsedRule } from "../types";

export const mapRemoteAdapter = (appMode: string, rules: MapRemoteRule): Promise<ParsedRule> => {
  return new Promise((resolve, reject) => {
    const mappings = get(rules, "map.mappings.mapMapping") as MapRemoteRuleMappings;
    const updatedMappings = Array.isArray(mappings) ? mappings : [mappings];

    if (!rules || !mappings) {
      reject();
      return;
    }

    const exportedRules = updatedMappings.map(({ sourceLocation, destLocation, enabled }) => {
      const source = getLocation(sourceLocation);
      const destination = getLocation(destLocation);
      const rule = getNewRule(RuleType.REDIRECT) as RedirectRule;
      return {
        ...rule,
        isCharlesExported: true,
        name: `${source.value} to ${destination.value}`,
        status: enabled ? Status.ACTIVE : Status.INACTIVE,
        pairs: [
          {
            ...rule.pairs[0],
            id: generateObjectId(),
            destination: destination.value,
            destinationType: RedirectDestinationType.URL,
            source: { ...rule.pairs[0].source, value: source.value, operator: source.operator },
          },
        ],
      };
    });

    const isToolEnabled = get(rules, "map.toolEnabled");
    resolve({
      appMode,
      rules: exportedRules,
      status: isToolEnabled,
      groupName: CharlesRuleType.MAP_REMOTE,
    });
  });
};
