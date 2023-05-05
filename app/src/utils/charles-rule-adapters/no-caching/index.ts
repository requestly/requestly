import { get } from "lodash";
import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import { RuleType, HeadersRule, Status, HeaderRuleActionType } from "types";
import { generateObjectId } from "utils/FormattingHelper";
import { StorageService } from "init";

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

// TODO: write test for the same
export const noCachingRuleAdapter = async <T = NoCachingRule>(rules: T, appMode = "extension"): Promise<any> => {
  // console.log({ rules });

  // need a util for black rule (we have)
  // need a util for black group + updation of that group + save

  const locations = get(rules, "selectedHostsTool.locations.locationPatterns.locationMatch") as Source[];
  const sources = locations.map((source: Source) => {
    const { enabled, location } = source;
    const { host = "", port = "443", protocol = "https", path = "" } = location;

    // TODO: test for wildcards in source
    const url = new URL(`${protocol}://${host}:${port}/${path}`);
    url.search = location.query ?? url.search;
    return { value: url as unknown, status: JSON.parse(enabled ?? "false") };
  });

  const requestHeaders = headers.requestHeaders.map((config) => ({ ...config, id: generateObjectId() }));
  const responseHeaders = headers.responseHeaders.map((config) => ({ ...config, id: generateObjectId() }));

  const exportedRules = sources.map(({ value, status }, index) => {
    const rule = getNewRule(RuleType.HEADERS, true) as HeadersRule;

    rule.name = `untitled_${index}`;
    rule.status = status ? Status.ACTIVE : Status.INACTIVE;
    rule.pairs[0].source.value = value as string;
    rule.pairs[0].modifications.Request = requestHeaders;
    rule.pairs[0].modifications.Response = responseHeaders;

    return rule;
  });

  console.log({ exportedRules });
  StorageService(appMode)
    .saveMultipleRulesOrGroups(exportedRules)
    .then((data) => {
      console.log({ data });
      console.log("------ rules imported successfully -------");
    })
    .catch((error) => console.log("Error in import", error));

  // 1. get the empty rule of current equivalent rule type [done]
  // 2. prefill it [done]
  // 3. save [TODO........] saveMultipleRulesOrGroups
  // 4. repeat
};
