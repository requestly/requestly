import { initExtensionMessageListener } from "../common/extensionMessageListener";

if (document.doctype?.name === "html" || document.contentType?.includes("html")) {
  initExtensionMessageListener();
}
