class ExtensionIconManager {
  #isExtensionDisabled = false;

  #icons = {
    DEFAULT: "/resources/images/48x48.png",
    DISABLED: "/resources/images/48x48_greyscale.png",
    RULE_EXECUTED: "/resources/images/48x48_green.png",
    DEFAULT_WITH_REC: "/resources/images/48x48_rec.png",
    RULE_EXECUTED_WITH_REC: "/resources/images/48x48_green_rec.png",
  };

  #CONSTANTS = {
    PAGE_DATA_ICON_CONFIG: "extensionIconConfig",
  };

  constructor() {
    chrome.tabs.onUpdated.addListener((tabId) => {
      if (window.tabService.getPageData(tabId, this.#CONSTANTS.PAGE_DATA_ICON_CONFIG)) {
        this.#updateIconState(tabId);
      }
    });
  }

  #getDefaultConfig() {
    return {
      ruleExecuted: false,
      isRecording: false,
    };
  }

  #getIcon(config) {
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

    return this.#icons.DEFAULT;
  }

  #updateIconState(tabId, newConfigKey, newConfigValue) {
    let config =
      window.tabService.getPageData(tabId, this.#CONSTANTS.PAGE_DATA_ICON_CONFIG) || this.#getDefaultConfig();

    if (newConfigKey && config[newConfigKey] !== newConfigValue) {
      config = { ...config, [newConfigKey]: newConfigValue };
      window.tabService.setPageData(tabId, this.#CONSTANTS.PAGE_DATA_ICON_CONFIG, config);
    }

    window.tabService.setExtensionIcon(this.#getIcon(config), tabId);
  }

  #updateIconStateForAllTabs() {
    const tabsWithIconConfig = window.tabService.getTabsWithPageDataFilter((pageData) => {
      return !!pageData[this.#CONSTANTS.PAGE_DATA_ICON_CONFIG];
    });
    tabsWithIconConfig.forEach((tab) => this.#updateIconState(tab.id));
  }

  markExtensionEnabled = () => {
    this.#isExtensionDisabled = false;
    window.tabService.setExtensionIcon(this.#icons.DEFAULT);
    this.#updateIconStateForAllTabs();
  };

  markExtensionDisabled = () => {
    this.#isExtensionDisabled = true;
    window.tabService.setExtensionIcon(this.#icons.DISABLED);
    this.#updateIconStateForAllTabs();
  };

  markRuleExecuted(tabId) {
    this.#updateIconState(tabId, "ruleExecuted", true);
  }

  markRecording(tabId) {
    this.#updateIconState(tabId, "isRecording", true);
  }

  markNotRecording(tabId) {
    this.#updateIconState(tabId, "isRecording", false);
  }
}

RQ.extensionIconManager = new ExtensionIconManager();
