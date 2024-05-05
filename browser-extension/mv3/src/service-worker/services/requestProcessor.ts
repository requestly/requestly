import { IGNORED_HEADERS_ON_REDIRECT } from "common/constants";
import { getEnabledRules } from "common/rulesStore";
import { Rule, RuleType } from "common/types";
import { matchSourceUrl } from "./ruleMatcher";
import { TAB_SERVICE_DATA, tabService } from "./tabService";
import { updateSessionRules } from "./rulesManager";

interface AJAXRequestDetails {
  url: string;
  method: string;
  type: "xmlhttprequest" | "fetch";
  initiatorDomain: string;
  requestHeaders: Record<string, string>;
}

interface ActionDetails {
  type: ActionType;
  ignoredHeadersValue?: { name: string; value: string }[];
  redirectedUrl?: string;
}

enum ActionType {
  FORWARD_IGNORED_HEADERS = "forward_ignored_headers",
}

export const onBeforeAJAXRequest = async (tabId: number, requestDetails: AJAXRequestDetails) => {
  console.log("!!!debug", "onBeforeAJX", {
    tabId,
    requestDetails,
  });
  const requestActionDetails = await processRequest(requestDetails);

  if (!requestActionDetails) {
    return;
  }

  switch (requestActionDetails.type) {
    case ActionType.FORWARD_IGNORED_HEADERS:
      await forwardIgnoredHeaders(tabId, requestDetails, requestActionDetails);
  }

  return;
};

const processRequest = async (requestDetails: AJAXRequestDetails): Promise<ActionDetails | null> => {
  if (hasIgnoredHeadersInRequest(requestDetails.requestHeaders, requestDetails.url)) {
    const redirectRules = await getEnabledRules(RuleType.REDIRECT);
    const matchedRedirectRule = findMatchingRule(redirectRules, requestDetails.url);

    if (matchedRedirectRule) {
      return createActionDetails(matchedRedirectRule, requestDetails, ActionType.FORWARD_IGNORED_HEADERS);
    }

    const replaceRules = await getEnabledRules(RuleType.REPLACE);
    const matchedReplaceRule = findMatchingRule(replaceRules, requestDetails.url);

    if (matchedReplaceRule) {
      return createActionDetails(matchedReplaceRule, requestDetails, ActionType.FORWARD_IGNORED_HEADERS);
    }
  }

  return null;
};

const forwardIgnoredHeaders = async (
  tabId: number,
  requestDetails: AJAXRequestDetails,
  actionDetails: ActionDetails
) => {
  return updateRequestSpecificRules(tabId, requestDetails.url, {
    action: {
      requestHeaders: actionDetails.ignoredHeadersValue.map((header: { name: string; value: string }) => ({
        header: header.name,
        value: header.value,
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      })),
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
    },
    condition: {
      urlFilter: `|${actionDetails.redirectedUrl}`,
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
      tabIds: [tabId],
      requestMethods: [requestDetails.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod],
      //TODO @nafees87n exclude requestly.io initiator domains for all the session rules
    },
  });
};

const hasIgnoredHeadersInRequest = (requestHeaders: Record<string, string>, url) => {
  if (!requestHeaders) {
    console.log("!!!debug", "no header undefined", {
      requestHeaders,
      url,
    });
  }
  return IGNORED_HEADERS_ON_REDIRECT.some((header) => requestHeaders[header] || requestHeaders[header.toLowerCase()]);
};

const findMatchingRule = (rules: Rule[], url: string): Rule | undefined => {
  return rules.find((rule) => rule.pairs.some((pair) => matchSourceUrl(pair.source, url)));
};

const createActionDetails = (
  matchedRule: Rule,
  requestDetails: AJAXRequestDetails,
  actionType: ActionType
): ActionDetails => {
  switch (actionType) {
    case ActionType.FORWARD_IGNORED_HEADERS:
      return {
        type: ActionType.FORWARD_IGNORED_HEADERS,
        ignoredHeadersValue: IGNORED_HEADERS_ON_REDIRECT.map((header) => ({
          name: header,
          value: requestDetails.requestHeaders[header] || requestDetails.requestHeaders[header.toLowerCase()],
        })),
        redirectedUrl: getRedirectedUrl(requestDetails.url, matchedRule),
      };
  }
};

const getRedirectedUrl = (requestUrl: string, matchedRule: Rule) => {
  const pair = matchedRule.pairs.find((pair) => matchSourceUrl(pair.source, requestUrl));
  const redirectedUrl = pair.destination || requestUrl.replace(pair.from, pair.to);
  if (redirectedUrl === requestUrl) {
    return null;
  }
  return redirectedUrl;
};

const updateRequestSpecificRules = async (
  tabId: number,
  requestUrl: string,
  ruleDetails: {
    action: chrome.declarativeNetRequest.RuleAction;
    condition: chrome.declarativeNetRequest.RuleCondition;
  }
) => {
  let ruleId = parseInt(`${Date.now() % 1000000}${Math.floor(Math.random() * 1000)}`);

  const sessionRulesMap = tabService.getData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP);

  let removeRuleIds = [];

  if (sessionRulesMap?.[requestUrl]) {
    ruleId = sessionRulesMap[requestUrl];
    removeRuleIds.push(ruleId);
  }

  tabService.setData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP, {
    ...sessionRulesMap,
    [requestUrl]: ruleId,
  });

  return updateSessionRules({
    addRules: [
      {
        id: ruleId,
        ...ruleDetails,
      },
    ],
    removeRuleIds,
  });
};
