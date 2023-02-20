import { registerCommands } from "./services/commands";
import { initContextMenu } from "./services/contextMenu";
import { initExtensionIcon } from "./services/extensionIcon";
import { handleInstallUninstall } from "./services/installUninstall";
import { initMessageHandler } from "./services/messageHandler";
import { initResponseRuleHandler } from "./services/responseRuleHandler";
import { initRulesManager } from "./services/rulesManager";

// initialize
(async () => {
  initExtensionIcon();
  registerCommands();
  handleInstallUninstall();
  initRulesManager();
  initMessageHandler();
  initContextMenu();
  initResponseRuleHandler();
})();
