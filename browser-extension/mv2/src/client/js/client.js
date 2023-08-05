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

  chrome.runtime.sendMessage({
    action: RQ.CLIENT_MESSAGES.NOTIFY_CONTENT_SCRIPT_LOADED,
    payload: {
      isIframe: window.top !== window,
    },
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_PAGE_LOADED_FROM_CACHE,
        payload: {
          isIframe: window.top !== window,
          hasExecutedRules: RQ.RuleExecutionHandler.hasExecutedRules(),
          isRecordingSession: RQ.SessionRecorder.isRecording,
        },
      });
    }
  });
})();
