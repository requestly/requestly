/* Logs are stored in following format:
  logs: {
    <tabId>: {
      <domain>: [
        { id, timestamp, ruleId, ruleName, requestURL, description }
      ]
    }
  }
 */

var RuleLoggerService = function () {
  this.construct.apply(this, arguments);
};

RuleLoggerService.prototype = {
  construct: function () {
    const that = this;

    this.logs = {};
    this._listeners = {};

    if (chrome.tabs) {
      chrome.tabs.onRemoved.addListener(this.clearLogsForTab.bind(this));
    }
  },

  /**
   * Consumer of RuleLoggerService can add listener and this will invoke callback whenever logs for a tab are changed
   * @param tabId
   * @param callback
   */
  addChangeListener: function (tabId, callback) {
    if (typeof callback !== "function") {
      return;
    }

    this._listeners[tabId] = this._listeners[tabId] || [];
    this._listeners[tabId].push(callback);
  },

  removeChangeListener: function (tabId, callback) {
    if (typeof callback !== "function" || !this._listeners[tabId]) {
      return;
    }

    let listenerIndex = this._listeners[tabId].indexOf(callback);
    if (listenerIndex >= 0) {
      this._listeners[tabId].splice(listenerIndex, 1);
    }
  },

  _invokeListeners: function (tabId) {
    if (this._listeners[tabId] && this._listeners[tabId].length) {
      this._listeners[tabId].forEach((listener) => listener());
    }
  },

  _hasUpdates: function (newLogs, oldLogs) {
    if ((!newLogs && oldLogs) || (newLogs && !oldLogs)) {
      return true;
    }

    return JSON.stringify(newLogs) !== JSON.stringify(oldLogs);
  },

  sendLogToDevTools: function (rule, requestDetails, description) {
    const log = {
      id: this._generateLogId(),
      timestamp: Date.now(),
      ruleId: rule.id,
      requestURL: requestDetails.url,
      description: description,
    };

    const tabId = requestDetails.tabId;
    const tabUrl = window.tabService.getTabUrl(tabId);
    const domain = RQ.Utils.extractUrlComponent(tabUrl, RQ.URL_COMPONENTS.HOST);

    this.addLogToDomain(tabId, domain, log);
    this._invokeListeners(tabId);
  },

  addLogToDomain: function (tabId, domain, log) {
    let domainLogs = this.logs[tabId] && this.logs[tabId][domain];

    if (domainLogs) {
      // Limit number of logs to be maintained
      const MAX_LOGS_COUNT = 50;
      if (domainLogs.length >= MAX_LOGS_COUNT) {
        domainLogs.splice(0, domainLogs.length - MAX_LOGS_COUNT + 1);
      }

      domainLogs.push(log);
    } else {
      // To optimize, we discard previous domain logs. But as a downside, log for redirect rule applied on last page will be lost.
      this.logs[tabId] = { [domain]: [log] };
    }
  },

  getLogsByTabId: function (tabId, populateRuleData) {
    const logs = this.logs[tabId] || {};

    if (populateRuleData) {
      for (let domain in logs) {
        let domainLogs = logs[domain];
        domainLogs.forEach((log) => {
          log.ruleData = RQ.StorageService.getCachedRecord(log.ruleId);
        });
      }
    }

    return logs;
  },

  clearInactiveTabLogs: function () {
    if (!window.tabService) {
      return;
    }

    for (let tabId in this.logs) {
      if (!window.tabService.getTab(tabId)) {
        delete this.logs[tabId];
        delete this._listeners[tabId];
      }
    }
  },

  clearLogsForDomain: function (tabId, domain) {
    if (this.logs[tabId] && this.logs[tabId][domain]) {
      delete this.logs[tabId][domain];

      if (Object.keys(this.logs[tabId]).length === 0) {
        delete this.logs[tabId];
      }
    }
  },

  clearLogsForTab: function (tabId) {
    if (this.logs[tabId]) {
      delete this.logs[tabId];
    }

    if (this._listeners[tabId]) {
      delete this._listeners[tabId];
    }

    // Whenever tab is closed, also remove any inactive logs tab
    this.clearInactiveTabLogs();
  },

  _generateLogId: function () {
    return Math.ceil(Math.random() * 100) + Date.now();
  },
};
