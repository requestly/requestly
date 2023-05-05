import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { RuleType, HeadersRule, Status } from "types";
import { generateObjectId } from "utils/FormattingHelper";
import { StorageService } from "init";
import { createNewGroup } from "components/features/rules/ChangeRuleGroupModal/actions";
import { getSourceUrls } from "../utils";
import { HeadersConfig, NoCachingRule, SourceUrl } from "../types";
import { headersConfig } from "./headers-config";

const getHeaders = (headersConfig: HeadersConfig) => {
  const requestHeaders = headersConfig.requestHeaders.map((config) => ({ ...config, id: generateObjectId() }));
  const responseHeaders = headersConfig.responseHeaders.map((config) => ({ ...config, id: generateObjectId() }));
  return { requestHeaders, responseHeaders };
};

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
    const exportedRules = sourcesUrls.map(({ value, status, operator }, index) => {
      const rule = getNewRule(RuleType.HEADERS) as HeadersRule;

      return {
        ...rule,
        isCharlesExport: true,
        name: `untitled_${index}`,
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

    createNewGroup(appMode, "No Caching", (groupId: string) => {
      const updatedRules = exportedRules.map((rule) => ({ ...rule, groupId }));
      StorageService(appMode)
        .saveMultipleRulesOrGroups(updatedRules)
        .then(() => resolve())
        .catch(() => reject());
    });
  });
};
