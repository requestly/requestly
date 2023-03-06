(function () {
  if (!RQ.ClientUtils.isHTMLDocument()) {
    return;
  }

  chrome.runtime.sendMessage(
    {
      action: RQ.EXTENSION_MESSAGES.CHECK_IF_EXTENSION_ENABLED,
    },
    (isExtensionEnabled) => {
      if (!isExtensionEnabled) {
        return;
      }

      RQ.ConsoleLogger.setup();
      RQ.RuleExecutionHandler.setup();
      RQ.ScriptRuleHandler.setup();
      RQ.SessionRecorder.setup();
      RQ.UserAgentRuleHandler.setup();
      RQ.RequestResponseRuleHandler.setup();

      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_CONTENT_SCRIPT_LOADED,
      });
    }
  );
})();
