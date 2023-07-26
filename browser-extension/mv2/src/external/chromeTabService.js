(function (window, chrome) {
  var TabService = function () {
    this.construct.apply(this, arguments);
  };

  TabService.prototype = {
    dataScope: {
      TAB: "tabData",
      PAGE: "pageData",
    },

    construct: function () {
      this.map = {};
      this.initTabs();
      this.registerBinders();
      this.addEventListeners();
    },

    initTabs: function () {
      var that = this;
      chrome.tabs.query({}, function (tabs) {
        that.map = {};
        for (var i = 0; i < tabs.length; i++) {
          var tab = tabs[i];
          that.map[tab.id] = tab;
        }
      });
    },

    addEventListeners: function () {
      var that = this;

      chrome.tabs.onCreated.addListener(function (tab) {
        that.map[tab.id] = tab;
      });

      this.addOnClosedListener(this.handleTabClosed);

      chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
        that.map.hasOwnProperty(removedTabId) && delete that.map[removedTabId];
        chrome.tabs.get(addedTabId, function (tab) {
          that.map[tab.id] = tab;
        });
      });

      chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (!that.map.hasOwnProperty(tabId)) {
          return;
        }
        that.map[tabId] = {
          ...tab,
          [that.dataScope.TAB]: that.map[tabId][that.dataScope.TAB] || {},
        };

        if (changeInfo.status === "loading") {
          that.map[tabId][that.dataScope.PAGE] = {};
        }
      });

      chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
          if (details.type === "main_frame") {
            that.map[details.tabId] = that.map[details.tabId] || {};
            that.map[details.tabId]["url"] = details.url;
          }
        },
        { urls: ["<all_urls>"] }
      );
    },

    registerBinders: function () {
      this.handleTabClosed = this.handleTabClosed.bind(this);
    },

    getTabs: function () {
      return this.map;
    },

    getTab: function (tabId) {
      return this.map[tabId];
    },

    getTabUrl: function (tabId) {
      var tab = this.getTab(tabId);
      return tab && tab.url;
    },

    focusTab: function (tabId) {
      var tab = this.map[tabId];

      if (tab && tab.windowId) {
        chrome.windows.update(tab.windowId, { focused: true }, function () {
          chrome.tabs.highlight({ windowId: tab.windowId, tabs: tab.index });
        });
        return true;
      }

      return false;
    },

    closeTab: function (tabId) {
      chrome.tabs.remove(tabId);
    },

    handleTabClosed: function (tabId) {
      this.map.hasOwnProperty(tabId) && delete this.map[tabId];
    },

    addOnClosedListener: function (listener) {
      if (typeof listener !== "function") {
        console.error("Chrome Tab Service: Invalid listener passed as onClosedListener ", listener);
      }

      chrome.tabs.onRemoved.addListener(listener);
    },

    ensureTabLoadingComplete: function (tabId) {
      return new Promise((resolve, reject) => {
        const tab = this.map[tabId];

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
    },

    setDataForScope: function (scope, tabId, key, value) {
      if (!this.map.hasOwnProperty(tabId)) {
        return;
      }

      // null safe for firefox as in firefox get/set happen before tab updation whereas
      // in chrome get/set happens after tab updation
      if (this.map[tabId].hasOwnProperty(scope)) {
        this.map[tabId][scope][key] = value;
      } else {
        this.map[tabId][scope] = { [key]: value };
      }
    },

    getDataForScope: function (scope, tabId, key, defaultValue) {
      if (!this.map.hasOwnProperty(tabId)) {
        return null;
      }

      return this.map[tabId][scope]?.[key] || defaultValue;
    },

    removeDataForScope: function (scope, tabId, key) {
      if (!this.map.hasOwnProperty(tabId)) {
        return;
      }

      delete this.map[tabId][scope]?.[key];
    },

    getTabsWithDataFilterForScope: function (scope, dataFilter) {
      return Object.values(this.getTabs()).filter((tab) => dataFilter(tab[scope] || {}));
    },

    setData: function (...args) {
      this.setDataForScope(this.dataScope.TAB, ...args);
    },

    getData: function (...args) {
      return this.getDataForScope(this.dataScope.TAB, ...args);
    },

    removeData: function (...args) {
      this.removeDataForScope(this.dataScope.TAB, ...args);
    },

    getTabsWithDataFilter: function (dataFilter) {
      return this.getTabsWithDataFilterForScope(this.dataScope.TAB, dataFilter);
    },

    setPageData: function (tabId, ...args) {
      this.setDataForScope(this.dataScope.PAGE, tabId, ...args);
    },

    getPageData: function (tabId, ...args) {
      return this.getDataForScope(this.dataScope.PAGE, tabId, ...args);
    },

    removePageData: function (tabId, ...args) {
      return this.removeDataForScope(this.dataScope.PAGE, tabId, ...args);
    },

    getTabsWithPageDataFilter: function (dataFilter) {
      return this.getTabsWithDataFilterForScope(this.dataScope.PAGE, dataFilter);
    },

    promisifiedSetIcon: function (tabId, path) {
      return new Promise((resolve) => {
        chrome.browserAction.setIcon({ tabId, path }, resolve);
      });
    },

    // do not pass tabId to set icon globally
    setExtensionIcon: async function (path, tabId) {
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
    },
  };

  // Create only single instance of TabService
  if (typeof window.tabService === "undefined") {
    window.tabService = new TabService();
  }
})(window, chrome);
