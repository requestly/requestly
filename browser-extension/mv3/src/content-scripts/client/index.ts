import { EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";
import { initResponseRuleHandler } from "./responseRuleHandler";
import { initRequestRuleHandler } from "./requestRuleHandler";
import { Variable, getVariable } from "../../service-worker/variable";
import { initPageScriptMessageListener } from "./pageScriptMessageHandler";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true).then((isExtensionStatusEnabled) => {
    if (isExtensionStatusEnabled) {
      chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
      initSessionRecording();
      initPageScriptMessageListener();
      initRuleExecutionHandler();
      initResponseRuleHandler();
      initRequestRuleHandler();
    }
  });
}
