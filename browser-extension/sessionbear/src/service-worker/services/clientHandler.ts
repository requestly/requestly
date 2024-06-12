// import { generateUrlPattern } from "../../utils";
// import { WEB_URL, OTHER_WEB_URLS } from "../../../../config/dist/config.build.json";
import { isExtensionEnabled } from "../../utils";
import { Variable, onVariableChange } from "../variable";

// const excludeMatchesPatterns = [WEB_URL, ...OTHER_WEB_URLS].map(generateUrlPattern).filter((pattern) => !!pattern);

const CLIENT_SCRIPTS: chrome.scripting.RegisteredContentScript[] = [
  {
    id: "page-script-sessionRecorder",
    js: ["page-scripts/sessionRecorderHelper.ps.js"],
    world: "MAIN",
    persistAcrossSessions: false,
    matches: ["http://*/*", "https://*/*"],
    runAt: "document_start",
  },
];

/** Loading AJAX Interceptor ASAP */
const registerClientScripts = async () => {
  console.log("[registerClientScript]");
  chrome.scripting
    .registerContentScripts(CLIENT_SCRIPTS)
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
  console.log("[initClientHandler.setupClientScript]", { isExtensionEnabled });
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
};
