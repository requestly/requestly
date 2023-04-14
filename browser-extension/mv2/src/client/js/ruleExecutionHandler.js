RQ.RuleExecutionHandler = {
  appliedRuleIds: new Set(),
};

RQ.RuleExecutionHandler.setup = () => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case RQ.CLIENT_MESSAGES.UPDATE_APPLIED_RULE_ID:
        const isFirstExecution = !RQ.RuleExecutionHandler.appliedRuleIds.has(message.ruleId);

        RQ.RuleExecutionHandler.appliedRuleIds.add(message.ruleId);
        sendResponse({ isFirstExecution });
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
    RQ.RuleExecutionHandler.appliedRuleIds.add(appliedRule.rule.id);

    RQ.ConsoleLogger.handleMessage({
      requestDetails: appliedRule.requestDetails,
      rule: appliedRule.rule,
      isConsoleLoggerEnabled,
    });
  });
};
