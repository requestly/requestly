import { initClientHandler, initClientRuleCaching } from "./services/clientHandler";
import { registerCommands } from "./services/commands";
import { initContextMenu } from "./services/contextMenu";
import { handleInstallUninstall } from "./services/installUninstall";
import { initMessageHandler } from "./services/messageHandler";
import { initRulesManager } from "./services/rulesManager";
import { initWebRequestInterceptor } from "./services/webRequestInterceptor";

// initialize
(async () => {
  initClientHandler();
  initClientRuleCaching();
  registerCommands();
  handleInstallUninstall();
  initRulesManager();
  initMessageHandler();
  initContextMenu();
  initWebRequestInterceptor();
})();
