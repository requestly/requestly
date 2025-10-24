import { setVariable, Variable } from "../variable";
import { isExtensionEnabled } from "../../utils";
import extensionIconManager from "./extensionIconManager";
import { sendMessageToApp } from "./messageHandler/sender";
import { CLIENT_MESSAGES } from "common/constants";
import { stopRecordingOnAllTabs } from "./sessionRecording";
import { triggerOpenCurlModalMessage } from "./utils";

enum MenuItem {
  TOGGLE_ACTIVATION_STATUS = "toggle-activation-status",
  RUN_CURL_REQUEST = "run-curl-request",
}

enum ToggleActivationStatusLabel {
  ACTIVATE = "Activate Requestly",
  DEACTIVATE = "Deactivate Requestly",
}

export const updateActivationStatus = (isExtensionEnabled: boolean) => {
  chrome.contextMenus.update(MenuItem.TOGGLE_ACTIVATION_STATUS, {
    title: isExtensionEnabled ? ToggleActivationStatusLabel.DEACTIVATE : ToggleActivationStatusLabel.ACTIVATE,
  });

  console.log(`[updateActivationStatus] starting...`, {
    isExtensionEnabled,
    extensionIconState: extensionIconManager.getState(),
  });

  if (isExtensionEnabled) {
    extensionIconManager.markExtensionEnabled();
  } else {
    extensionIconManager.markExtensionDisabled();
  }

  console.log(`[updateActivationStatus] finished...`, {
    isExtensionEnabled,
    extensionIconState: extensionIconManager.getState(),
  });

  if (isExtensionEnabled === false) {
    stopRecordingOnAllTabs();
  }
};

export const initContextMenu = async () => {
  chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: MenuItem.TOGGLE_ACTIVATION_STATUS,
    title: ToggleActivationStatusLabel.DEACTIVATE,
    contexts: ["action"],
  });

  chrome.contextMenus.create({
    id: MenuItem.RUN_CURL_REQUEST,
    title: "Run cURL Request",
    contexts: ["selection"],
  });

  chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData) => {
    if (info.menuItemId === MenuItem.TOGGLE_ACTIVATION_STATUS) {
      const isExtensionStatusEnabled = await isExtensionEnabled();
      const extensionStatus = !isExtensionStatusEnabled;

      await setVariable<boolean>(Variable.IS_EXTENSION_ENABLED, extensionStatus);
      updateActivationStatus(extensionStatus);
      sendMessageToApp({
        action: CLIENT_MESSAGES.NOTIFY_EXTENSION_STATUS_UPDATED,
        isExtensionEnabled: extensionStatus,
        extensionIconState: extensionIconManager.getState(),
      });
    } else if (info.menuItemId === MenuItem.RUN_CURL_REQUEST) {
      // Handle the cURL request action
      await triggerOpenCurlModalMessage({ selectedText: info.selectionText, pageURL: info.pageUrl }, "context_menu");
    }
  });

  const isExtensionStatusEnabled = await isExtensionEnabled();
  updateActivationStatus(isExtensionStatusEnabled);

  // onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, updateActivationStatus);
};
