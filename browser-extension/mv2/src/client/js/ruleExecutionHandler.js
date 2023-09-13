RQ.RuleExecutionHandler = {};
RQ.RuleExecutionHandler.appliedRuleIds = new Set();

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
  RQ.RuleExecutionHandler.notifyRuleAppliedToWidget(rule.id);

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
        sendResponse();
        break;

      case RQ.CLIENT_MESSAGES.GET_APPLIED_RULE_IDS:
        sendResponse(Array.from(RQ.RuleExecutionHandler.appliedRuleIds));
        break;

      case RQ.CLIENT_MESSAGES.SYNC_APPLIED_RULES:
        RQ.RuleExecutionHandler.syncCachedAppliedRules(message.appliedRuleDetails, message.isConsoleLoggerEnabled);
        sendResponse();
        break;

      case RQ.CLIENT_MESSAGES.START_RULE_TESTING:
        RQ.RuleExecutionHandler.showTestRuleWidget(message.ruleId);
        break;
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

RQ.RuleExecutionHandler.hasExecutedRules = () => {
  return RQ.RuleExecutionHandler.appliedRuleIds.size > 0;
};

RQ.RuleExecutionHandler.showTestRuleWidget = async (ruleId) => {
  if (document.querySelector("rq-test-rule-widget")) {
    return;
  }

  const { name: ruleName, ruleType } = await RQ.RulesStore.getRule(ruleId);

  const testRuleWidget = document.createElement("rq-test-rule-widget");
  testRuleWidget.classList.add("rq-element");
  testRuleWidget.setAttribute("rule-id", ruleId);
  testRuleWidget.setAttribute("rule-name", ruleName);
  testRuleWidget.setAttribute("icon-path", chrome.runtime.getURL("resources/images/128x128.png"));
  testRuleWidget.setAttribute("applied-status", RQ.RuleExecutionHandler.appliedRuleIds.has(ruleId));
  if (ruleType === "Response") {
    testRuleWidget.setAttribute(
      "info-text-content",
      `Response Modifications will not show up in the browser network devtools due to technical contraints. Checkout docs for more <a target="_blank" href="https://developers.requestly.io/http-rules/modify-response-body/">details</a>`
    );
  }

  document.documentElement.appendChild(testRuleWidget);

  testRuleWidget.addEventListener("view-results", () => {
    chrome.runtime.sendMessage({
      action: RQ.EXTENSION_MESSAGES.SAVE_TEST_RULE_RESULT,
      ruleId,
      appliedStatus: testRuleWidget?.getAttribute("applied-status") === "true",
    });
  });
};

RQ.RuleExecutionHandler.notifyRuleAppliedToWidget = (ruleId) => {
  const testRuleWidget = document.querySelector("rq-test-rule-widget");

  if (testRuleWidget?.getAttribute("applied-status") === "false") {
    testRuleWidget.dispatchEvent(
      new CustomEvent("new-rule-applied", {
        detail: {
          appliedRuleId: ruleId,
        },
      })
    );
  }
};
