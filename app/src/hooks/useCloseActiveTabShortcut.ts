import { useHotkeys } from "react-hotkeys-hook";
import { isDesktopMode } from "../utils/AppUtils";
import { KEYBOARD_SHORTCUTS, Feature } from "../constants/keyboardShortcuts";
import { useActiveTabId, useTabActions } from "componentsV2/Tabs/slice";

/**
 * Custom hook that provides keyboard shortcuts to close the active tab.
 * Uses different shortcuts based on app mode (desktop vs extension):
 * - Desktop: ⌘ W (Mac) / Ctrl W (Windows)
 * - Extension: ⌘ ⌥ W (Mac) / Ctrl Alt W (Windows)
 */
export const useCloseActiveTabShortcut = () => {
  const activeTabId = useActiveTabId();
  const { closeTab } = useTabActions();

  // Determine the appropriate shortcut based on app mode
  const shortcutKey = isDesktopMode()
    ? KEYBOARD_SHORTCUTS[Feature.API_CLIENT].CLOSE_ACTIVE_TAB_DESKTOP.hotKey
    : KEYBOARD_SHORTCUTS[Feature.API_CLIENT].CLOSE_ACTIVE_TAB_EXTENSION.hotKey;

  useHotkeys(
    shortcutKey,
    () => {
      if (!activeTabId) {
        return;
      }

      closeTab({ tabId: activeTabId });
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
      description: "Close active tab",
    },
    [activeTabId, closeTab]
  );
};
