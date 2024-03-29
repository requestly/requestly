import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { initRuleExecutionHandler } from "./ruleExecution";
import { initSessionRecording } from "./sessionRecorder";

console.log("Hello from Requestly!");

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.HANDSHAKE_CLIENT });
  initSessionRecording();
  initRuleExecutionHandler();

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.EXECUTE_SCRIPT:
        executeScriptOnPageExternally(message.code);
        break;
    }
    return false;
  });
}

const executeScriptOnPageExternally = (code: string) => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("libs/executeScript.js");
  script.onload = () => script.remove();
  script.dataset.params = JSON.stringify({ code });
  (document.head || document.documentElement).appendChild(script);
};
