import { getNewRule } from "components/features/rules/RuleBuilder/actions";
import {
  HeaderRuleActionType,
  HeadersRule,
  RedirectRule,
  Rule,
  RuleType,
  SourceFilter,
  SourceKey,
  SourceOperator,
} from "types";

export const parseRulesFromModheader = (modheaderProfile) => {
  //parse request headers
  //parse response headers
  //parse CSP rules
  // parse source filters and create header rules - use only the enabled filters
  // empty filters array means all requests
  //parse redirect rules
  //parse source filters
  //create rules
  //dump into groups
};

const parseRedirectRules = (modheaderProfile): Rule[] => {
  const redirectRules = modheaderProfile.urlReplacements?.map((redirect: any) => {
    const newRedirectRule = getNewRule(RuleType.REDIRECT) as RedirectRule;
    const newRedirectRulePair = newRedirectRule.pairs[0];
    newRedirectRulePair.source = {
      key: SourceKey.URL,
      operator: SourceOperator.CONTAINS,
      value: redirect.name,
      filters: parseFilters(modheaderProfile),
    };
    newRedirectRulePair.destination = redirect.value;
    return newRedirectRule;
  });

  return redirectRules;
};

const parseHeaders = (modheaderProfile): Rule => {
  const requestHeaders = modheaderProfile.headers?.map((header) => ({
    header: header.name,
    value: header.value,
    type:
      header.appendMode === false && header.sendEmptyHeader ? HeaderRuleActionType.REMOVE : HeaderRuleActionType.ADD,
  }));

  const responseHeaders = modheaderProfile.respHeaders?.map((header) => ({
    header: header.name,
    value: header.value,
    type:
      header.appendMode === false && header.sendEmptyHeader ? HeaderRuleActionType.REMOVE : HeaderRuleActionType.ADD,
  }));

  const newHeaderRule = getNewRule(RuleType.HEADERS) as HeadersRule;
  const newHeaderRulePair = newHeaderRule.pairs[0];
  newHeaderRulePair.modifications.Request = requestHeaders ?? [];
  newHeaderRulePair.modifications.Response = responseHeaders ?? [];
  newHeaderRulePair.source = { ...parseSourceConditions(modheaderProfile), filters: parseFilters(modheaderProfile) };

  return newHeaderRule;
};

const parseCSPHeaders = (modheaderProfile): Rule => {
  const enabledCSPDirectives = modheaderProfile.cspDirectives?.filter((directive) => directive.enabled);

  const cspValueString = enabledCSPDirectives.map((directive) => `${directive.name} ${directive.value}`).join(";");

  const newHeaderRule = getNewRule(RuleType.HEADERS) as HeadersRule;

  const newHeaderRulePair = newHeaderRule.pairs[0];

  newHeaderRulePair.modifications.Response = [
    {
      header: "Content-Security-Policy",
      value: cspValueString,
      type: HeaderRuleActionType.ADD,
    },
  ];

  newHeaderRulePair.source = { ...parseSourceConditions(modheaderProfile), filters: parseFilters(modheaderProfile) };

  return newHeaderRule;
};

const parseCookieHeaders = (modheaderProfile): Rule => {
  const enabledCookies = modheaderProfile.reqCookieAppend?.filter((cookie) => cookie.enabled);

  const cookieString = enabledCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join(";");

  const newHeaderRule = getNewRule(RuleType.HEADERS) as HeadersRule;
  const newHeaderRulePair = newHeaderRule.pairs[0];
  newHeaderRulePair.modifications.Request = [
    {
      header: "Cookie",
      value: cookieString,
      type: HeaderRuleActionType.ADD,
    },
  ];

  newHeaderRulePair.source = { ...parseSourceConditions(modheaderProfile), filters: parseFilters(modheaderProfile) };

  return newHeaderRule;
};

const parseSourceConditions = (modheaderProfile) => {
  const firstEnabledCondition = modheaderProfile.urlFilters?.find((filter) => filter.enabled);

  if (!firstEnabledCondition) {
    return {
      key: SourceKey.URL,
      operator: SourceOperator.CONTAINS,
      value: "",
    };
  }

  return {
    key: SourceKey.URL,
    operator: SourceOperator.MATCHES,
    value: firstEnabledCondition.urlRegex,
  };
};

const parseFilters = (modheaderProfile) => {
  const resourceFilters = modheaderProfile.resourceFilters?.find((filter) => filter.enabled);
  const requestMethodFilters = modheaderProfile.requestMethodFilters?.find((filter) => filter.enabled);

  const sourceFilters: SourceFilter = {};
  if (resourceFilters) {
    sourceFilters.resourceType = resourceFilters.resourceType;
  }
  if (requestMethodFilters) {
    sourceFilters.requestMethod = requestMethodFilters.requestMethod;
  }

  return [sourceFilters];
};
