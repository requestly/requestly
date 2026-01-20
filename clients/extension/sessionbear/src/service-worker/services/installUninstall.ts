import config from "../../config";

const handleExtensionInstalledOrUpdated = (details: chrome.runtime.InstalledDetails) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: config.WEB_URL + "/sessions" });
  }

  // if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
  //   chrome.tabs.create({ url: config.WEB_URL + "/extension-updated" });
  // }
};

export const handleInstallUninstall = () => {
  chrome.runtime.onInstalled.addListener(handleExtensionInstalledOrUpdated);
  chrome.runtime.setUninstallURL(config.WEB_URL + "/goodbye/");
};
