(function () {
  if (!RQ.ClientUtils.isHTMLDocument()) {
    return;
  }

  // register custom elements
  RQ.ClientUtils.addRemoteJS(chrome.runtime.getURL("libs/customElements.js"));

  if (!RQ.ClientUtils.isAppPage()) {
    RQ.ConsoleLogger.setup();
    RQ.RuleExecutionHandler.setup();
    RQ.ScriptRuleHandler.setup();
    RQ.UserAgentRuleHandler.setup();
    RQ.RequestResponseRuleHandler.setup();
  }

  RQ.SessionRecorder.setup();

  if (window.top === window) {
    chrome.runtime.sendMessage({
      action: RQ.CLIENT_MESSAGES.NOTIFY_CONTENT_SCRIPT_LOADED,
      payload: {
        url: location.href,
      },
    });

    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        chrome.runtime.sendMessage({
          action: RQ.CLIENT_MESSAGES.NOTIFY_PAGE_LOADED_FROM_CACHE,
          payload: {
            url: location.href,
            hasExecutedRules: RQ.RuleExecutionHandler.hasExecutedRules(),
            isRecordingSession: RQ.SessionRecorder.isRecording,
          },
        });
      }
    });
  }
})();
