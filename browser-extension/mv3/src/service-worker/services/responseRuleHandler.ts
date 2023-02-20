import { PUBLIC_NAMESPACE } from "common/constants";
import { getEnabledRules } from "common/rulesStore";
import { ResponseRulePair, RuleType } from "common/types";
import { isBlacklistedURL } from "../../utils";
import { matchSourceUrl } from "./ruleMatcher";
import { injectJSAtRequestSource, isNonBrowserTab } from "./utils";

const overrideResponse = async (
  details: chrome.webRequest.WebRequestDetails
) => {
  if (isNonBrowserTab(details.tabId)) {
    return;
  }

  if (isBlacklistedURL(details.url)) {
    return;
  }

  const enabledRules = await getEnabledRules();
  const matchingResponseRules = enabledRules.filter((rule) => {
    if (rule.ruleType !== RuleType.RESPONSE) {
      return false;
    }

    return matchSourceUrl(rule.pairs[0].source, details.url);
  });

  if (matchingResponseRules.length > 0) {
    const responseRule =
      matchingResponseRules[matchingResponseRules.length - 1]; // last overridden response is final
    const responseRulePair = responseRule.pairs[0] as ResponseRulePair;

    injectJSAtRequestSource(
      `window.${PUBLIC_NAMESPACE}.responseRules['${
        details.url
      }'] = ${JSON.stringify({
        id: responseRule.id,
        response: responseRulePair.response,
        source: responseRule.pairs[0].source,
      })};
    `,
      details
    );

    if (responseRulePair.response.type === "code") {
      injectJSAtRequestSource(
        `window.${PUBLIC_NAMESPACE}.responseRules['${details.url}'].evaluator = ${responseRulePair.response.value};`,
        details
      );
    }
  }
};

export const initResponseRuleHandler = () => {
  // @ts-ignore
  chrome.webRequest.onBeforeRequest.addListener(overrideResponse, {
    urls: ["<all_urls>"],
    types: ["xmlhttprequest"],
  });
};
