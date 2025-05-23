import { isUrlInBlockList } from "../../utils";
import { tabService } from "./tabService";

interface ExtensionIconConfig {
  ruleExecuted?: boolean;
  isRecording?: boolean;
  isBlocked?: boolean;
  isConnectedToDesktopApp?: boolean;
}

class ExtensionIconManager {
  #isExtensionDisabled = false;
  #connectedToDesktopApp = false;

  #icons = {
    DEFAULT: "/resources/images/48x48.png",
    DISABLED: "/resources/images/48x48_greyscale.png",
    BLOCKED: "/resources/images/48x48_blocked.png",
    RULE_EXECUTED: "/resources/images/48x48_green.png",
    DEFAULT_WITH_REC: "/resources/images/48x48_rec.png",
    RULE_EXECUTED_WITH_REC: "/resources/images/48x48_green_rec.png",
    CONNECTED_TO_DESKTOP_APP: "/resources/images/48x48_desktop.png",
  };

  #CONSTANTS = {
    PAGE_DATA_ICON_CONFIG: "extensionIconConfig",
  };

  constructor() {
    chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
      // FIXME: Can be made better by only listening to url changes on tabs
      isUrlInBlockList(tab.url).then((isBlocked) => {
        if (isBlocked) {
          this.markExtensionBlocked(tabId);
        } else {
          this.#updateIconState(tabId);
        }
      });
    });
  }

  #getDefaultConfig(): ExtensionIconConfig {
    return {
      ruleExecuted: false,
      isRecording: false,
    };
  }

  #getIcon(config: ExtensionIconConfig) {
    if (this.#connectedToDesktopApp) {
      return this.#icons.CONNECTED_TO_DESKTOP_APP;
    }

    if (this.#isExtensionDisabled) {
      return this.#icons.DISABLED;
    }

    if (config.ruleExecuted) {
      if (config.isRecording) {
        return this.#icons.RULE_EXECUTED_WITH_REC;
      }

      return this.#icons.RULE_EXECUTED;
    }

    if (config.isRecording) {
      return this.#icons.DEFAULT_WITH_REC;
    }

    if (config.isBlocked) {
      return this.#icons.BLOCKED;
    }

    return this.#icons.DEFAULT;
  }

  #updateIconState(tabId: number, newConfigKey?: keyof ExtensionIconConfig, newConfigValue?: boolean) {
    let config = tabService.getPageData(tabId, this.#CONSTANTS.PAGE_DATA_ICON_CONFIG) ?? this.#getDefaultConfig();

    if (newConfigKey && config[newConfigKey] !== newConfigValue) {
      config = { ...config, [newConfigKey]: newConfigValue };
    }
    tabService.setPageData(tabId, this.#CONSTANTS.PAGE_DATA_ICON_CONFIG, config);

    this.#setExtensionIcon(this.#getIcon(config), tabId);
  }

  #updateIconStateForAllTabs() {
    const tabsMap = tabService.getTabs();
    Object.values(tabsMap).forEach((tab) => this.#updateIconState(tab.id));
  }

  #setExtensionIcon(path: string, tabId?: number) {
    if (tabId === undefined) {
      // Does not work
      chrome.action.setIcon({ path });
    } else {
      chrome.action.setIcon({ path, tabId });
    }
  }

  markExtensionEnabled = () => {
    this.#isExtensionDisabled = false;
    this.#setExtensionIcon(this.#icons.DEFAULT);
    this.#updateIconStateForAllTabs();
  };

  markExtensionDisabled = () => {
    this.#isExtensionDisabled = true;
    this.#setExtensionIcon(this.#icons.DISABLED);
    this.#updateIconStateForAllTabs();
  };

  markRuleExecuted(tabId: number) {
    this.#updateIconState(tabId, "ruleExecuted", true);
  }

  markRecording(tabId: number) {
    this.#updateIconState(tabId, "isRecording", true);
  }

  markNotRecording(tabId: number) {
    this.#updateIconState(tabId, "isRecording", false);
  }

  markExtensionBlocked(tabId: number) {
    this.#updateIconState(tabId, "isBlocked", true);
  }

  markConnectedToDesktopApp() {
    this.#connectedToDesktopApp = true;
    this.#setExtensionIcon(this.#icons.CONNECTED_TO_DESKTOP_APP);
    this.#updateIconStateForAllTabs();
  }

  markDisconnectedFromDesktopApp() {
    this.#connectedToDesktopApp = false;
    this.#setExtensionIcon(this.#icons.DEFAULT);
    this.#updateIconStateForAllTabs();
  }

  getState() {
    return {
      isExtensionDisabled: this.#isExtensionDisabled,
      connectedToDesktopApp: this.#connectedToDesktopApp,
    };
  }
}

const extensionIconManager = new ExtensionIconManager();

export default extensionIconManager;
