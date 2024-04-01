import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";
import { executeScriptOnPageExternally } from "../utils";
import { initResponseRuleHandler } from "./responseRuleHandler";

console.log("Hello from Requestly!");

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
  initSessionRecording();
  initRuleExecutionHandler();
  initResponseRuleHandler();

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.EXECUTE_SCRIPT:
        executeScriptOnPageExternally(message.code);
        break;
    }
    return false;
  });
}
