import { ResourceType, RuleSourceFilter, RuleType, ScriptObject, ScriptRulePair } from "common/types";
import { isBlacklistedURL } from "../../utils";
import { matchSourceUrl } from "../../common/ruleMatcher";
import { injectScript } from "./utils";
import ruleExecutionHandler from "./ruleExecutionHandler";
import rulesStorageService from "../../rulesStorageService";

const matchResourceTypeFilterWithFrameId = (sourceFilters: RuleSourceFilter[], frameId: number) => {
  const sourceObject = Array.isArray(sourceFilters) ? sourceFilters[0] : sourceFilters;
  // If the resourceType is main_frame,
  // then it should be applied only to the main frame otherwise it should be applied to all frames and return true always
  if (sourceObject?.resourceType?.includes(ResourceType.MainDocument)) {
    return frameId === 0;
  }

  return true;
};

export const applyScriptRules = async (tabId: number, frameId: number, url: string) => {
  if (isBlacklistedURL(url)) {
    return;
  }

  const scriptRules = await rulesStorageService.getEnabledRules(RuleType.SCRIPT);
  const scripts: ScriptObject[] = [];

  const appliedScriptRuleIds = new Set<string>();

  scriptRules.forEach((scriptRule) => {
    scriptRule.pairs.forEach((scriptRulePair: ScriptRulePair) => {
      if (
        matchSourceUrl(scriptRulePair.source, url) &&
        matchResourceTypeFilterWithFrameId(scriptRulePair.source.filters, frameId)
      ) {
        scriptRulePair.scripts.forEach((script) => {
          scripts.push(script);
        });
        appliedScriptRuleIds.add(scriptRule.id);
      }
    });
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
