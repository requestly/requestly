import { EXTENSION_MESSAGES } from "common/constants";
import { initSessionRecording } from "../common/sessionRecorder";
import { getVariable } from "../../service-worker/variable";
import { initPageScriptMessageListener } from "./pageScriptMessageListener";
import { initTestRuleHandler } from "./testRuleHandler";
import { initExtensionMessageListener } from "../common/extensionMessageListener";
import { Variable } from "common/types";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  initExtensionMessageListener();
  getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true).then((isExtensionStatusEnabled) => {
    if (isExtensionStatusEnabled) {
      chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
      initSessionRecording();
      initPageScriptMessageListener();
      initTestRuleHandler();
    }
  });
}
