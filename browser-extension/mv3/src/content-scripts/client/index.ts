import { EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";

console.log("Hello from Requestly!");

if (document.doctype?.name === "html") {
  chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
  initSessionRecording();
  initRuleExecutionHandler();
}
