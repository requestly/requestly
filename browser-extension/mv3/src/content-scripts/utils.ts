import { EXTENSION_MESSAGES } from "common/constants";

// Dynamic because static scripts to be executed using chrome.scripting.executeScript({file:...})
export const executeDynamicScriptOnPage = (code: string) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("libs/executeScript.js");
  script.onload = () => script.remove();
  script.dataset.params = JSON.stringify({ code });
  (document.head || document.documentElement).appendChild(script);
};

export const isExtensionEnabled = (): Promise<boolean> => {
  return chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED });
};
