import config from "common/config";
import { initContextMenu } from "./services/contextMenu";
import { handleInstallUninstall } from "./services/installUninstall";
import { initMessageHandler } from "./services/messageHandler.safari";

handleInstallUninstall();
initMessageHandler();
initContextMenu();

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: `${config.WEB_URL}/api-client?source=popup`,
  });
});
