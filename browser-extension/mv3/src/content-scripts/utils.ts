import { RuleType } from "common/types";

// static scripts can be executed using chrome.scripting.executeScript({file:...})
// but for dynamic scripts, we need to use the following approach
export const cacheRulesOnPage = (rules: string, ruleType: RuleType) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("libs/cacheRules.js");
  script.onload = () => script.remove();
  script.dataset.params = JSON.stringify({ rules, ruleType });
  (document.head || document.documentElement).appendChild(script);
};
