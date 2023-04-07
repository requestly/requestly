RQ.RuleExecutionHandler = {
  appliedRuleIds: new Set(),
};

RQ.RuleExecutionHandler.setup = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case RQ.Constants.CLIENT_MESSAGES.UPDATE_APPLIED_RULE_ID:
        RQ.RuleExecutionHandler.appliedRuleIds.add(message.ruleId);
        break;

      case RQ.Constants.CLIENT_MESSAGES.GET_APPLIED_RULE_IDS:
        sendResponse(Array.from(RQ.RuleExecutionHandler.appliedRuleIds));
        break;

      case RQ.Constants.CLIENT_MESSAGES.SYNC_APPLIED_RULES:
        RQ.RuleExecutionHandler.syncCachedAppliedRules(message.appliedRuleDetails, message.isConsoleLoggerEnabled);
        sendResponse();
        return true;
    }
    return false;
  });
};

RQ.RuleExecutionHandler.syncCachedAppliedRules = (appliedRuleDetails, isConsoleLoggerEnabled) => {
  appliedRuleDetails.forEach((appliedRule) => {
    RQ.RuleExecutionHandler.appliedRuleIds.add(appliedRule.rule.id);

    RQ.ConsoleLogger.handleMessage({
      requestDetails: appliedRule.requestDetails,
      rule: appliedRule.rule,
      isConsoleLoggerEnabled,
    });
  });
};
