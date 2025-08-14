import { SourceKey, SourceOperator, UrlSource } from "common/types";
import config from "common/config";
import { matchSourceUrl } from "./common/ruleMatcher";
import { getVariable, Variable } from "./service-worker/variable";
import { getRecord, onRecordChange, saveRecord } from "common/storage";
import { STORAGE_KEYS } from "common/constants";

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

export const DEFAULT_BLOCKED_DOMAINS = ["mail.google.com"];
export const initBlockedDomainsStorage = async () => {
  const existingBlockedDomains = (await getRecord<string[]>(STORAGE_KEYS.BLOCKED_DOMAINS)) ?? [];
  const updatedBlockedDomains = Array.from(new Set([...existingBlockedDomains, ...DEFAULT_BLOCKED_DOMAINS]));

  await saveRecord(STORAGE_KEYS.BLOCKED_DOMAINS, updatedBlockedDomains);
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
    },
    () => {
      cacheBlockedDomains().then(() => {
        callback?.();
      });
    }
  );
};

export const getPopupConfig = async () => {
  const config = await getRecord<Record<string, any>>(STORAGE_KEYS.POPUP_CONFIG);
  return config;
};
