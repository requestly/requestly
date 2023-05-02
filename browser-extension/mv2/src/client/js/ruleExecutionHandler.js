RQ.RuleExecutionHandler = {
  appliedRuleIds: new Set(),
};

RQ.RuleExecutionHandler.sendRuleExecutionEvent = (rule) => {
  const eventName = "rule_executed";
  const eventParams = {
    rule_type: rule.ruleType,
    rule_id: rule.id,
    platform: "extension",
  };

  RQ.ClientUtils.sendEventToBackground(eventName, eventParams);
};

RQ.RuleExecutionHandler.setup = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.NOTIFY_RULE_APPLIED:
        const isFirstExecution = !RQ.RuleExecutionHandler.appliedRuleIds.has(message.rule.id);
        RQ.RuleExecutionHandler.appliedRuleIds.add(message.rule.id);

        if (isFirstExecution) {
          RQ.RuleExecutionHandler.sendRuleExecutionEvent(message.rule);
        }
        break;

      case RQ.CLIENT_MESSAGES.GET_APPLIED_RULE_IDS:
        sendResponse(Array.from(RQ.RuleExecutionHandler.appliedRuleIds));
        break;

      case RQ.CLIENT_MESSAGES.SYNC_APPLIED_RULES:
        RQ.RuleExecutionHandler.syncCachedAppliedRules(message.appliedRuleDetails, message.isConsoleLoggerEnabled);
        sendResponse();
        return true;
    }
    return false;
  });
};

RQ.RuleExecutionHandler.syncCachedAppliedRules = (appliedRuleDetails, isConsoleLoggerEnabled) => {
  appliedRuleDetails.forEach((appliedRule) => {
    const isFirstExecution = !RQ.RuleExecutionHandler.appliedRuleIds.has(appliedRule.id);
    RQ.RuleExecutionHandler.appliedRuleIds.add(appliedRule.rule.id);
    RQ.ConsoleLogger.handleMessage({
      requestDetails: appliedRule.requestDetails,
      rule: appliedRule.rule,
      isConsoleLoggerEnabled,
    });
    if (isFirstExecution) {
      RQ.RuleExecutionHandler.sendRuleExecutionEvent(appliedRule.rule);
    }
  });
};
