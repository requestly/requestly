import { IGNORED_HEADERS_ON_REDIRECT } from "common/constants";
import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
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

class RequestProcessor {
  private cachedRules: Record<string, Rule[]> = {
    redirectRules: [],
    replaceRules: [],
  };

  private cacheRules = async () => {
    this.cachedRules.redirectRules = await getEnabledRules(RuleType.REDIRECT);
    this.cachedRules.replaceRules = await getEnabledRules(RuleType.REPLACE);
  };

  constructor() {
    this.cacheRules();
    onRuleOrGroupChange(this.cacheRules);
  }

  private processRequest = async (requestDetails: AJAXRequestDetails): Promise<ActionDetails | null> => {
    if (this.hasIgnoredHeadersInRequest(requestDetails.requestHeaders)) {
      const matchedRedirectRule = this.findMatchingRule(this.cachedRules.redirectRules, requestDetails.url);

      if (matchedRedirectRule) {
        return this.createActionDetails(matchedRedirectRule, requestDetails, ActionType.FORWARD_IGNORED_HEADERS);
      }

      const matchedReplaceRule = this.findMatchingRule(this.cachedRules.replaceRules, requestDetails.url);

      if (matchedReplaceRule) {
        return this.createActionDetails(matchedReplaceRule, requestDetails, ActionType.FORWARD_IGNORED_HEADERS);
      }
    }

    return null;
  };

  private forwardIgnoredHeaders = async (
    tabId: number,
    requestDetails: AJAXRequestDetails,
    actionDetails: ActionDetails
  ) => {
    return this.updateRequestSpecificRules(tabId, requestDetails.url, {
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

  private hasIgnoredHeadersInRequest = (requestHeaders: Record<string, string>) => {
    return IGNORED_HEADERS_ON_REDIRECT.some((header) => requestHeaders[header] || requestHeaders[header.toLowerCase()]);
  };

  private findMatchingRule = (rules: Rule[], url: string): Rule | undefined => {
    return rules.find((rule) => rule.pairs.some((pair) => matchSourceUrl(pair.source, url)));
  };

  private createActionDetails = (
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
          redirectedUrl: this.getRedirectedUrl(requestDetails.url, matchedRule),
        };
    }
  };

  private getRedirectedUrl = (requestUrl: string, matchedRule: Rule) => {
    const pair = matchedRule.pairs.find((pair) => matchSourceUrl(pair.source, requestUrl));
    const redirectedUrl = pair.destination || requestUrl.replace(pair.from, pair.to);
    if (redirectedUrl === requestUrl) {
      return null;
    }
    return redirectedUrl;
  };

  private updateRequestSpecificRules = async (
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

  onBeforeAJAXRequest = async (tabId: number, requestDetails: AJAXRequestDetails) => {
    if (Object.values(this.cachedRules).every((rules) => rules.length === 0)) {
      return;
    }

    console.time("processRequest");
    const requestActionDetails = await this.processRequest(requestDetails);
    console.timeEnd("processRequest");
    if (!requestActionDetails) {
      return;
    }

    switch (requestActionDetails.type) {
      case ActionType.FORWARD_IGNORED_HEADERS:
        console.time("forwardIgnoredHeaders");
        await this.forwardIgnoredHeaders(tabId, requestDetails, requestActionDetails);
        console.timeEnd("forwardIgnoredHeaders");
    }

    return;
  };
}

export const requestProcessor = new RequestProcessor();
