class ExtensionIconManager {
  #isExtensionDisabled = false;

  #icons = {
    DEFAULT: "/resources/images/48x48.png",
    DISABLED: "/resources/images/48x48_greyscale.png",
    RULE_EXECUTED: "/resources/images/48x48_green.png",
    DEFAULT_WITH_REC: "/resources/images/48x48_rec.png",
    RULE_EXECUTED_WITH_REC: "/resources/images/48x48_green_rec.png",
  };

  #getDefaultConfig() {
    return {
      ruleExecuted: false,
      isRecording: false,
    };
  }

  #getIcon(config) {
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

  async #updateConfig(tabId, key, value) {
    await window.tabService.ensureTabLoadingComplete(tabId);

    const existingConfig = window.tabService.getPageData(tabId, "extensionIconConfig") || this.#getDefaultConfig();

    if (existingConfig[key] !== value) {
      const newConfig = { ...existingConfig, [key]: value };

      window.tabService.setPageData(tabId, "extensionIconConfig", newConfig);
      window.tabService.setExtensionIcon(this.#getIcon(newConfig), tabId);
    }
  }

  markExtensionEnabled = () => {
    this.#isExtensionDisabled = false;
    window.tabService.setExtensionIcon(this.#icons.DEFAULT);
  };

  markExtensionDisabled = () => {
    this.#isExtensionDisabled = true;
    window.tabService.setExtensionIcon(this.#icons.DISABLED);
  };

  markRuleExecuted(tabId) {
    this.#updateConfig(tabId, "ruleExecuted", true);
  }

  markRecording(tabId) {
    this.#updateConfig(tabId, "isRecording", true);
  }

  markNotRecording(tabId) {
    this.#updateConfig(tabId, "isRecording", false);
  }
}

RQ.extensionIconManager = new ExtensionIconManager();
