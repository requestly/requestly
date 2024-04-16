import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";
import { executeDynamicScriptOnPage } from "../utils";
import { initResponseRuleHandler } from "./responseRuleHandler";
import { initRequestRuleHandler } from "./requestRuleHandler";

console.log("Hello from Requestly!");

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
  initSessionRecording();
  initRuleExecutionHandler();
  initResponseRuleHandler();
  initRequestRuleHandler();

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.EXECUTE_SCRIPT:
        executeDynamicScriptOnPage(message.code);
        break;
    }
    return false;
  });
}
