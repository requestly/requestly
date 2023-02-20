import { initMessageHandler } from "./messageHandler";

document.documentElement.setAttribute(
  "rq-ext-version",
  chrome.runtime.getManifest()["version"]
);

// manifest version
document.documentElement.setAttribute("rq-ext-mv", "3");

// extension id
window.localStorage.setItem("extID", chrome.runtime.id);

initMessageHandler();
