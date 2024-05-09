import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { Rule, RuleType } from "common/types";
import { matchRequestWithRuleSource, populateRedirectedUrl } from "../ruleMatcher";
import { TAB_SERVICE_DATA, tabService } from "../tabService";
import { AJAXRequestDetails, SessionRuleType } from "./types";
import { forwardAuthHeaderOnRedirect } from "./handleRedirectAuthHeader";

class RequestProcessor {
  cachedRules: Record<string, Rule[]> = {
    redirectRules: [],
    replaceRules: [],
  };

  private updateCachedRules = async () => {
    this.cachedRules.redirectRules = await getEnabledRules(RuleType.REDIRECT);
    this.cachedRules.replaceRules = await getEnabledRules(RuleType.REPLACE);
  };

  constructor() {
    this.updateCachedRules();
    onRuleOrGroupChange(this.updateCachedRules.bind(this));
  }

  findMatchingRule = (rules: Rule[], requestDetails: AJAXRequestDetails): Rule | undefined => {
    return rules.find((rule) => rule.pairs.some((pair) => matchRequestWithRuleSource(pair.source, requestDetails)));
  };

  getRedirectedUrl = (matchedRule: Rule, requestDetails: AJAXRequestDetails) => {
    return populateRedirectedUrl(matchedRule, requestDetails);
  };

  updateRequestSpecificRules = async (
    tabId: number,
    requestUrl: string,
    ruleDetails: {
      action: chrome.declarativeNetRequest.RuleAction;
      condition: chrome.declarativeNetRequest.RuleCondition;
    },
    sessionRuleType?: SessionRuleType
  ) => {
    let ruleId = parseInt(`${Date.now() % 1000000}${Math.floor(Math.random() * 1000)}`);

    const sessionRulesMap = tabService.getData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP);

    let removeRuleIds = [];

    if (sessionRulesMap?.[requestUrl]) {
      ruleId = sessionRulesMap[sessionRuleType][requestUrl];
      removeRuleIds.push(ruleId);
    }

    tabService.setData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP, {
      ...sessionRulesMap,
      [sessionRuleType]: {
        ...sessionRulesMap[sessionRuleType],
        [requestUrl]: ruleId,
      },
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

    await forwardAuthHeaderOnRedirect(tabId, requestDetails);
  };
}

export const requestProcessor = new RequestProcessor();
