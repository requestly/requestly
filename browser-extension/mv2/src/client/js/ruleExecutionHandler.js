RQ.RuleExecutionHandler = {};
RQ.RuleExecutionHandler.appliedRuleIds = new Set();
RQ.RuleExecutionHandler.implicitTestRuleFlowEnabled = false;
RQ.RuleExecutionHandler.implictTestRuleWidgetConfig = null;

RQ.RuleExecutionHandler.sendRuleExecutionEvent = (rule) => {
  const eventName = "rule_executed";
  const eventParams = {
    rule_type: rule.ruleType,
    rule_id: rule.id,
    platform: "extension",
    rule_creator: rule.createdBy,
  };
  RQ.ClientUtils.sendExecutionEventToBackground(eventName, eventParams);
};

RQ.RuleExecutionHandler.handleAppliedRule = (rule) => {
  const isFirstExecution = !RQ.RuleExecutionHandler.appliedRuleIds.has(rule.id);
  if (isFirstExecution) {
    RQ.RuleExecutionHandler.appliedRuleIds.add(rule.id);
    RQ.RuleExecutionHandler.sendRuleExecutionEvent(rule);
  }

  if (RQ.RuleExecutionHandler.implicitTestRuleFlowEnabled) {
    RQ.RuleExecutionHandler.checkAppliedRuleAndNotifyWidget(rule);
  } else {
    RQ.RuleExecutionHandler.notifyRuleAppliedToExplicitWidget(rule.id);
  }
};

RQ.RuleExecutionHandler.setup = async () => {
  if (window !== window.top) {
    return;
  }

  RQ.RuleExecutionHandler.fetchAndStoreImplicitTestRuleWidgetConfig();

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

      case RQ.CLIENT_MESSAGES.START_EXPLICIT_RULE_TESTING:
        if (message.record) {
          chrome.runtime.sendMessage({
            action: RQ.EXTENSION_MESSAGES.START_RECORDING_EXPLICITLY,
            showWidget: false,
          });
        }
        RQ.RuleExecutionHandler.showExplicitTestRuleWidget(message.ruleId);
        break;

      case RQ.CLIENT_MESSAGES.START_IMPLICIT_RULE_TESTING:
        RQ.RuleExecutionHandler.implicitTestRuleFlowEnabled = true;
        RQ.RuleExecutionHandler.showImplicitTestRuleWidget();

        break;
    }

    return false;
  });
};

RQ.RuleExecutionHandler.syncCachedAppliedRules = (appliedRuleDetails, isConsoleLoggerEnabled) => {
  appliedRuleDetails.forEach((appliedRuleDetail) => {
    RQ.RuleExecutionHandler.handleAppliedRule(appliedRuleDetail.rule);
  });
};

RQ.RuleExecutionHandler.hasExecutedRules = () => {
  return RQ.RuleExecutionHandler.appliedRuleIds.size > 0;
};

RQ.RuleExecutionHandler.showExplicitTestRuleWidget = async (ruleId) => {
  if (document.querySelector("rq-explicit-test-rule-widget")) {
    return;
  }

  const ruleDetails = await RQ.RulesStore.getRule(ruleId);
  const { name: ruleName } = ruleDetails;

  const testRuleWidget = document.createElement("rq-explicit-test-rule-widget");
  testRuleWidget.classList.add("rq-element");
  testRuleWidget.setAttribute("rule-id", ruleId);
  testRuleWidget.setAttribute("rule-name", ruleName);
  testRuleWidget.setAttribute("applied-status", RQ.RuleExecutionHandler.appliedRuleIds.has(ruleId));
  RQ.RuleExecutionHandler.setWidgetInfoText(testRuleWidget, ruleDetails);

  document.documentElement.appendChild(testRuleWidget);

  testRuleWidget.addEventListener("view-results", () => {
    chrome.runtime.sendMessage({
      action: RQ.EXTENSION_MESSAGES.SAVE_TEST_RULE_RESULT,
      ruleId,
      appliedStatus: testRuleWidget?.getAttribute("applied-status") === "true",
    });
  });
};

RQ.RuleExecutionHandler.showImplicitTestRuleWidget = async () => {
  if (document.querySelector("rq-implicit-test-rule-widget")) {
    return;
  }

  const testRuleWidget = document.createElement("rq-implicit-test-rule-widget");

  testRuleWidget.classList.add("rq-element");
  testRuleWidget.style.display = "none";

  document.documentElement.appendChild(testRuleWidget);

  testRuleWidget.addEventListener("view_rule_in_editor", (data) => {
    window.open(`${RQ.configs.WEB_URL}/rules/editor/edit/${data.detail.ruleId}`, "_blank");
  });

  testRuleWidget.addEventListener("open_app_settings", () => {
    window.open(`${RQ.configs.WEB_URL}/settings/global-settings`, "_blank");
  });

  testRuleWidget.addEventListener("rule_applied_listener_active", async () => {
    const ruleIds = Array.from(RQ.RuleExecutionHandler.appliedRuleIds);
    for (let ruleId of ruleIds) {
      const ruleDetails = await RQ.RulesStore.getRule(ruleId);
      RQ.RuleExecutionHandler.checkAppliedRuleAndNotifyWidget(ruleDetails);
    }
  });
};

RQ.RuleExecutionHandler.setWidgetInfoText = (testRuleWidget, ruleDetails) => {
  const { ruleType } = ruleDetails;

  switch (ruleType) {
    case "Response":
      testRuleWidget.setAttribute(
        "rq-test-rule-text",
        `Response Modifications will not show up in the browser network devtools due to technical contraints. Checkout docs for more <a target="_blank" href="https://docs.requestly.com/general/http-rules/rule-types/modify-response-body/">details</a>.`
      );
      break;
    case "Headers":
      const responseHeaderExists = ruleDetails.pairs.some((pair) => {
        return pair?.modifications?.Response?.length > 0;
      });
      responseHeaderExists &&
        testRuleWidget.setAttribute(
          "rq-test-rule-text",
          `Response Header Modifications will not show up in the browser network devtools due to technical constraints. Checkout docs for more <a target="_blank" href="https://docs.requestly.com/general/http-rules/rule-types/modify-headers/">details</a>.`
        );
      break;
    default:
      return;
  }
};

RQ.RuleExecutionHandler.notifyRuleAppliedToExplicitWidget = (ruleId) => {
  const explicitTestRuleWidget = document.querySelector("rq-explicit-test-rule-widget");

  if (explicitTestRuleWidget?.getAttribute("applied-status") === "false") {
    if (explicitTestRuleWidget.getAttribute("rule-id") === ruleId) {
      explicitTestRuleWidget.setAttribute("applied-status", true);
    }

    explicitTestRuleWidget.dispatchEvent(
      new CustomEvent("new-rule-applied", {
        detail: {
          appliedRuleId: ruleId,
        },
      })
    );
  }
};

RQ.RuleExecutionHandler.notifyRuleAppliedToImplicitWidget = (rule) => {
  const implicitTestRuleWidget = document.querySelector("rq-implicit-test-rule-widget");

  if (implicitTestRuleWidget) {
    implicitTestRuleWidget.dispatchEvent(
      new CustomEvent("new-rule-applied", {
        detail: {
          appliedRuleId: rule.id,
          appliedRuleName: rule.name,
          appliedRuleType: rule.ruleType,
        },
      })
    );

    implicitTestRuleWidget.style.display = "block";
  }
};

RQ.RuleExecutionHandler.fetchAndStoreImplicitTestRuleWidgetConfig = () => {
  chrome.storage.local.get(RQ.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG, function (result) {
    RQ.RuleExecutionHandler.implictTestRuleWidgetConfig = result[RQ.STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG];
  });
};

RQ.RuleExecutionHandler.checkAppliedRuleAndNotifyWidget = (rule) => {
  const implicitTestRuleConfig = RQ.RuleExecutionHandler.implictTestRuleWidgetConfig;

  if (!implicitTestRuleConfig?.enabled) {
    return;
  }

  if (implicitTestRuleConfig?.visibility === RQ.IMPLICIT_RULE_TESTING_WIDGET_VISIBILITY.SPECIFIC) {
    if (!implicitTestRuleConfig?.ruleTypes.includes(rule.ruleType)) {
      return;
    }
  }

  RQ.RuleExecutionHandler.notifyRuleAppliedToImplicitWidget(rule);
};
