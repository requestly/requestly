import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { Rule, RuleType } from "common/types";
import { getMatchedRuleForRequest } from "../ruleMatcher";
import { TAB_SERVICE_DATA, tabService } from "../tabService";
import { AJAXRequestDetails, SessionRuleType } from "./types";
import { forwardHeadersOnRedirect } from "./handleHeadersOnRedirect";

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

  findMatchingRule = (rules: Rule[], requestDetails: AJAXRequestDetails) => {
    for (const rule of rules) {
      const matchedRule = getMatchedRuleForRequest(rule, requestDetails);
      if (matchedRule) {
        return matchedRule;
      }
    }
    return null;
  };

  updateRequestSpecificRules = async (
    tabId: number,
    requestUrl: string,
    ruleDetails: {
      action: chrome.declarativeNetRequest.RuleAction;
      condition: chrome.declarativeNetRequest.RuleCondition;
    },
    sessionRuleType: SessionRuleType
  ) => {
    let ruleId = parseInt(`${Date.now() % 1000000}${Math.floor(Math.random() * 1000)}`);

    const sessionRulesMap = tabService.getData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP) ?? {};
    const sessionRuleTypeMap = sessionRulesMap?.[sessionRuleType] ?? {};

    let removeRuleIds = [];

    if (sessionRuleTypeMap[requestUrl]) {
      ruleId = sessionRuleTypeMap[requestUrl];
      removeRuleIds.push(ruleId);
    }

    tabService.setData(tabId, TAB_SERVICE_DATA.SESSION_RULES_MAP, {
      ...sessionRulesMap,
      [sessionRuleType]: {
        ...sessionRuleTypeMap,
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

    await forwardHeadersOnRedirect(tabId, requestDetails);
  };
}

export const requestProcessor = new RequestProcessor();
