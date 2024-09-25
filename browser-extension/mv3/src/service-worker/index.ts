import { getRecord } from "common/storage";
import { initClientHandler, initClientSideCaching } from "./services/clientHandler";
import { registerCommands } from "./services/commands";
import { initContextMenu } from "./services/contextMenu";
import { initDevtoolsListener } from "./services/devtools";
import { handleInstallUninstall } from "./services/installUninstall";
import { initMessageHandler } from "./services/messageHandler";
import { initRulesManager } from "./services/rulesManager";
import { initWebRequestInterceptor } from "./services/webRequestInterceptor";

// initialize
(async () => {
  initClientHandler();
  initClientSideCaching();
  registerCommands();
  handleInstallUninstall();
  initRulesManager();
  initMessageHandler();
  initContextMenu();
  initWebRequestInterceptor();
  initDevtoolsListener();

  const refreshToken = await getRecord("refreshToken");

  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL("/iframe.html"),
    reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
    justification: "justification",
  });

  console.log("!!!debug", "offscreen loaded");

  chrome.runtime.sendMessage({
    target: "offscreen",
    refreshToken,
    action: "iframe",
  });
})();
