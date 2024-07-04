import { EXTENSION_MESSAGES } from "../../constants";
import { isExtensionEnabled } from "../../utils";
import { initExtensionMessageListener } from "../common/extensionMessageListener";
import { initSessionRecording } from "../common/sessionRecorder";
import { initMessageHandler } from "./messageHandler";

document.documentElement.setAttribute("rq-ext-version", chrome.runtime.getManifest()["version"]);

// manifest version
document.documentElement.setAttribute("rq-ext-mv", "3");

// extension id
document.documentElement.setAttribute("rq-ext-id", chrome.runtime.id);

document.documentElement.setAttribute("rq-ext-name", "SESSIONBEAR");

initMessageHandler();
initExtensionMessageListener();
isExtensionEnabled().then((isExtensionStatusEnabled) => {
  if (isExtensionStatusEnabled) {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
    initSessionRecording();
  }
});
