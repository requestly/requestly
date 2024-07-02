import { tabService } from "./tabService";

interface ExtensionIconConfig {
  ruleExecuted?: boolean;
  isRecording?: boolean;
  isBlocked?: boolean;
}

class ExtensionIconManager {
  #isExtensionDisabled = false;

  #icons = {
    DEFAULT: "/resources/images/48x48.png",
    DISABLED: "/resources/images/48x48_greyscale.png",
    BLOCKED: "/resources/images/48x48_blocked.png",
    RULE_EXECUTED: "/resources/images/48x48_green.png",
    DEFAULT_WITH_REC: "/resources/images/48x48_rec.png",
    RULE_EXECUTED_WITH_REC: "/resources/images/48x48_green_rec.png",
  };

  #CONSTANTS = {
    PAGE_DATA_ICON_CONFIG: "extensionIconConfig",
  };

  constructor() {
    chrome.tabs.onUpdated.addListener((tabId) => {
      // FIXME: Can be made better by only listening to url changes on tabs
      this.#updateIconState(tabId);
    });
  }

  #getDefaultConfig(): ExtensionIconConfig {
    return {
      ruleExecuted: false,
      isRecording: false,
    };
  }

  #getIcon(config: ExtensionIconConfig) {
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
    // tabService.setExtensionIcon(this.#getIcon(config), tabId);
  }

  #updateIconStateForAllTabs() {
    const tabsMap = tabService.getTabs();
    Object.values(tabsMap).forEach((tab) => this.#updateIconState(tab.id));
  }

  #setExtensionIcon(path: string, tabId?: number) {
    if (tabId === undefined) {
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
    console.log("!!!debug", "markExtesnionBlocked", tabId);
    this.#updateIconState(tabId, "isBlocked", true);
  }
}

const extensionIconManager = new ExtensionIconManager();

export default extensionIconManager;
