import config from "common/config";
import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { getVariable, onVariableChange, setVariable, Variable } from "../variable";
import { isExtensionEnabled } from "../../utils";
import { TAB_SERVICE_DATA, tabService } from "./tabService";
import { SessionRuleType } from "./requestProcessor/types";
import { sendMessageToApp } from "./messageHandler";
import { EXTENSION_MESSAGES } from "common/constants";

const ALL_RESOURCE_TYPES = Object.values(chrome.declarativeNetRequest.ResourceType);

interface RuleIdsMap {
  [id: string]: string;
}

const updateDynamicRules = async (options: chrome.declarativeNetRequest.UpdateRuleOptions): Promise<void> => {
  const ruleIdsMap = await getVariable<RuleIdsMap>(Variable.ENABLED_RULE_IDS_MAP, {});
  const badRQRuleIds = new Set<string>();

  while (true) {
    if (!options.addRules && !options.removeRuleIds) {
      break;
    }

    const addRules = options.addRules?.filter((rule) => !badRQRuleIds.has(ruleIdsMap[rule.id])) ?? [];
    const removeRuleIds = options.removeRuleIds?.filter((ruleId) => !badRQRuleIds.has(ruleIdsMap[ruleId])) ?? [];

    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules,
        removeRuleIds,
      });
      break;
    } catch (e) {
      const match = e.message.match(/Rule with id (\d+)/);
      const ruleId = parseInt(match[1]);
      const rqRuleId = ruleIdsMap[ruleId];
      console.log("!!!debug", "erros", e.code, e.reason);
      if (match && rqRuleId) {
        badRQRuleIds.add(ruleIdsMap[ruleId]);
        sendMessageToApp({
          action: EXTENSION_MESSAGES.RULE_SAVE_ERROR,
          error: {
            reason: e.message,
            errorMessage: `Error while saving rule: ${rqRuleId}`,
            rqRuleId,
          },
        });
      }
    }
  }
  return;
};

const deleteAllDynamicRules = async (): Promise<void> => {
  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

  return updateDynamicRules({
    removeRuleIds: dynamicRules.map((extensionRule) => extensionRule.id),
  });
};

const deleteAllSessionRules = async (): Promise<void> => {
  const sessionRules = await chrome.declarativeNetRequest.getSessionRules();

  return chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: sessionRules.map((extensionRule) => extensionRule.id),
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
  await deleteAllDynamicRules();

  const isExtensionStatusEnabled = await isExtensionEnabled();
  if (isExtensionStatusEnabled) {
    await addExtensionRules();
  }
};

export const initRulesManager = async (): Promise<void> => {
  onRuleOrGroupChange(applyExtensionRules);
  onVariableChange(Variable.IS_EXTENSION_ENABLED, () => {
    applyExtensionRules();
    deleteAllSessionRules();
  });
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
