import { EXTENSION_MESSAGES } from "common/constants";
import { isExtensionEnabled } from "../../utils";
import { initMessageHandler } from "./messageHandler";
import { initSessionRecording } from "../common/sessionRecorder";
import { initExtensionMessageListener } from "../common/extensionMessageListener";

document.documentElement.setAttribute("rq-ext-version", chrome.runtime.getManifest()["version"]);

// manifest version
document.documentElement.setAttribute("rq-ext-mv", "3");

// extension id
document.documentElement.setAttribute("rq-ext-id", chrome.runtime.id);

initMessageHandler();
initExtensionMessageListener();
isExtensionEnabled().then((isExtensionStatusEnabled) => {
  if (isExtensionStatusEnabled) {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
    initSessionRecording();
  }
});
