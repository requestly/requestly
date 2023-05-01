class RQDevToolsPanel {
  constructor() {
    this.initState();
    this.connect();
    this.addBackgroundMessageListener();
    this.render();
    this.addEvents();
    this.sendEventFromDevtool("devtool_opened");
  }

  initState() {
    this.port = null;
    this.logs = [];
    this.filters = {
      url: "",
      ruleName: "",
    };
  }

  connect() {
    this.port = chrome.runtime.connect({ name: "rq_devtools" });
    this.port.postMessage({
      action: "registerDevTool",
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
  }

  addBackgroundMessageListener() {
    this.port.onMessage.addListener((msg) => {
      if (msg.rule) {
        const log = this.processLog(msg);
        this.sendLogToDevTools(log);
        this.renderLog(log);
      }
    });
  }

  processLog(log) {
    if (!window.startTime) {
      window.startTime = log.timestamp;
    }
    return {
      ...log,
      time: ((log.timestamp - window.startTime) / 1000).toFixed(3),
      ruleLink: RQ.CONSTANTS.RULES_PAGE_URL + "#edit/" + log.rule.id,
    };
  }

  sendLogToDevTools(log) {
    this.logs.push(log);
  }

  renderLog(log) {
    if (!this.appliesFilter(log)) {
      return;
    }

    this.getTableRows().removeClass("rq-empty-table").append(RQ.Templates.Row(log));
  }

  renderLogs() {
    this.getTableRows().empty();
    this.logs.forEach((log) => this.renderLog(log));
  }

  render() {
    this.getRootElement().html(RQ.Templates.DevtoolsPage());
    if (this.getTableRows().children().length === 0) {
      this.getTableRows().addClass("rq-empty-table");
    }
  }

  addEvents() {
    this.getRootElement()
      .on("click", ".clear-logs", () => this.clearLogs())
      .on("input", "#url-filter", () => this.filterByUrl())
      .on("input", "#rule-filter", () => this.filterByRuleName())
      .on("click", ".rule-name a", () => this.onRuleLinkClick());
  }

  appliesFilter(log) {
    return (
      log.requestURL.toLowerCase().includes(this.filters.url.toLowerCase()) &&
      log.rule.name.toLowerCase().includes(this.filters.ruleName.toLowerCase())
    );
  }

  filterByUrl() {
    this.filters.url = $("#url-filter").val();
    this.renderLogs();
  }

  filterByRuleName() {
    this.filters.ruleName = $("#rule-filter").val();
    this.renderLogs();
  }

  clearLogs() {
    this.logs = [];
    this.getTableRows().empty().addClass("rq-empty-table");
    delete window.startTime;
  }

  onRuleLinkClick() {}

  getRootElement() {
    return $("#panel");
  }

  getTableRows() {
    return $("#rows");
  }

  sendEventFromDevtool(eventName) {
    const eventTs = Date.now();

    chrome.runtime.sendMessage({
      action: "addEvent",
      payload: {
        eventName,
        eventParams: {
          source: "devtool",
          log_source: "extension",
        },
        eventTs,
      },
    });
  }
}

new RQDevToolsPanel();
