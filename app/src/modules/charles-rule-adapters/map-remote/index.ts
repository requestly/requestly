import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { generateObjectId } from "utils/FormattingHelper";
import { RuleType, Status, RedirectRule, RedirectDestinationType } from "types";
import { CharlesRuleType, MapRemoteRule, MapRemoteRuleMappings, ParsedRule } from "../types";
import { getLocation } from "../utils";

export const mapRemoteAdapter = (rules: MapRemoteRule): ParsedRule => {
  const mappings = get(rules, "map.mappings.mapMapping") as MapRemoteRuleMappings;
  const updatedMappings = Array.isArray(mappings) ? mappings : [mappings];

  if (!rules || !mappings) {
    return;
  }

  const exportedRules = updatedMappings.map(({ sourceLocation, destLocation, enabled }) => {
    const source = getLocation(sourceLocation);
    const destination = getLocation(destLocation);
    const rule = getNewRule(RuleType.REDIRECT) as RedirectRule;
    return {
      ...rule,
      isCharlesImport: true,
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
  return {
    groups: [
      {
        rules: exportedRules,
        status: isToolEnabled,
        name: CharlesRuleType.MAP_REMOTE,
      },
    ],
  };
};
