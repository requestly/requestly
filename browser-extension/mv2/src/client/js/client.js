(function () {
  if (!RQ.ClientUtils.isHTMLDocument()) {
    return;
  }

  RQ.ConsoleLogger.setup();
  RQ.RuleExecutionHandler.setup();
  RQ.ScriptRuleHandler.setup();
  RQ.SessionRecorder.setup();
  RQ.UserAgentRuleHandler.setup();
  RQ.RequestResponseRuleHandler.setup();

  chrome.runtime.sendMessage({
    action: RQ.Constants.CLIENT_MESSAGES.NOTIFY_CONTENT_SCRIPT_LOADED,
  });
})();
