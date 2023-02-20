chrome = {
  runtime: {
    sendMessage: function () {},
    onMessage: {
      addListener: function () {},
    },
    getManifest: function () {
      return {
        description:
          "Mozilla Firefox addon to modify HTTP requests (Redirect | Cancel | Replace | Modify Headers)",
      };
    },
    getURL: (url) => `chrome-extension://requestly/${url}`,
    onInstalled: {
      addListener: function () {},
    },
  },
  contextMenus: {
    create: function () {},
    update: function () {},
    removeAll: function () {},
  },

  extension: {
    getBackgroundPage: function () {},
  },

  tabs: {
    TAB_ID_NONE: -1,
    get: function () {},
    query: function () {},
    onCreated: {
      addListener: function () {},
    },
    onReplaced: {
      addListener: function () {},
    },
    onRemoved: {
      addListener: function () {},
    },
    onUpdated: {
      addListener: function () {},
    },
  },

  browserAction: {
    onClicked: {
      addListener: function (listener) {},
    },
    setIcon: function () {},
  },

  /**
   * Mock Implementation of Chrome Storage API
   * @Reference https://developer.chrome.com/extensions/storage
   */
  storage: {
    onChanged: {
      _listeners: [],

      addListener: function (listener) {
        this._listeners.push(listener);
      },
    },

    sync: {
      _records: {},

      get: function (key, callback) {
        var result;

        if (!key) {
          result = this._records;
        } else {
          result = this._records[key] || {};
        }

        typeof callback === "function" && callback.call(null, result);
      },

      set: function (object, callback) {
        this._records = extend(this._records, object);

        typeof callback === "function" && callback.call(null, object);
      },

      remove: function (record, callback) {
        var attrName;

        for (attrName in record) {
          delete this._records[attrName];
        }

        typeof callback === "function" && callback.call(null);
      },

      clear: function () {
        this._records = {};
      },
    },

    local: {
      _records: {},

      get: function (key, callback) {
        var result;

        if (!key) {
          result = this._records;
        } else {
          result = this._records[key] || {};
        }

        typeof callback === "function" && callback.call(null, result);
      },

      set: function (object, callback) {
        this._records = extend(this._records, object);

        typeof callback === "function" && callback.call(null, object);
      },

      remove: function (record, callback) {
        var attrName;

        for (attrName in record) {
          delete this._records[attrName];
        }

        typeof callback === "function" && callback.call(null);
      },

      clear: function () {
        this._records = {};
      },
    },
  },

  webRequest: {
    onBeforeRequest: {
      addListener: function () {},
      hasListener: function () {},
      removeListener: function () {},
    },
    onBeforeSendHeaders: {
      addListener: function () {},
      hasListener: function () {},
      removeListener: function () {},
    },
    onHeadersReceived: {
      addListener: function () {},
      hasListener: function () {},
      removeListener: function () {},
    },
  },
};
