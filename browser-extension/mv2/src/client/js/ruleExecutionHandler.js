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
  RQ.ClientUtils.sendExecutionEventToBackground(eventName, eventParams);
};

RQ.RuleExecutionHandler.handleAppliedRule = (rule) => {
  const isFirstExecution = !RQ.RuleExecutionHandler.appliedRuleIds.has(rule.id);
  if (isFirstExecution) {
    RQ.RuleExecutionHandler.appliedRuleIds.add(rule.id);
    RQ.RuleExecutionHandler.sendRuleExecutionEvent(rule);
  }
};

RQ.RuleExecutionHandler.setup = () => {
  if (window !== window.top) {
    return;
  }

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.NOTIFY_RULE_APPLIED:
        RQ.RuleExecutionHandler.handleAppliedRule(message.rule);
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
  appliedRuleDetails.forEach((appliedRuleDetail) => {
    RQ.RuleExecutionHandler.handleAppliedRule(appliedRuleDetail.rule);
    RQ.ConsoleLogger.handleMessage({
      requestDetails: appliedRuleDetail.requestDetails,
      rule: appliedRuleDetail.rule,
      isConsoleLoggerEnabled,
    });
  });
};
