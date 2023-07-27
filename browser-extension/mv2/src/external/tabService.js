(function (window, chrome) {
  class TabService {
    map = {};

    dataScope = {
      TAB: "tabData", // tab-level data
      PAGE: "pageData", // page-level data, will wipe out when page unloads
    };

    constructor() {
      this.initTabs();
      this.addEventListeners();
    }

    initTabs() {
      chrome.tabs.query({}, (tabs) => {
        this.map = {};
        tabs.forEach((tab) => this.addOrUpdateTab(tab));
      });
    }

    addOrUpdateTab(tab) {
      // A special ID value given to tabs that are not browser tabs (for example, apps and devtools windows)
      if (tab.id !== chrome.tabs.TAB_ID_NONE) {
        this.map[tab.id] = tab;
      }
    }

    removeTab(tabId) {
      delete this.map[tabId];
    }

    addEventListeners() {
      chrome.tabs.onCreated.addListener((tab) => this.addOrUpdateTab(tab));

      chrome.tabs.onRemoved.addListener((tabId) => this.removeTab(tabId));

      chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
        this.removeTab(removedTabId);
        chrome.tabs.get(addedTabId, (tab) => this.addOrUpdateTab(tab));
      });

      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        const existingTab = this.getTab(tabId);

        if (!existingTab) {
          return;
        }

        const newTabState = {
          ...tab,
          [this.dataScope.TAB]: existingTab[this.dataScope.TAB] || {},
        };

        if (changeInfo.status === "loading") {
          newTabState[this.dataScope.PAGE] = {};
        }

        this.addOrUpdateTab(newTabState);
      });

      chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
          if (details.type === "main_frame") {
            const tab = this.getTab(details.tabId) || { id: details.tabId };
            this.addOrUpdateTab({ ...tab, url: details.url });
          }
        },
        { urls: ["<all_urls>"] }
      );
    }

    getTabs() {
      return this.map;
    }

    getTab(tabId) {
      return this.map[tabId];
    }

    getTabUrl(tabId) {
      var tab = this.getTab(tabId);
      return tab && tab.url;
    }

    focusTab(tabId) {
      var tab = this.getTab(tabId);

      if (tab && tab.windowId) {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.highlight({ windowId: tab.windowId, tabs: tab.index });
        });
        return true;
      }

      return false;
    }

    closeTab(tabId) {
      chrome.tabs.remove(tabId);
    }

    ensureTabLoadingComplete(tabId) {
      return new Promise((resolve, reject) => {
        const tab = this.getTab(tabId);

        if (tab) {
          if (tab.status === "complete") {
            resolve();
          } else {
            const handler = (currentTabId, tabChangeInfo) => {
              if (currentTabId === tabId && tabChangeInfo.status === "complete") {
                resolve();
                chrome.tabs.onUpdated.removeListener(handler);
              }
            };
            chrome.tabs.onUpdated.addListener(handler);
          }
        } else {
          reject();
        }
      });
    }

    setDataForScope(scope, tabId, key, value) {
      const tab = this.getTab(tabId);

      if (!tab) {
        return;
      }

      // null safe for firefox as in firefox get/set happen before tab updation whereas
      // in chrome get/set happens after tab updation
      if (tab[scope]) {
        tab[scope][key] = value;
      } else {
        tab[scope] = { [key]: value };
      }
    }

    getDataForScope(scope, tabId, key, defaultValue) {
      const tab = this.getTab(tabId);

      if (!tab) {
        return;
      }

      return tab[scope]?.[key] || defaultValue;
    }

    removeDataForScope(scope, tabId, key) {
      const tab = this.getTab(tabId);

      if (!tab || !tab[scope]) {
        return;
      }

      delete tab[scope][key];
    }

    getTabsWithDataFilterForScope(scope, dataFilter) {
      return Object.values(this.getTabs()).filter((tab) => dataFilter(tab[scope] || {}));
    }

    setData(...args) {
      this.setDataForScope(this.dataScope.TAB, ...args);
    }

    getData(...args) {
      return this.getDataForScope(this.dataScope.TAB, ...args);
    }

    removeData(...args) {
      this.removeDataForScope(this.dataScope.TAB, ...args);
    }

    getTabsWithDataFilter(dataFilter) {
      return this.getTabsWithDataFilterForScope(this.dataScope.TAB, dataFilter);
    }

    setPageData(tabId, ...args) {
      this.setDataForScope(this.dataScope.PAGE, tabId, ...args);
    }

    getPageData(tabId, ...args) {
      return this.getDataForScope(this.dataScope.PAGE, tabId, ...args);
    }

    removePageData(tabId, ...args) {
      return this.removeDataForScope(this.dataScope.PAGE, tabId, ...args);
    }

    getTabsWithPageDataFilter(dataFilter) {
      return this.getTabsWithDataFilterForScope(this.dataScope.PAGE, dataFilter);
    }

    promisifiedSetIcon(tabId, path) {
      return new Promise((resolve) => {
        chrome.browserAction.setIcon({ tabId, path }, resolve);
      });
    }

    // do not pass tabId to set icon globally
    async setExtensionIcon(path, tabId) {
      if (typeof tabId === "undefined") {
        chrome.browserAction.setIcon({ path });
        return;
      }

      await this.ensureTabLoadingComplete(tabId);

      // on invoking setIcon multiple times simultaneously in a tab may lead to inconsistency without synchronization
      let setIconSynchronizer = this.getPageData(tabId, "setIconSynchronizer");
      if (!setIconSynchronizer) {
        setIconSynchronizer = Promise.resolve();
      }

      this.setPageData(
        tabId,
        "setIconSynchronizer",
        setIconSynchronizer.then(() => this.promisifiedSetIcon(tabId, path))
      );
    }
  }

  // Create only single instance of TabService
  if (typeof window.tabService === "undefined") {
    window.tabService = new TabService();
  }
})(window, chrome);
