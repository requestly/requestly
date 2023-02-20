(function () {
  if (!RQ.ClientUtils.isHTMLDocument()) {
    return;
  }
  RQ.ConsoleLogger.setup();
  RQ.RuleExecutionHandler.setup();
  RQ.ScriptRuleHandler.setup();
  RQ.SessionRecorder.setup();
  RQ.UserAgentRuleHandler.setup();

  chrome.runtime.sendMessage(
    {
      action: RQ.CLIENT_MESSAGES.DO_REQUEST_RESPONSE_RULES_EXIST,
    },
    function (doRequestResponseRulesExist) {
      if (doRequestResponseRulesExist) {
        RQ.RequestResponseRuleHandler.setup();
      }
    }
  );
})();
