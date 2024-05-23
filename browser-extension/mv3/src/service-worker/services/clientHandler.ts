import { generateUrlPattern } from "../../utils";
import { WEB_URL, OTHER_WEB_URLS } from "../../../../config/dist/config.build.json";
import { isExtensionEnabled } from "./utils";
import { Variable, onVariableChange } from "../variable";
import { RequestRulePair, ResponseRulePair, RuleType } from "common/types";
import rulesStorageService from "../../rulesStorageService";

const CLIENT_SCRIPT_ID = "client-script";
const excludeMatchesPatterns = [WEB_URL, ...OTHER_WEB_URLS].map(generateUrlPattern).filter((pattern) => !!pattern);

declare const window: {
  responseRules: Record<string, unknown>[];
  requestRules: Record<string, unknown>[];
  [key: string]: any;
};

/** Loading AJAX Interceptor ASAP */
const registerClientScript = async () => {
  console.log("[registerClientScript]");
  chrome.scripting
    .registerContentScripts([
      {
        id: CLIENT_SCRIPT_ID,
        js: ["client.js"],
        world: "MAIN",
        allFrames: true,
        persistAcrossSessions: false,
        matches: ["http://*/*", "https://*/*"],
        runAt: "document_start",
        excludeMatches: excludeMatchesPatterns,
      },
    ])
    .then(() => {
      console.log("[registerClientScript]");
      chrome.scripting
        .getRegisteredContentScripts()
        .then((scripts) => console.log("[registerClientScript]", "registered content scripts", scripts));
    })
    .catch((err) => console.warn("[unregisterClientScript]", "unexpected error", err));
};

const unregisterClientScript = async () => {
  console.log("[unregisterClientScript]");
  return chrome.scripting
    .unregisterContentScripts({ ids: [CLIENT_SCRIPT_ID] })
    .then(() => {
      console.log("[unregisterClientScript]", "unregisterClientScript complete");
      chrome.scripting
        .getRegisteredContentScripts()
        .then((scripts) => console.log("[unregisterClientScript]", "registered content scripts", scripts));
    })
    .catch((err) => console.warn("[unregisterClientScript]", "unexpected error", err));
};

const setupClientScript = async (isExtensionStatusEnabled: boolean) => {
  console.log("[initClientHandler.setupClientScript]", { isExtensionEnabled });
  if (isExtensionStatusEnabled) {
    registerClientScript();
  } else {
    unregisterClientScript();
  }
};

export const initClientHandler = async () => {
  console.log("[initClientHandler]");
  const isExtensionStatusEnabled = await isExtensionEnabled();
  setupClientScript(isExtensionStatusEnabled);

  onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, (extensionStatus) => {
    console.log("[initClientHandler]", "onVariableChange", { extensionStatus });
    setupClientScript(extensionStatus);
  });
};

/** Caching Rules for AjaxInterceptor */

const updateCache = async (obj: Record<string, any>) => {
  // console.log("[updateCache]", { obj });
  Object.keys(obj).map((key) => {
    window[key] = obj[key];
  });
};

const updateTabCache = async (tabId: number, obj: Record<string, any>) => {
  chrome.scripting.executeScript(
    {
      target: { tabId },
      func: updateCache,
      args: [obj],
      injectImmediately: true,
      world: "MAIN",
    },
    () => {
      // NOOP
    }
  );
};

const updateTabRuleCache = async (tabId: number) => {
  const requestRules = await rulesStorageService.getEnabledRules(RuleType.REQUEST);
  const responseRules = await rulesStorageService.getEnabledRules(RuleType.RESPONSE);

  const clientRequestRules = requestRules.map((rule) => {
    const responseRulePair = rule.pairs[0] as RequestRulePair;
    return {
      id: rule.id,
      source: responseRulePair.source,
      request: responseRulePair.request,
    };
  });

  const clientResponseRules = responseRules.map((rule) => {
    const responseRulePair = rule.pairs[0] as ResponseRulePair;
    return {
      id: rule.id,
      source: responseRulePair.source,
      response: responseRulePair.response,
    };
  });

  updateTabCache(tabId, {
    responseRules: clientResponseRules,
    requestRules: clientRequestRules,
  });
};

export const initClientRuleCaching = async () => {
  // TODO: Do not inject in Requestly Pages. No harm in injecting though
  let isExtensionStatusEnabled = await isExtensionEnabled();
  onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, (extensionStatus) => {
    isExtensionStatusEnabled = extensionStatus;
  });

  chrome.webNavigation.onCommitted.addListener(async (navigatedTabData) => {
    if (isExtensionStatusEnabled) {
      updateTabRuleCache(navigatedTabData.tabId);
    }
  });

  rulesStorageService.onRuleOrGroupChange(async () => {
    if (isExtensionStatusEnabled) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          updateTabRuleCache(tab.id);
        });
      });
    }
  });
};
