import { EXTENSION_MESSAGES } from "../../constants";
import { initSessionRecording } from "./sessionRecorder";
import { Variable, getVariable } from "../../service-worker/variable";
import { initPageScriptMessageListener } from "./pageScriptMessageListener";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true).then((isExtensionStatusEnabled) => {
    if (isExtensionStatusEnabled) {
      chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
      initSessionRecording();
      initPageScriptMessageListener();
    }
  });
}
