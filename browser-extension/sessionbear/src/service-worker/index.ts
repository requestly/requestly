import { initClientHandler } from "./services/clientHandler";
import { registerCommands } from "./services/commands";
import { initContextMenu } from "./services/contextMenu";
import { handleInstallUninstall } from "./services/installUninstall";
import { initMessageHandler } from "./services/messageHandler";

// initialize
(async () => {
  initClientHandler();
  registerCommands();
  handleInstallUninstall();
  initMessageHandler();
  initContextMenu();
})();
