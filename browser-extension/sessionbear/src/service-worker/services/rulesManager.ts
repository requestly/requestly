import config from "common/config";
import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { getVariable, onVariableChange, setVariable, Variable } from "../variable";
import { isExtensionEnabled } from "./utils";
import { TAB_SERVICE_DATA, tabService } from "./tabService";
import { SessionRuleType } from "./requestProcessor/types";

const ALL_RESOURCE_TYPES = Object.values(chrome.declarativeNetRequest.ResourceType);

interface RuleIdsMap {
  [id: string]: string;
}

const updateDynamicRules = async (options: chrome.declarativeNetRequest.UpdateRuleOptions): Promise<void> => {
  return new Promise((resolve) => {
    chrome.declarativeNetRequest.updateDynamicRules(options, resolve);
  });
};

const deleteExtensionRules = async (): Promise<void> => {
  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
  const sessionRules = await chrome.declarativeNetRequest.getSessionRules();

  await Promise.all([
    updateDynamicRules({
      removeRuleIds: dynamicRules.map((extensionRule) => extensionRule.id),
    }),
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: sessionRules.map((extensionRule) => extensionRule.id),
    }),
  ]);
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

        if (extensionRule.condition.resourceTypes?.length && extensionRule.condition.excludedResourceTypes?.length) {
          extensionRule.condition.resourceTypes = extensionRule.condition.resourceTypes.filter(
            (resourceType) => !extensionRule.condition.excludedResourceTypes.includes(resourceType)
          );
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

export const updateRequestSpecificRules = async (
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
