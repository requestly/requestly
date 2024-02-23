import { PUBLIC_NAMESPACE } from "common/constants";
import { getEnabledRules } from "common/rulesStore";
import { RequestRulePair, RuleType } from "common/types";
import { isBlacklistedURL } from "../../utils";
import { matchSourceUrl } from "./ruleMatcher";
import { injectJSAtRequestSource, isExtensionEnabled, isNonBrowserTab } from "./utils";

const overrideRequest = async (details: chrome.webRequest.WebRequestDetails) => {
  if (isNonBrowserTab(details.tabId)) {
    return;
  }

  if (isBlacklistedURL(details.url)) {
    return;
  }

  if (!(await isExtensionEnabled())) {
    return;
  }

  const enabledRules = await getEnabledRules();
  const matchingRequestRules = enabledRules.filter((rule) => {
    if (rule.ruleType !== RuleType.REQUEST) {
      return false;
    }

    return matchSourceUrl(rule.pairs[0].source, details.url);
  });

  if (matchingRequestRules.length > 0) {
    const requestRule = matchingRequestRules[matchingRequestRules.length - 1]; // last overridden rule is final
    const requestRulePair = requestRule.pairs[0] as RequestRulePair;

    injectJSAtRequestSource(
      `window.${PUBLIC_NAMESPACE}.requestRules['${details.url}'] = ${JSON.stringify({
        id: requestRule.id,
        request: requestRulePair.request,
        source: requestRule.pairs[0].source,
      })};
    `,
      details
    );

    if (requestRulePair.request.type === "code") {
      injectJSAtRequestSource(
        `window.${PUBLIC_NAMESPACE}.requestRules['${details.url}'].evaluator = ${requestRulePair.request.value};`,
        details
      );
    }
  }
};

export const initRequestRuleHandler = () => {
  // @ts-ignore
  chrome.webRequest.onBeforeRequest.addListener(overrideRequest, {
    urls: ["<all_urls>"],
    types: ["xmlhttprequest"],
  });
};
