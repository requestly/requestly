import { initMessageHandler } from "./messageHandler";
import { initExtensionMessageListener } from "../common/extensionMessageListener";

document.documentElement.setAttribute("rq-ext-version", chrome.runtime.getManifest()["version"]);

// manifest version
document.documentElement.setAttribute("rq-ext-mv", "3");

// extension id
document.documentElement.setAttribute("rq-ext-id", chrome.runtime.id);

initMessageHandler();
initExtensionMessageListener();
