import config from "common/config";
import { getEnabledRules, onRuleOrGroupChange } from "common/rulesStore";
import { onVariableChange, Variable } from "../variable";
import { debounce, getBlockedDomains, isExtensionEnabled, onBlockListChange } from "../../utils";
import { TAB_SERVICE_DATA, tabService } from "./tabService";
import { SessionRuleType } from "./requestProcessor/types";
import { EXTENSION_MESSAGES } from "common/constants";
import { UpdateDynamicRuleOptions } from "common/types";
import { sendMessageToApp } from "./messageHandler/sender";

// Object.values(chrome.declarativeNetRequest.ResourceType) cannot be used because in some browsers like safari and firefox
// chrome.declarativeNetRequest.ResourceType is not defined.
const ALL_RESOURCE_TYPES: chrome.declarativeNetRequest.ResourceType[] = [
  "main_frame" as chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
  "sub_frame" as chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
  "stylesheet" as chrome.declarativeNetRequest.ResourceType.STYLESHEET,
  "script" as chrome.declarativeNetRequest.ResourceType.SCRIPT,
  "image" as chrome.declarativeNetRequest.ResourceType.IMAGE,
  "font" as chrome.declarativeNetRequest.ResourceType.FONT,
  "object" as chrome.declarativeNetRequest.ResourceType.OBJECT,
  "xmlhttprequest" as chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
  "ping" as chrome.declarativeNetRequest.ResourceType.PING,
  "csp_report" as chrome.declarativeNetRequest.ResourceType.CSP_REPORT,
  "media" as chrome.declarativeNetRequest.ResourceType.MEDIA,
  "websocket" as chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
  "other" as chrome.declarativeNetRequest.ResourceType.OTHER,
];

const updateDynamicRules = async (options: UpdateDynamicRuleOptions): Promise<void> => {
  const badRQRuleIds = new Set<string>();

  while (true) {
    if (!options.addRules && !options.removeRuleIds) {
      break;
    }

    const addRules = options.addRules?.filter((rule) => !badRQRuleIds.has(rule?.rqRuleId)) ?? [];
    const removeRuleIds = options.removeRuleIds ?? [];

    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: addRules.map((rule) => {
          const dnrRule = { ...rule };
          delete dnrRule.rqRuleId;
          return dnrRule as chrome.declarativeNetRequest.Rule;
        }),
        removeRuleIds,
      });
      break;
    } catch (e) {
      const match = e.message.match(/Rule with id (\d+)/);
      const ruleId = match && parseInt(match[1]);
      const rqRuleId = addRules.find((rule) => rule.id === ruleId)?.rqRuleId;

      if (match && rqRuleId) {
        badRQRuleIds.add(rqRuleId);
      }

      sendMessageToApp({
        action: EXTENSION_MESSAGES.RULE_SAVE_ERROR,
        error: e.message,
        rqRuleId,
      });

      if (!match) {
        console.error(`Error updating dynamic rules: ${e.message}`);
        break;
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
  const parsedExtensionRules: (chrome.declarativeNetRequest.Rule & { rqRuleId?: string })[] = [];

  const blockedDomains = await getBlockedDomains();

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

        extensionRule.condition.excludedInitiatorDomains.push(...blockedDomains);
        extensionRule.condition.excludedRequestDomains.push(...blockedDomains);

        const ruleId = parsedExtensionRules.length + 1;

        parsedExtensionRules.push({
          ...extensionRule,
          id: ruleId,
          rqRuleId: rule.id,
        });
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
  onRuleOrGroupChange(debounce(applyExtensionRules, 500));
  onVariableChange(Variable.IS_EXTENSION_ENABLED, (newValue, oldValue) => {
    console.log(`[initRulesManager.onVariableChange] IS_EXTENSION_ENABLED changed`, {
      newValue,
      oldValue,
    });
    applyExtensionRules();
    deleteAllSessionRules();
  });
  applyExtensionRules();

  onBlockListChange(() => {
    applyExtensionRules();
  });
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
