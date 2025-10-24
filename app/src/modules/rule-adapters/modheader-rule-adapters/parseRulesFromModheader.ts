import {
  Group,
  HeaderRule,
  RedirectRule,
  Rule,
  RuleSourceFilter,
  RuleSourceKey,
  RuleSourceOperator,
  RuleType,
} from "@requestly/shared/types/entities/rules";
import { getNewGroup, getNewRule } from "components/features/rules/RuleBuilder/actions";

interface ModheaderProfile {
  title: string;
  headers: any[];
  respHeaders: any[];
  urlReplacements: any[];
  cspDirectives: any[];
  reqCookieAppend: any[];
  urlFilters: any[];
  resourceFilters: any[];
  requestMethodFilters: any[];
}

export const parseRulesFromModheader = (modheaderProfiles: ModheaderProfile[]): (Rule | Group)[] => {
  const recordsToBeImported: (Rule | Group)[] = [];

  modheaderProfiles.forEach((modheaderProfile) => {
    if (!modheaderProfile.title) {
      throw new Error("Modheader profile title is missing");
    }

    const group = getNewGroup(`[Modheader] ${modheaderProfile.title}`) as Group;
    recordsToBeImported.push(group);

    const headerRule = parseHeaders(modheaderProfile);
    if (headerRule) {
      headerRule.groupId = group.id;
      recordsToBeImported.push(headerRule);
    }

    const cspHeaderRule = parseCSPHeaders(modheaderProfile);
    if (cspHeaderRule) {
      cspHeaderRule.groupId = group.id;
      recordsToBeImported.push(cspHeaderRule);
    }

    const cookieHeaderRule = parseCookieHeaders(modheaderProfile);
    if (cookieHeaderRule) {
      cookieHeaderRule.groupId = group.id;
      recordsToBeImported.push(cookieHeaderRule);
    }

    const redirectRules = parseRedirectRules(modheaderProfile)?.map((rule) => {
      rule.groupId = group.id;
      return rule;
    });
    if (redirectRules) {
      recordsToBeImported.push(...redirectRules);
    }
  });

  return recordsToBeImported;
};

const parseRedirectRules = (modheaderProfile: ModheaderProfile): Rule[] => {
  const redirectRules = modheaderProfile.urlReplacements?.map((redirect: any) => {
    const newRedirectRule = getNewRule(RuleType.REDIRECT) as RedirectRule.Record;
    const newRedirectRulePair = newRedirectRule.pairs[0];
    newRedirectRulePair.source = {
      key: RuleSourceKey.URL,
      operator: RuleSourceOperator.CONTAINS,
      value: redirect.name,
      filters: parseFilters(modheaderProfile),
    };
    newRedirectRulePair.destination = redirect.value;
    newRedirectRule.name = `[Redirect] ${redirect.name}`;
    newRedirectRule.isModHeaderImport = true;
    return newRedirectRule;
  });

  if (!redirectRules) {
    return null;
  }

  return redirectRules;
};

const parseHeaders = (modheaderProfile: ModheaderProfile): Rule => {
  const requestHeaders = modheaderProfile.headers?.map((header) => ({
    header: header.name,
    value: header.value,
    type:
      header.appendMode === false && header.sendEmptyHeader
        ? HeaderRule.ModificationType.REMOVE
        : HeaderRule.ModificationType.ADD,
  }));

  const responseHeaders = modheaderProfile.respHeaders?.map((header) => ({
    header: header.name,
    value: header.value,
    type:
      header.appendMode === false && header.sendEmptyHeader
        ? HeaderRule.ModificationType.REMOVE
        : HeaderRule.ModificationType.ADD,
  }));

  const newHeaderRule = getNewRule(RuleType.HEADERS) as HeaderRule.Record;
  newHeaderRule.name = `[Headers]`;
  newHeaderRule.isModHeaderImport = true;

  const newHeaderRulePair = newHeaderRule.pairs[0];

  if (!requestHeaders && !responseHeaders) {
    return null;
  }

  newHeaderRulePair.modifications.Request = requestHeaders ?? [];
  newHeaderRulePair.modifications.Response = responseHeaders ?? [];
  newHeaderRulePair.source = { ...parseSourceConditions(modheaderProfile), filters: parseFilters(modheaderProfile) };

  return newHeaderRule;
};

const parseCSPHeaders = (modheaderProfile: ModheaderProfile): Rule => {
  const enabledCSPDirectives = modheaderProfile.cspDirectives?.filter((directive) => directive.enabled);

  const cspValueString = enabledCSPDirectives?.map((directive) => `${directive.name} ${directive.value}`)?.join(";");

  if (!cspValueString) {
    return null;
  }

  const newHeaderRule = getNewRule(RuleType.HEADERS) as HeaderRule.Record;
  newHeaderRule.name = `[CSP Header]`;
  newHeaderRule.isModHeaderImport = true;

  const newHeaderRulePair = newHeaderRule.pairs[0];

  newHeaderRulePair.modifications.Response = [
    {
      header: "Content-Security-Policy",
      value: cspValueString,
      type: HeaderRule.ModificationType.ADD,
    },
  ];

  newHeaderRulePair.source = { ...parseSourceConditions(modheaderProfile), filters: parseFilters(modheaderProfile) };

  return newHeaderRule;
};

const parseCookieHeaders = (modheaderProfile: ModheaderProfile): Rule => {
  const enabledCookies = modheaderProfile.reqCookieAppend?.filter((cookie) => cookie.enabled);

  const cookieString = enabledCookies?.map((cookie) => `${cookie.name}=${cookie.value}`).join(";");

  if (!cookieString) {
    return null;
  }

  const newHeaderRule = getNewRule(RuleType.HEADERS) as HeaderRule.Record;
  newHeaderRule.name = `[Cookie Header]`;
  newHeaderRule.isModHeaderImport = true;

  const newHeaderRulePair = newHeaderRule.pairs[0];
  newHeaderRulePair.modifications.Request = [
    {
      header: "Cookie",
      value: cookieString,
      type: HeaderRule.ModificationType.ADD,
    },
  ];

  newHeaderRulePair.source = { ...parseSourceConditions(modheaderProfile), filters: parseFilters(modheaderProfile) };

  return newHeaderRule;
};

const parseSourceConditions = (modheaderProfile: ModheaderProfile) => {
  const firstEnabledCondition = modheaderProfile.urlFilters?.find((filter) => filter.enabled);

  if (!firstEnabledCondition) {
    return {
      key: RuleSourceKey.URL,
      operator: RuleSourceOperator.CONTAINS,
      value: "",
    };
  }

  return {
    key: RuleSourceKey.URL,
    operator: RuleSourceOperator.MATCHES,
    value: `/${firstEnabledCondition.urlRegex}/`,
  };
};

const parseFilters = (modheaderProfile: ModheaderProfile) => {
  const resourceFilters = modheaderProfile.resourceFilters?.find((filter) => filter.enabled);
  const requestMethodFilters = modheaderProfile.requestMethodFilters?.find((filter) => filter.enabled);

  const sourceFilters: RuleSourceFilter = {};
  if (resourceFilters) {
    sourceFilters.resourceType = resourceFilters.resourceType;
  }
  if (requestMethodFilters) {
    sourceFilters.requestMethod = requestMethodFilters.requestMethod;
  }

  return [sourceFilters];
};
