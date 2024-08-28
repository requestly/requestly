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
})();
