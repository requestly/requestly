import config from "common/config";
import { DEFAULT_BLOCKED_DOMAINS, saveBlockedDomainsToStorage } from "../../utils";

const handleExtensionInstalledOrUpdated = (details: chrome.runtime.InstalledDetails) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: config.LANDING_PAGE_BASE_URL + "/extension-installed-success" });
    saveBlockedDomainsToStorage(DEFAULT_BLOCKED_DOMAINS);
  }

  if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // chrome.tabs.create({ url: config.WEB_URL + "/extension-updated" });
    // To be disabled with the next release
    saveBlockedDomainsToStorage(DEFAULT_BLOCKED_DOMAINS);
  }
};

export const handleInstallUninstall = () => {
  chrome.runtime.onInstalled.addListener(handleExtensionInstalledOrUpdated);
  chrome.runtime.setUninstallURL(config.WEB_URL + "/goodbye/");
};
