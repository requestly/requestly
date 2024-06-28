import { generateUrlPattern } from "../../utils";
import { WEB_URL, OTHER_WEB_URLS } from "../../../../config/dist/config.build.json";
import { isExtensionEnabled } from "../../utils";
import { Variable, onVariableChange } from "../variable";
import { RuleType } from "common/types";
import rulesStorageService from "../../rulesStorageService";
import { getBlockedDomains } from "./utils";
import { ChangeType, onRecordChange } from "common/storage";
import { STORAGE_KEYS } from "common/constants";

const excludeMatchesPatterns = [WEB_URL, ...OTHER_WEB_URLS].map(generateUrlPattern).filter((pattern) => !!pattern);

const generateBlockedDomainPattern = (hostname: string) => {
  return `*://*${hostname}/*`;
};

const CLIENT_SCRIPTS: chrome.scripting.RegisteredContentScript[] = [
  {
    id: "page-script-ajaxInterceptor",
    js: ["page-scripts/ajaxRequestInterceptor.ps.js"],
    world: "MAIN",
    allFrames: true,
    persistAcrossSessions: false,
    matches: ["http://*/*", "https://*/*"],
    runAt: "document_start",
    excludeMatches: excludeMatchesPatterns,
  },
  {
    id: "page-script-sessionRecorder",
    js: ["page-scripts/sessionRecorderHelper.ps.js"],
    world: "MAIN",
    persistAcrossSessions: false,
    matches: ["http://*/*", "https://*/*"],
    runAt: "document_start",
  },
];

declare const window: {
  responseRules: Record<string, unknown>[];
  requestRules: Record<string, unknown>[];
  [key: string]: any;
};

/** Loading Client scripts ASAP */
const registerClientScripts = async () => {
  const blockedDomains = await getBlockedDomains();
  const blockedDomainPatterns = blockedDomains.map(generateBlockedDomainPattern).filter((pattern) => !!pattern);

  console.log("[registerClientScript]", { blockedDomains });
  const clientScripts = CLIENT_SCRIPTS.map((script) => {
    return {
      ...script,
      excludeMatches: [...(script.excludeMatches ?? []), ...blockedDomainPatterns],
    };
  });

  chrome.scripting
    .registerContentScripts(clientScripts)
    .then(() => {
      console.log("[registerClientScript]");
      chrome.scripting
        .getRegisteredContentScripts()
        .then((scripts) => console.log("[registerClientScript]", "registered content scripts", scripts));
    })
    .catch((err) => console.warn("[unregisterClientScript]", "unexpected error", err));
};

const unregisterClientScripts = async () => {
  console.log("[unregisterClientScript]");
  return chrome.scripting
    .unregisterContentScripts({ ids: CLIENT_SCRIPTS.map((script) => script.id) })
    .then(() => {
      console.log("[unregisterClientScript]", "unregisterClientScript complete");
      chrome.scripting
        .getRegisteredContentScripts()
        .then((scripts) => console.log("[unregisterClientScript]", "registered content scripts", scripts));
    })
    .catch((err) => console.warn("[unregisterClientScript]", "unexpected error", err));
};

const setupClientScript = async (isExtensionStatusEnabled: boolean) => {
  console.log("[initClientHandler.setupClientScript]", { isExtensionStatusEnabled });
  if (isExtensionStatusEnabled) {
    registerClientScripts();
  } else {
    unregisterClientScripts();
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

  onRecordChange<string[]>(
    {
      keyFilter: STORAGE_KEYS.BLOCKED_DOMAINS,
      changeTypes: [ChangeType.MODIFIED],
    },
    () => {
      unregisterClientScripts().then(() => {
        setupClientScript(isExtensionStatusEnabled);
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            updateTabBlockedDomainsCache(tab.id, undefined);
          });
        });
      });
    }
  );
};

/** Caching Rules for AjaxInterceptor */

const updateCache = (obj: Record<string, any>) => {
  // Cannot use outside variable in this function as this is executed in the context of the page
  // Reference: https://developer.chrome.com/docs/extensions/reference/api/scripting#:~:text=A%20JavaScript%20function%20to%20inject.,or%20func%20must%20be%20specified.

  // console.log("[updateCache]", { obj });
  const PUBLIC_NAMESPACE = "__REQUESTLY__";
  window[PUBLIC_NAMESPACE] = window[PUBLIC_NAMESPACE] || {};
  Object.keys(obj).map((key) => {
    window[PUBLIC_NAMESPACE][key] = obj[key];
  });
};

const updateTabCache = async (tabId: number, obj: Record<string, any>, frameId?: number) => {
  const target: chrome.scripting.InjectionTarget = {
    tabId: tabId,
  };

  if (frameId !== undefined) {
    target["frameIds"] = [frameId];
  } else {
    target["allFrames"] = true;
  }

  chrome.scripting.executeScript(
    {
      target,
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

const updateTabRuleCache = async (tabId: number, frameId?: number) => {
  const requestRules = await rulesStorageService.getEnabledRules(RuleType.REQUEST);
  const responseRules = await rulesStorageService.getEnabledRules(RuleType.RESPONSE);
  const delayRules = await rulesStorageService.getEnabledRules(RuleType.DELAY);

  updateTabCache(
    tabId,
    {
      responseRules: responseRules,
      requestRules: requestRules,
      delayRules: delayRules,
    },
    frameId
  );
};

const updateTabBlockedDomainsCache = async (tabId: number, frameId?: number) => {
  const blockedDomains = await getBlockedDomains();

  updateTabCache(
    tabId,
    {
      blockedDomains: blockedDomains,
    },
    frameId
  );
};

export const initClientRuleCaching = async () => {
  // TODO: Do not inject in Requestly Pages. No harm in injecting though
  let isExtensionStatusEnabled = await isExtensionEnabled();
  onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, (extensionStatus) => {
    isExtensionStatusEnabled = extensionStatus;
  });

  chrome.webNavigation.onCommitted.addListener(async (navigatedTabData) => {
    if (isExtensionStatusEnabled) {
      updateTabRuleCache(navigatedTabData.tabId, navigatedTabData.frameId);
    }
  });

  rulesStorageService.onRuleOrGroupChange(async () => {
    if (isExtensionStatusEnabled) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          updateTabRuleCache(tab.id, undefined);
        });
      });
    }
  });
};
