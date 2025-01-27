import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { generateObjectId } from "utils/FormattingHelper";
import { CharlesRuleType, MapRemoteRule, MapRemoteRuleMappings, ParsedRule } from "../types";
import { getGroupName, getLocation } from "../../utils";
import { RecordStatus, RedirectRule, RuleType } from "@requestly/shared/types/entities/rules";

export const mapRemoteAdapter = (rules: MapRemoteRule): ParsedRule => {
  const mappings = get(rules, "map.mappings.mapMapping") as MapRemoteRuleMappings;
  const updatedMappings = Array.isArray(mappings) ? mappings : [mappings];

  if (!rules || !mappings) {
    return;
  }

  const exportedRules = updatedMappings.map(({ sourceLocation, destLocation, enabled }) => {
    const source = getLocation(sourceLocation);
    const destination = getLocation(destLocation);
    const rule = getNewRule(RuleType.REDIRECT) as RedirectRule.Record;
    return {
      ...rule,
      isCharlesImport: true,
      name: `${source.value} to ${destination.value}`,
      status: enabled ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...rule.pairs[0],
          id: generateObjectId(),
          destination: destination.value,
          destinationType: RedirectRule.DestinationType.URL,
          source: { ...rule.pairs[0].source, value: source.value, operator: source.operator },
        },
      ],
    };
  });

  const isToolEnabled = get(rules, "map.toolEnabled");
  return {
    type: CharlesRuleType.MAP_REMOTE,
    groups: [
      {
        rules: exportedRules,
        status: isToolEnabled,
        name: getGroupName(CharlesRuleType.MAP_REMOTE),
      },
    ],
  };
};
