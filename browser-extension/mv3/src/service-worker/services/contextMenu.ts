import { onVariableChange, setVariable, Variable } from "../variable";
import { isExtensionEnabled, updateActivationStatus } from "../../utils";
import { MenuItem, ToggleActivationStatusLabel } from "common/types";

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
