import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { RuleType, HeadersRule, Status, HeaderRuleActionType } from "types";
import { generateObjectId } from "utils/FormattingHelper";
import { StorageService } from "init";
import { createNewGroup } from "components/features/rules/ChangeRuleGroupModal/actions";

type TBoolean = "true" | "false";

export type NoCachingRule = {
  selectedHostsTool: Record<string, unknown>;
  toolEnabled: TBoolean;
  useSelectedLocations: TBoolean;
};

export type Source = {
  enabled: TBoolean;
  location: {
    host: string;
    port?: string;
    protocol?: string;
    path?: string;
    query?: string;
  };
};

const headers = {
  requestHeaders: [
    {
      header: "Pragma",
      value: "no-cache",
      type: HeaderRuleActionType.ADD,
    },
    {
      header: "Cache-Control",
      value: "no-cache",
      type: HeaderRuleActionType.ADD,
    },
    {
      header: "If-Modified-Since",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
    {
      header: "If-None-Match",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
  ],

  responseHeaders: [
    {
      header: "Cache-Control",
      value: "no-cache",
      type: HeaderRuleActionType.ADD,
    },
    {
      header: "Expires",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
    {
      header: "Last-Modified",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
    {
      header: "ETag",
      type: HeaderRuleActionType.REMOVE,
      value: "",
    },
  ],
};

// 1. get the empty rule of current equivalent rule type [done]
// 2. prefill it [done]
// 3. save [TODO........] saveMultipleRulesOrGroups
// 4. support wildcard
// 5. repeat

// 1. save rule and groups in storage and render on UI
// 2. Do clean up
// 3. find proper xml to json converter
// 4. update code

// TODO: write test for the same
export const noCachingRuleAdapter = <T = NoCachingRule>(rules: T, appMode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch") as Source[];

    if (!locations) {
      reject();
      return;
    }

    const sources = locations.map((source: Source) => {
      const { enabled, location } = source;
      const { host = "", port = "443", protocol = "https", path = "", query = "" } = location;

      // TODO: test for wildcards in source
      const url = `${protocol}://${host}:${port}/${path}` + (query ? `?${query}` : ``);
      return { value: url, status: JSON.parse(enabled ?? "false") };
    });

    const requestHeaders = headers.requestHeaders.map((config) => ({ ...config, id: generateObjectId() }));
    const responseHeaders = headers.responseHeaders.map((config) => ({ ...config, id: generateObjectId() }));

    const exportedRules = sources.map(({ value, status }, index) => {
      const rule = getNewRule(RuleType.HEADERS) as HeadersRule;

      rule.name = `untitled_${index}`;
      rule.isCharlesExport = true;
      rule.status = status ? Status.ACTIVE : Status.INACTIVE;
      rule.pairs[0].source.value = value;
      rule.pairs[0].modifications.Request = requestHeaders;
      rule.pairs[0].modifications.Response = responseHeaders;

      return rule;
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
