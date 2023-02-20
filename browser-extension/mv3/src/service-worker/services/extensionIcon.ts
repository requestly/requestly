import config from "common/config";

enum ExtensionIcon {
  NORMAL = "/resources/images/48x48.png",
  DISABLED = "/resources/images/48x48_greyscale.png",
  ACTIVE = "/resources/images/48x48_green.png",
}

export const initExtensionIcon = () => {
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: config.WEB_URL });
  });
};

export const enableExtensionIcon = () => {
  chrome.action.setIcon({ path: ExtensionIcon.NORMAL });
};

export const disableExtensionIcon = () => {
  chrome.action.setIcon({ path: ExtensionIcon.DISABLED });
};

export const setExtensionIconActive = () => {
  chrome.action.setIcon({ path: ExtensionIcon.ACTIVE });
};

export const setExtensionIconRecordingState = (tabId: number) => {
  chrome.action.setBadgeText({ tabId, text: "REC" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#e34850" });
};
