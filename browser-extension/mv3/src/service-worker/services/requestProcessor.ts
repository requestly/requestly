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
    headerRules: [],
  };

  private updateCachedRules = async () => {
    this.cachedRules.redirectRules = await getEnabledRules(RuleType.REDIRECT);
    this.cachedRules.replaceRules = await getEnabledRules(RuleType.REPLACE);
    this.cachedRules.headerRules = await getEnabledRules(RuleType.HEADERS);
  };

  constructor() {
    this.updateCachedRules();
    onRuleOrGroupChange(this.updateCachedRules.bind(this));
  }

  private forwardIgnoredHeadersOnRedirect = async (tabId: number, requestDetails: AJAXRequestDetails) => {
    if (
      !IGNORED_HEADERS_ON_REDIRECT.some(
        (header) => requestDetails.requestHeaders[header] || requestDetails.requestHeaders[header.toLowerCase()]
      )
    ) {
      return;
    }

    const matchedRule = this.findMatchingRule(
      [...this.cachedRules.redirectRules, ...this.cachedRules.replaceRules],
      requestDetails.url
    );

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
        // Exact URL is not used because for replace rules, a marker query param is add which changes the URL so exact URL doesn't match
        urlFilter: `|${redirectedUrl}`,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
        tabIds: [tabId],
        requestMethods: [requestDetails.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod],
        excludedInitiatorDomains: ["requestly.io", "requestly.com"],
      },
    });
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

  private handlePredefinedFunctions = async (tabId: number, requestDetails: AJAXRequestDetails) => {
    const matchedRule = this.findMatchingRule(this.cachedRules.headerRules, requestDetails.url);

    if (!matchedRule) {
      return;
    }

    const headerKeyValueMap: Record<"Response" | "Request", Record<string, string>> = {
      Request: {},
      Response: {},
    };

    matchedRule.pairs.forEach((pair) => {
      if (matchSourceUrl(pair.source, requestDetails.url)) {
        if (pair.modifications?.Request?.length) {
          pair.modifications.Request.forEach((header) => {
            if (header.value === "rq_request_initiator_origin()") {
              headerKeyValueMap.Request[header.header] = requestDetails.initiatorDomain;
            }
          });
        }

        if (pair.modifications?.Response?.length) {
          pair.modifications.Response.forEach((header) => {
            if (header.value === "rq_request_initiator_origin()") {
              headerKeyValueMap.Response[header.header] = requestDetails.initiatorDomain;
            }
          });
        }
      }
    });

    const ruleAction: {
      requestHeaders?: chrome.declarativeNetRequest.RuleAction["requestHeaders"];
      responseHeaders?: chrome.declarativeNetRequest.RuleAction["responseHeaders"];
    } = {};

    if (Object.keys(headerKeyValueMap.Request).length) {
      ruleAction.requestHeaders = Object.entries(headerKeyValueMap.Request).map(([header, value]) => ({
        header,
        value,
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      }));
    }

    if (Object.keys(headerKeyValueMap.Response).length) {
      ruleAction.responseHeaders = Object.entries(headerKeyValueMap.Response).map(([header, value]) => ({
        header,
        value,
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      }));
    }

    if (!Object.keys(ruleAction).length) {
      return;
    }

    await this.updateRequestSpecificRules(tabId, requestDetails.url, {
      action: {
        ...ruleAction,
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      },
      condition: {
        urlFilter: `|${requestDetails.url}|`,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
        tabIds: [tabId],
        requestMethods: [requestDetails.method.toLowerCase() as chrome.declarativeNetRequest.RequestMethod],
        excludedInitiatorDomains: ["requestly.io", "requestly.com"],
      },
    });
  };

  onBeforeAJAXRequest = async (tabId: number, requestDetails: AJAXRequestDetails): Promise<void> => {
    if (Object.values(this.cachedRules).every((rules) => rules.length === 0)) {
      return;
    }

    await this.forwardIgnoredHeadersOnRedirect(tabId, requestDetails);
    await this.handlePredefinedFunctions(tabId, requestDetails);
  };
}

export const requestProcessor = new RequestProcessor();
