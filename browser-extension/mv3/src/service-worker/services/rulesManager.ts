import config from "common/config";
import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { getVariable, onVariableChange, setVariable, Variable } from "../variable";
import { Rule } from "common/types";
import { getRecords } from "common/storage";
import { CLIENT_MESSAGES } from "common/constants";
import { isExtensionEnabled } from "./utils";
import { TAB_SERVICE_DATA, tabService } from "./tabService";

const ALL_RESOURCE_TYPES = Object.values(chrome.declarativeNetRequest.ResourceType);

interface RuleIdsMap {
  [id: string]: string;
}

const getExecutedRuleIds = async (tabId: number): Promise<string[]> => {
  return chrome.tabs.sendMessage(tabId, {
    action: CLIENT_MESSAGES.GET_APPLIED_RULES,
  });
};

export const handleRuleExecutionsOnClientPageLoad = async (tabId: number) => {
  const cachedAppliedRuleIds = tabService.getData(tabId, TAB_SERVICE_DATA.APPLIED_RULE_DETAILS, []);
  if (cachedAppliedRuleIds.length) {
    chrome.tabs
      .sendMessage(tabId, {
        action: CLIENT_MESSAGES.SYNC_APPLIED_RULES,
        appliedRuleIds: cachedAppliedRuleIds,
      })
      .then(() => {
        tabService.removeData(tabId, TAB_SERVICE_DATA.APPLIED_RULE_DETAILS);
      });
  }
};

export const getExecutedRules = async (tabId: number): Promise<Rule[]> => {
  const { rulesMatchedInfo } = await chrome.declarativeNetRequest.getMatchedRules({
    tabId,
  });

  const nonDNRExecutedRules = await getExecutedRuleIds(tabId);

  const appliedRuleIds = new Set<string>(nonDNRExecutedRules);

  const ruleIdsMap = await getVariable<RuleIdsMap>(Variable.ENABLED_RULE_IDS_MAP, {});

  rulesMatchedInfo.forEach(
    (matchedRule) =>
      matchedRule.rule.rulesetId === "_dynamic" && appliedRuleIds.add(ruleIdsMap[matchedRule.rule.ruleId])
  );

  if (appliedRuleIds.size > 0) {
    return getRecords(Array.from(appliedRuleIds));
  }

  return [];
};

const updateDynamicRules = async (options: chrome.declarativeNetRequest.UpdateRuleOptions): Promise<void> => {
  return new Promise((resolve) => {
    chrome.declarativeNetRequest.updateDynamicRules(options, resolve);
  });
};

const deleteExtensionRules = async (): Promise<void> => {
  const extensionRules = await chrome.declarativeNetRequest.getDynamicRules();

  await updateDynamicRules({
    removeRuleIds: extensionRules.map((extensionRule) => extensionRule.id),
  });
};

const addExtensionRules = async (): Promise<void> => {
  const enabledRules = await getEnabledRules();
  const parsedExtensionRules: chrome.declarativeNetRequest.Rule[] = [];

  const ruleIdsMap = await getVariable<RuleIdsMap>(Variable.ENABLED_RULE_IDS_MAP, {});

  enabledRules.forEach((rule) => {
    const extensionRules = rule.extensionRules;
    if (extensionRules?.length) {
      extensionRules.forEach((extensionRule) => {
        if (!extensionRule.condition.resourceTypes?.length) {
          extensionRule.condition.resourceTypes = ALL_RESOURCE_TYPES;
        }

        const ruleId = parsedExtensionRules.length + 1;

        parsedExtensionRules.push({
          ...extensionRule,
          id: ruleId,
        });

        ruleIdsMap[ruleId] = rule.id;

        setVariable(Variable.ENABLED_RULE_IDS_MAP, ruleIdsMap);
      });
    }
  });

  if (config.logLevel === "debug") {
    console.log("Setting extension rules from requestly rules", parsedExtensionRules, enabledRules);
  }

  await updateDynamicRules({
    addRules: parsedExtensionRules,
  });
};

const applyExtensionRules = async (): Promise<void> => {
  await deleteExtensionRules();

  const isExtensionStatusEnabled = await isExtensionEnabled();
  if (isExtensionStatusEnabled) {
    await addExtensionRules();
  }
};

export const initRulesManager = async (): Promise<void> => {
  onRuleOrGroupChange(applyExtensionRules);
  onVariableChange(Variable.IS_EXTENSION_ENABLED, applyExtensionRules);
  applyExtensionRules();
};
