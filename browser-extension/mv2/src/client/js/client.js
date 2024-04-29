(function () {
  if (!RQ.ClientUtils.isHTMLDocument()) {
    return;
  }

  chrome.runtime.sendMessage(
    {
      action: RQ.EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED,
    },
    (isExtensionEnabled) => {
      if (isExtensionEnabled) {
        if (window.top === window) {
          chrome.runtime.connect(); // connect to background
          window.addEventListener("pageshow", (event) => {
            if (event.persisted) {
              chrome.runtime.sendMessage({
                action: RQ.CLIENT_MESSAGES.NOTIFY_PAGE_LOADED_FROM_CACHE,
                payload: {
                  hasExecutedRules: RQ.RuleExecutionHandler.hasExecutedRules(),
                  isRecordingSession: RQ.SessionRecorder.isRecording,
                },
              });
            }
          });
        }

        if (!RQ.ClientUtils.isAppPage()) {
          RQ.RuleExecutionHandler.setup();
          RQ.RequestResponseRuleHandler.setup();
          RQ.ScriptRuleHandler.setup();
          RQ.UserAgentRuleHandler.setup();
        }

        // register custom elements
        RQ.ClientUtils.addJSFromURL(chrome.runtime.getURL("libs/customElements.js"));

        RQ.SessionRecorder.setup();
      }
    }
  );
})();
