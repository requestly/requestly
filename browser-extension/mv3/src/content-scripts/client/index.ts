import { EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";
import { initResponseRuleHandler } from "./responseRuleHandler";
import { initRequestRuleHandler } from "./requestRuleHandler";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
  initSessionRecording();
  initRuleExecutionHandler();
  initResponseRuleHandler();
  initRequestRuleHandler();
}
