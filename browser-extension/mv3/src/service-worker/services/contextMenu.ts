import { setVariable, Variable } from "../variable";
import { isExtensionEnabled } from "../../utils";
import extensionIconManager from "./extensionIconManager";
import { sendMessageToApp } from "./messageHandler/sender";
import { EXTENSION_MESSAGES } from "common/constants";
import { stopRecordingOnAllTabs } from "./sessionRecording";
import { tabService } from "./tabService";
import config from "common/config";

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

  if (isExtensionEnabled) {
    extensionIconManager.markExtensionEnabled();
  } else {
    extensionIconManager.markExtensionDisabled();
  }

  if (isExtensionEnabled === false) {
    stopRecordingOnAllTabs();
  }
};

const handleRunCurlRequest = async (selectedText: string, pageUrl: string) => {
  try {
    // Create a new tab with the web URL
    const webUrl = config.WEB_URL;

    const newTab = await new Promise<chrome.tabs.Tab>((resolve) => {
      chrome.tabs.create({ url: webUrl }, (tab) => {
        resolve(tab);
      });
    });

    // Wait for the tab to load completely
    await tabService.ensureTabLoadingComplete(newTab.id);

    // Send message to the new tab to open cURL import modal with pre-filled text
    const message = {
      action: EXTENSION_MESSAGES.OPEN_CURL_IMPORT_MODAL,
      payload: {
        curlCommand: selectedText,
        sourceUrl: pageUrl,
      },
    };

    chrome.tabs.sendMessage(newTab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error(`[handleRunCurlRequest] Error sending message:`, chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.error(`[handleRunCurlRequest] Error:`, error);
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
      await handleRunCurlRequest(info.selectionText, info.pageUrl);
    }
  });

  const isExtensionStatusEnabled = await isExtensionEnabled();
  updateActivationStatus(isExtensionStatusEnabled);

  // onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, updateActivationStatus);
};
