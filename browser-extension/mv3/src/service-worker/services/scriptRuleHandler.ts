import { ResourceType, RuleType, ScriptObject, ScriptRulePair } from "common/types";
import { isBlacklistedURL } from "../../utils";
import { matchRuleWithRequest } from "../../common/ruleMatcher";
import { injectScript } from "./utils";
import ruleExecutionHandler from "./ruleExecutionHandler";
import rulesStorageService from "../../rulesStorageService";

export const applyScriptRules = async (tabId: number, frameId: number, url: string, pageUrl: string) => {
  if (isBlacklistedURL(url)) {
    return;
  }

  const scriptRules = await rulesStorageService.getEnabledRules(RuleType.SCRIPT);
  const scripts: ScriptObject[] = [];

  const appliedScriptRuleIds = new Set<string>();

  scriptRules.forEach((scriptRule) => {
    if (
      matchRuleWithRequest(scriptRule, {
        url,
        type: frameId === 0 ? ResourceType.MainDocument : ResourceType.IFrameDocument,
        method: "GET",
        initiator: pageUrl,
      }).isApplied
    ) {
      scriptRule.pairs.forEach((scriptRulePair: ScriptRulePair) => {
        scriptRulePair.scripts.forEach((script) => {
          scripts.push(script);
        });
        appliedScriptRuleIds.add(scriptRule.id);
      });
    }
  });

  for (let script of scripts) {
    await injectScript(script, { tabId, frameIds: [frameId] });
  }

  if (appliedScriptRuleIds.size > 0) {
    // FIXME: Performance can be improved
    scriptRules.forEach((rule) => {
      ruleExecutionHandler.onRuleExecuted(rule, {
        url: url,
        tabId: tabId,
      } as chrome.webRequest.WebRequestDetails);
    });
  }
};
