import { EXTENSION_MESSAGES, PUBLIC_NAMESPACE } from "common/constants";
import { getEnabledRules } from "common/rulesStore";
import { RequestRulePair, ResponseRulePair, RuleType } from "common/types";

// Dynamic because static scripts to be executed using chrome.scripting.executeScript({file:...})
export const executeDynamicScriptOnPage = (code: string) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("libs/executeScript.js");
  script.onload = () => script.remove();
  script.dataset.params = JSON.stringify({ code });
  (document.head || document.documentElement).appendChild(script);
};

export const isExtensionEnabled = (): Promise<boolean> => {
  return chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED });
};

export const cacheRulesOnPage = async (ruleType: RuleType) => {
  const isExtensionStatusEnabled = await isExtensionEnabled();

  if (!isExtensionStatusEnabled) {
    return;
  }

  const rules = await getEnabledRules(ruleType);

  if (!rules.length) {
    return;
  }

  let rulesExposedOnPage;
  if (ruleType === RuleType.REQUEST) {
    rulesExposedOnPage = `
    window.${PUBLIC_NAMESPACE}.requestRules=${JSON.stringify(
      rules.map((rule) => {
        const responseRulePair = rule.pairs[0] as RequestRulePair;
        return {
          id: rule.id,
          source: responseRulePair.source,
          response: responseRulePair.request,
        };
      })
    )};`;
  } else if (ruleType === RuleType.RESPONSE) {
    rulesExposedOnPage = `
    window.${PUBLIC_NAMESPACE}.responseRules=${JSON.stringify(
      rules.map((rule) => {
        const responseRulePair = rule.pairs[0] as ResponseRulePair;
        return {
          id: rule.id,
          source: responseRulePair.source,
          response: responseRulePair.response,
        };
      })
    )};`;
  }

  executeDynamicScriptOnPage(
    `
    window.${PUBLIC_NAMESPACE}=window.${PUBLIC_NAMESPACE}||{};
    ${rulesExposedOnPage}
    `
  );
};
