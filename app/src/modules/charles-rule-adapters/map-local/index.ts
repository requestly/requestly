import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { generateObjectId } from "utils/FormattingHelper";
import { RuleType, Status, RedirectRule, RedirectDestinationType } from "types";
import { getGroupName, getLocation } from "../utils";
import { CharlesRuleType, MapLocalRule, MapLocalRuleMappings, ParsedRule } from "../types";

export const mapLocalRuleAdapter = (rules: MapLocalRule): ParsedRule => {
  const mappings = get(rules, "mapLocal.mappings.mapLocalMapping") as MapLocalRuleMappings;
  const updatedMappings = Array.isArray(mappings) ? mappings : [mappings];

  if (!rules || !mappings) {
    return;
  }

  const exportedRules = updatedMappings.map(({ dest: destination, sourceLocation, enabled }) => {
    const source = getLocation(sourceLocation);
    const rule = getNewRule(RuleType.REDIRECT) as RedirectRule;
    return {
      ...rule,
      isCharlesImport: true,
      name: `${source.value} to ${destination}`,
      status: enabled ? Status.ACTIVE : Status.INACTIVE,
      pairs: [
        {
          ...rule.pairs[0],
          id: generateObjectId(),
          destination: `file://${destination}`,
          destinationType: RedirectDestinationType.MAP_LOCAL,
          source: { ...rule.pairs[0].source, value: source.value, operator: source.operator },
        },
      ],
    };
  });

  const isToolEnabled = get(rules, "mapLocal.toolEnabled");
  return {
    type: CharlesRuleType.MAP_LOCAL,
    groups: [
      {
        rules: exportedRules,
        status: isToolEnabled,
        name: getGroupName(CharlesRuleType.MAP_LOCAL),
      },
    ],
  };
};
