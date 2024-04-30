import { onVariableChange, setVariable, Variable } from "../variable";
import { disableExtensionIcon, enableExtensionIcon } from "./extensionIcon";
import { isExtensionEnabled } from "./utils";

// TODO: fix circular dependency
// import { sendMessageToApp } from "./messageHandler";

enum MenuItem {
  TOGGLE_ACTIVATION_STATUS = "toggle-activation-status",
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
    enableExtensionIcon();
  } else {
    disableExtensionIcon();
  }

  // sendMessageToApp({ isExtensionEnabled });
};

export const initContextMenu = async () => {
  chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: MenuItem.TOGGLE_ACTIVATION_STATUS,
    title: ToggleActivationStatusLabel.DEACTIVATE,
    contexts: ["action"],
  });

  chrome.contextMenus.onClicked.addListener(async (info) => {
    const isExtensionStatusEnabled = await isExtensionEnabled();
    if (info.menuItemId === MenuItem.TOGGLE_ACTIVATION_STATUS) {
      setVariable<boolean>(Variable.IS_EXTENSION_ENABLED, !isExtensionStatusEnabled);
    }
  });

  const isExtensionStatusEnabled = await isExtensionEnabled();
  updateActivationStatus(isExtensionStatusEnabled);

  onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, updateActivationStatus);
};
