import { MenuItem, SourceKey, SourceOperator, ToggleActivationStatusLabel, UrlSource } from "common/types";
import config from "common/config";
import { matchSourceUrl } from "./common/ruleMatcher";
import { Variable, getVariable, setVariable } from "./service-worker/variable";
import { ChangeType, getRecord, onRecordChange } from "common/storage";
import { STORAGE_KEYS } from "common/constants";
import { stopRecordingOnAllTabs } from "./service-worker/services/sessionRecording";
import extensionIconManager from "./service-worker/services/extensionIconManager";

export const formatDate = (dateInMillis: number, format: string): string => {
  if (dateInMillis && format === "yyyy-mm-dd") {
    const date = new Date(dateInMillis);
    let monthString = String(date.getMonth() + 1),
      dateString = String(date.getDate());

    dateString = dateString.length < 2 ? "0" + dateString : String(dateString);
    monthString = monthString.length < 2 ? "0" + monthString : String(monthString);

    return date.getFullYear() + "-" + monthString + "-" + dateString;
  }

  return "";
};

export const getAllSupportedWebURLs = () => {
  const webURLsSet = new Set([config.WEB_URL, ...config.OTHER_WEB_URLS]);
  return [...webURLsSet];
};

export const getAllSupportedAppOrigins = () => {
  const supportedOriginsSet = new Set([]);

  getAllSupportedWebURLs().forEach((url) => {
    const origin = new URL(url).origin;
    supportedOriginsSet.add(origin);
  });
  return [...supportedOriginsSet];
};

export const isAppURL = (url: string) => {
  let origin = null;
  try {
    const urlObject = new URL(url);
    origin = urlObject.origin;
  } catch (err) {
    return false;
  }

  return !!url && getAllSupportedAppOrigins().includes(origin);
};

export const isBlacklistedURL = (url: string): boolean => {
  const blacklistedSources: UrlSource[] = [
    ...getAllSupportedWebURLs().map((webUrl) => ({
      key: SourceKey.URL,
      operator: SourceOperator.CONTAINS,
      value: webUrl,
    })),
    {
      key: SourceKey.URL,
      operator: SourceOperator.CONTAINS,
      value: "__rq", // you can use __rq in the url to blacklist it
    },
  ];

  return blacklistedSources.some((source) => matchSourceUrl(source, url));
};

export const generateUrlPattern = (urlString: string) => {
  try {
    const webUrlObj = new URL(urlString);
    return `${webUrlObj.protocol}//${webUrlObj.host}/*`;
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`, error);
    return null;
  }
};

export const getUrlObject = (url: string): URL | undefined => {
  // Url obj fails to construct when chrome:// or similar urls are passed
  try {
    const urlObj = new URL(url);
    return urlObj;
  } catch (error) {
    return null;
  }
};

export const isExtensionEnabled = async (): Promise<boolean> => {
  return await getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true);
};

export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;

  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

let cachedBlockedDomains: string[] | null = null;

export const cacheBlockedDomains = async () => {
  const blockedDomains = await getRecord<string[]>(STORAGE_KEYS.BLOCKED_DOMAINS);
  cachedBlockedDomains = blockedDomains ?? [];
};

export const getBlockedDomains = async () => {
  if (cachedBlockedDomains) {
    return cachedBlockedDomains;
  }

  await cacheBlockedDomains();
  return cachedBlockedDomains;
};

export const isUrlInBlockList = async (url: string) => {
  const blockedDomains = await getBlockedDomains();
  return blockedDomains?.some((domain) => {
    return matchSourceUrl(
      {
        key: SourceKey.HOST,
        value: `/^(.+\.)?${domain}$/i`, // to match the domain and all its subdomains
        operator: SourceOperator.MATCHES,
      },
      url
    );
  });
};

export const onBlockListChange = (callback: () => void) => {
  onRecordChange<string[]>(
    {
      keyFilter: STORAGE_KEYS.BLOCKED_DOMAINS,
      changeTypes: [ChangeType.MODIFIED],
    },
    () => {
      cacheBlockedDomains().then(() => {
        callback?.();
      });
    }
  );
};

export const sendMessageToApp = async (messageObject: unknown) => {
  const appTabs = await getAppTabs();
  return Promise.all(appTabs.map(({ id }) => chrome.tabs.sendMessage(id, messageObject)));
};

export const isNonBrowserTab = (tabId: number): boolean => {
  // A special ID value given to tabs that are not browser tabs (for example, apps and devtools windows)
  return tabId === chrome.tabs.TAB_ID_NONE;
};

export const toggleExtensionStatus = async (newStatus?: boolean) => {
  const extensionEnabledStatus = await isExtensionEnabled();

  const updatedStatus = newStatus ?? !extensionEnabledStatus;
  setVariable<boolean>(Variable.IS_EXTENSION_ENABLED, updatedStatus);
  updateActivationStatus(updatedStatus);

  if (!updatedStatus) {
    stopRecordingOnAllTabs();
  }

  return updatedStatus;
};

export const getAppTabs = async (): Promise<chrome.tabs.Tab[]> => {
  const webURLs = getAllSupportedWebURLs();
  let appTabs: chrome.tabs.Tab[] = [];

  for (const webURL of webURLs) {
    const tabs = await chrome.tabs.query({ url: webURL + "/*" });
    appTabs = [...appTabs, ...tabs];
  }

  return appTabs;
};

export const updateActivationStatus = (isExtensionEnabled: boolean) => {
  chrome.contextMenus.update(MenuItem.TOGGLE_ACTIVATION_STATUS, {
    title: isExtensionEnabled ? ToggleActivationStatusLabel.DEACTIVATE : ToggleActivationStatusLabel.ACTIVATE,
  });

  if (isExtensionEnabled) {
    extensionIconManager.markExtensionEnabled();
  } else {
    extensionIconManager.markExtensionDisabled();
  }

  sendMessageToApp({ action: "isExtensionEnabled", isExtensionEnabled });
};
