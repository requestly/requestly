import config from "common/config";
import { Variable, getVariable, setVariable } from "./service-worker/variable";

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

export const isAppURL = (url: string) => {
  return !!url && getAllSupportedWebURLs().some((webURL) => url.includes(webURL));
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

export const toggleExtensionStatus = async (onStatusChangeCallback?: (updatedStatus: boolean) => void) => {
  const extensionEnabledStatus = await isExtensionEnabled();

  const updatedStatus = !extensionEnabledStatus;
  setVariable<boolean>(Variable.IS_EXTENSION_ENABLED, updatedStatus);

  onStatusChangeCallback?.(updatedStatus);

  return updatedStatus;
};

const getAppTabs = async (): Promise<chrome.tabs.Tab[]> => {
  const webURLs = getAllSupportedWebURLs();
  let appTabs: chrome.tabs.Tab[] = [];

  for (const webURL of webURLs) {
    const tabs = await chrome.tabs.query({ url: webURL + "/*" });
    appTabs = [...appTabs, ...tabs];
  }

  return appTabs;
};

export const sendMessageToApp = async (messageObject: unknown) => {
  const appTabs = await getAppTabs();
  return Promise.all(appTabs.map(({ id }) => chrome.tabs.sendMessage(id, messageObject)));
};
