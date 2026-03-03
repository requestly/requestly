import config from "common/config";
import { initBlockedDomainsStorage } from "../../utils";

const handleExtensionInstalledOrUpdated = (details: chrome.runtime.InstalledDetails) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    initBlockedDomainsStorage();
    chrome.tabs.create({ url: config.LANDING_PAGE_BASE_URL + "/extension-installed-success" });
  }

  if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    // chrome.tabs.create({ url: config.WEB_URL + "/extension-updated" });
    // To be disabled with the next release
    initBlockedDomainsStorage();
  }
};

export const handleInstallUninstall = () => {
  chrome.runtime.onInstalled.addListener(handleExtensionInstalledOrUpdated);
  chrome.runtime.setUninstallURL(config.WEB_URL + "/goodbye/");
};
