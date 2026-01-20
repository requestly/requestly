import { EXTENSION_MESSAGES } from "../../constants";
import { initSessionRecording } from "../common/sessionRecorder";
import { Variable, getVariable } from "../../service-worker/variable";
import { initPageScriptMessageListener } from "./pageScriptMessageListener";
import { initExtensionMessageListener } from "../common/extensionMessageListener";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  initExtensionMessageListener();
  getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true).then((isExtensionStatusEnabled) => {
    if (isExtensionStatusEnabled) {
      chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
      initSessionRecording();
      initPageScriptMessageListener();
    }
  });
}
