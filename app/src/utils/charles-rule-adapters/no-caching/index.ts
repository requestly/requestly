import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { RuleType, HeadersRule, Status } from "types";
import { StorageService } from "init";
import { createNewGroup } from "components/features/rules/ChangeRuleGroupModal/actions";
import { getSourceUrls, getHeaders } from "../utils";
import { CharlesRuleType, NoCachingRule, SourceUrl } from "../types";
import { headersConfig } from "./headers-config";

// TODO: write test for the same
export const noCachingRuleAdapter = <T = NoCachingRule>(rules: T, appMode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch") as SourceUrl[];

    if (!locations) {
      reject();
      return;
    }

    const sourcesUrls = getSourceUrls(locations);
    const { requestHeaders, responseHeaders } = getHeaders(headersConfig);
    const exportedRules = sourcesUrls.map(({ value, status, operator }) => {
      const rule = getNewRule(RuleType.HEADERS) as HeadersRule;

      return {
        ...rule,
        name: `${value}`,
        isCharlesExported: true,
        status: status ? Status.ACTIVE : Status.INACTIVE,
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
    createNewGroup(
      appMode,
      CharlesRuleType.NO_CACHING,
      (groupId: string) => {
        const updatedRules = exportedRules.map((rule) => ({ ...rule, groupId }));
        StorageService(appMode)
          .saveMultipleRulesOrGroups(updatedRules)
          .then(() => resolve())
          .catch(() => reject());
      },
      null,
      isToolEnabled
    );
  });
};
