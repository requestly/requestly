import { EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";
import { initResponseRuleHandler } from "./responseRuleHandler";
import { initRequestRuleHandler } from "./requestRuleHandler";
import { isExtensionEnabled } from "../../service-worker/services/utils";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  isExtensionEnabled().then((isExtensionStatusEnabled) => {
    if (isExtensionStatusEnabled) {
      chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
      initSessionRecording();
      initRuleExecutionHandler();
      initResponseRuleHandler();
      initRequestRuleHandler();
    }
  });
}
