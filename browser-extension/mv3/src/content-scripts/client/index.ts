import { EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";
import { initResponseRuleHandler } from "./responseRuleHandler";
import { initRequestRuleHandler } from "./requestRuleHandler";
import { initRedirectRuleHandler } from "./redirectRuleHandler";
import { initReplaceRuleHandler } from "./replaceRuleHandler";
import { Variable, getVariable } from "../../service-worker/variable";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  getVariable<boolean>(Variable.IS_EXTENSION_ENABLED, true).then((isExtensionStatusEnabled) => {
    if (isExtensionStatusEnabled) {
      chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
      initSessionRecording();
      initRuleExecutionHandler();
      initResponseRuleHandler();
      initRequestRuleHandler();
      initRedirectRuleHandler();
      initReplaceRuleHandler();
    }
  });
}
