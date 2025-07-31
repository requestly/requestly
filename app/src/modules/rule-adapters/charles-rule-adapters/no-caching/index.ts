import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { getSourcesData, getHeaders, getGroupName } from "../../utils";
import { CharlesRuleType, NoCachingRule, ParsedRule, SourceUrl } from "../types";
import { headersConfig } from "./headers-config";
import { HeaderRule, RecordStatus, RuleType } from "@requestly/shared/types/entities/rules";

export const noCachingRuleAdapter = (rules: NoCachingRule): ParsedRule<HeaderRule.Record> => {
  const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch") as SourceUrl[];

  if (!rules || !locations) {
    return;
  }

  const sources = getSourcesData(locations);
  const { requestHeaders, responseHeaders } = getHeaders(headersConfig);
  const exportedRules = sources.map(({ value, status, operator }) => {
    const rule = getNewRule(RuleType.HEADERS) as HeaderRule.Record;

    return {
      ...rule,
      name: `${value}`,
      isCharlesImport: true,
      status: status ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
      pairs: [
        {
          ...rule.pairs[0],
          source: { ...rule.pairs[0].source, value, operator },
          modifications: {
            ...rule.pairs[0].modifications,
            Request: [...requestHeaders],
            Response: [...responseHeaders],
          },
        },
      ],
    };
  });

  const isToolEnabled = get(rules, "selectedHostsTool.toolEnabled");
  return {
    type: CharlesRuleType.NO_CACHING,
    groups: [
      {
        rules: exportedRules,
        status: isToolEnabled,
        name: getGroupName(CharlesRuleType.NO_CACHING),
      },
    ],
  };
};
