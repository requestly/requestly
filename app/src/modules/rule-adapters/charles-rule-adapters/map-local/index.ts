import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { generateObjectId } from "utils/FormattingHelper";
import { getGroupName, getLocation } from "../../utils";
import { CharlesRuleType, MapLocalRule, MapLocalRuleMappings, ParsedRule } from "../types";
import { RecordStatus, RedirectRule, RuleType } from "@requestly/shared/types/entities/rules";

export const mapLocalRuleAdapter = (rules: MapLocalRule): ParsedRule => {
  const mappings = get(rules, "mapLocal.mappings.mapLocalMapping") as MapLocalRuleMappings;
  const updatedMappings = Array.isArray(mappings) ? mappings : [mappings];

  if (!rules || !mappings) {
    return;
  }

  const exportedRules = updatedMappings.map(({ dest: destination, sourceLocation, enabled }) => {
    const source = getLocation(sourceLocation);
    const rule = getNewRule(RuleType.REDIRECT) as RedirectRule.Record;
    return {
      ...rule,
      isCharlesImport: true,
      name: `${source.value} to ${destination}`,
      status: enabled ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...rule.pairs[0],
          id: generateObjectId(),
          destination: `file://${destination}`,
          destinationType: RedirectRule.DestinationType.MAP_LOCAL,
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
