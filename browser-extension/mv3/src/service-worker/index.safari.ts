import config from "common/config";
import { registerCommands } from "./services/commands";
import { initContextMenu } from "./services/contextMenu";
import { handleInstallUninstall } from "./services/installUninstall";
import { initMessageHandler } from "./services/messageHandler";

// initialize
// initClientHandler();
// initClientSideCaching();
registerCommands();
handleInstallUninstall();
// initRulesManager();
initMessageHandler();
initContextMenu();
// initWebRequestInterceptor();
// initDevtoolsListener();
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: `${config.WEB_URL}/api-client?source=popup`,
  });
});
