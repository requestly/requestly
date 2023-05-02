(function (window, chrome) {
  var TabService = function () {
    this.construct.apply(this, arguments);
  };

  TabService.prototype = {
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
          tab.data = {};
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
        that.map[tabId] = { ...tab, data: that.map[tabId].data || {} };
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

    setData: function (tabId, key, value) {
      if (!this.map.hasOwnProperty(tabId)) {
        return;
      }
      // null safe for firefox as in firefox get/set happen before tab updation whereas
      // in chrome get/set happens after tab updation
      if (this.map[tabId].hasOwnProperty("data")) {
        this.map[tabId].data[key] = value;
      } else {
        this.map[tabId].data = { [key]: value };
      }
    },

    getData: function (tabId, key, defaultValue) {
      if (!this.map.hasOwnProperty(tabId)) {
        return null;
      }

      return this.map[tabId].data?.[key] || defaultValue;
    },

    removeData: function (tabId, key) {
      if (!this.map.hasOwnProperty(tabId)) {
        return;
      }

      delete this.map[tabId].data?.[key];
    },
  };

  // Create only single instance of TabService
  if (typeof window.tabService === "undefined") {
    window.tabService = new TabService();
  }
})(window, chrome);
