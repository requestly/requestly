import { generateUrlPattern } from "../../utils";
import { WEB_URL, OTHER_WEB_URLS } from "../../../../config/dist/config.build.json";
import { isExtensionEnabled } from "./utils";
import { Variable, onVariableChange } from "../variable";

const CLIENT_SCRIPT_ID = "client-script";
const excludeMatchesPatterns = [WEB_URL, ...OTHER_WEB_URLS].map(generateUrlPattern).filter((pattern) => !!pattern);

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
