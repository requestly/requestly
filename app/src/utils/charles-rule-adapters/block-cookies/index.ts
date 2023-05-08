import { get } from "lodash";
import { StorageService } from "init";
import { BlockCookiesRule } from "../types";
import { getHeaders, getSourceUrls } from "../utils";
import { headersConfig } from "./header-config";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { RuleType, Status } from "types";
import { createNewGroup } from "components/features/rules/ChangeRuleGroupModal/actions";

export const blockCookiesAdapter = <T = BlockCookiesRule>(rules: T, appMode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch");
    if (!locations) {
      reject();
      return;
    }
    const sourceUrls = getSourceUrls(locations);
    const { requestHeaders, responseHeaders } = getHeaders(headersConfig);
    const exportedRules = sourceUrls.map(({ value, status, operator }, index) => {
      const rule = getNewRule(RuleType.HEADERS);
      return {
        ...rule,
        isCharlesExport: true,
        name: `block cookies_${value}`,
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

    createNewGroup(appMode, "Block Cookies", (groupId: string) => {
      const updatedRules = exportedRules.map((rule) => ({ ...rule, groupId }));
      StorageService(appMode)
        .saveMultipleRulesOrGroups(updatedRules)
        .then(() => resolve())
        .catch(() => reject());
    });
  });
};
