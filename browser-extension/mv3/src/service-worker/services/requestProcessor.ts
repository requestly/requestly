import { IGNORED_HEADERS_ON_REDIRECT } from "common/constants";
import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { Rule, RuleType } from "common/types";
import { matchSourceUrl } from "./ruleMatcher";
import { TAB_SERVICE_DATA, tabService } from "./tabService";

interface AJAXRequestDetails {
  url: string;
  method: string;
  type: "xmlhttprequest" | "fetch";
  initiatorDomain: string;
  requestHeaders: Record<string, string>;
}

class RequestProcessor {
  private cachedRules: Record<string, Rule[]> = {
    redirectRules: [],
    replaceRules: [],
  };

  private updateCachedRules = async () => {
    console.log("!!!debug", "cacheRules", this.cachedRules);
    this.cachedRules.redirectRules = await getEnabledRules(RuleType.REDIRECT);
    this.cachedRules.replaceRules = await getEnabledRules(RuleType.REPLACE);
  };

  constructor() {
    this.updateCachedRules();
    onRuleOrGroupChange(this.updateCachedRules.bind(this));
  }

  private forwardIgnoredHeadersOnRedirect = async (tabId: number, requestDetails: AJAXRequestDetails) => {
    if (!this.hasIgnoredHeadersInRequest(requestDetails.requestHeaders)) {
      return;
    }

    if (!this.cachedRules.redirectRules.length && !this.cachedRules.replaceRules.length) {
      return;
    }

    const matchedRule = this.findMatchingRule(
      [...this.cachedRules.redirectRules, ...this.cachedRules.replaceRules],
      requestDetails.url
    );

    console.log("!!!debug", "matched rule", matchedRule);

    if (!matchedRule) {
      return;
    }

    const ignoredHeaderValues = IGNORED_HEADERS_ON_REDIRECT.map((header) => ({
      name: header,
      value: requestDetails.requestHeaders[header] || requestDetails.requestHeaders[header.toLowerCase()],
    }));

    const redirectedUrl = this.getRedirectedUrl(requestDetails.url, matchedRule);

    return this.updateRequestSpecificRules(tabId, requestDetails.url, {
      action: {
        requestHeaders: ignoredHeaderValues.map((header: { name: string; value: string }) => ({
          header: header.name,
          value: header.value,
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
        })),
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      },
      condition: {
        urlFilter: `|${redirectedUrl}`,
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

    return chrome.declarativeNetRequest.updateSessionRules({
      addRules: [
        {
          id: ruleId,
          ...ruleDetails,
        },
      ],
      removeRuleIds,
    });
  };

  onBeforeAJAXRequest = async (tabId: number, requestDetails: AJAXRequestDetails): Promise<void> => {
    if (Object.values(this.cachedRules).every((rules) => rules.length === 0)) {
      return;
    }

    await this.forwardIgnoredHeadersOnRedirect(tabId, requestDetails);
  };
}

export const requestProcessor = new RequestProcessor();
