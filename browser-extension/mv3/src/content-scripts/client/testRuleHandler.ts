import config from "common/config";
import { CLIENT_MESSAGES, EXTENSION_MESSAGES, STORAGE_KEYS } from "common/constants";
import rulesStorageService from "../../rulesStorageService";
import { getRecord } from "common/storage";
import { Rule, RuleType } from "common/types";
import RuleExecutionHandler from "./ruleExecutionHandler";
import { cloneDetails } from "../utils";

let implicitTestRuleFlowEnabled = false;
let explicitTestRuleFlowEnabled = false;
let implictTestRuleWidgetConfig: Record<string, any> = null;

export const initTestRuleHandler = () => {
  fetchAndStoreImplicitTestRuleWidgetConfig();

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.START_EXPLICIT_RULE_TESTING:
        if (message.record) {
          chrome.runtime.sendMessage({
            action: EXTENSION_MESSAGES.START_RECORDING_EXPLICITLY,
            showWidget: false,
          });
        }
        explicitTestRuleFlowEnabled = true;
        showExplicitTestRuleWidget(message.ruleId);
        break;

      case CLIENT_MESSAGES.START_IMPLICIT_RULE_TESTING:
        if (implictTestRuleWidgetConfig?.enabled) {
          implicitTestRuleFlowEnabled = true;
          showImplicitTestRuleWidget();
        }
        break;
    }
    return false;
  });
};

const showExplicitTestRuleWidget = async (ruleId: string) => {
  const widget = document.querySelector("rq-explicit-test-rule-widget");

  if (widget) {
    return;
  }

  const ruleDetails = await rulesStorageService.getRule(ruleId);
  const { name: ruleName } = ruleDetails;

  const testRuleWidget = document.createElement("rq-explicit-test-rule-widget");
  testRuleWidget.classList.add("rq-element");
  testRuleWidget.setAttribute("rule-id", ruleId);
  testRuleWidget.setAttribute("rule-name", ruleName);
  setWidgetInfoText(testRuleWidget, ruleDetails);
  testRuleWidget.setAttribute("applied-status", "false");

  document.documentElement.appendChild(testRuleWidget);

  testRuleWidget.addEventListener("view-results", () => {
    chrome.runtime.sendMessage({
      action: EXTENSION_MESSAGES.SAVE_TEST_RULE_RESULT,
      ruleId,
      appliedStatus: testRuleWidget?.getAttribute("applied-status") === "true",
    });
  });

  const appliedRules = await RuleExecutionHandler.getExecutedRules();

  if (appliedRules) {
    appliedRules?.forEach((rule: Rule) => {
      notifyRuleAppliedToExplicitWidget(rule.id);
    });
  }
};

const setWidgetInfoText = (testRuleWidget: HTMLElement, ruleDetails: Rule) => {
  const { ruleType } = ruleDetails;
  const INFO_TEXT_ATTRIBUTE = "rq-test-rule-text";

  switch (ruleType) {
    case RuleType.RESPONSE:
      testRuleWidget.setAttribute(
        INFO_TEXT_ATTRIBUTE,
        `The responses are modified, but won't show in DevTools due to technical constraints. See <a class="link" target="_blank" href="https://docs.requestly.com/general/http-rules/advanced-usage/test-rules">docs</a> for details.`
      );
      break;
    case RuleType.HEADERS:
      const responseHeaderExists = ruleDetails.pairs.some((pair) => {
        return pair?.modifications?.Response?.length > 0;
      });
      responseHeaderExists &&
        testRuleWidget.setAttribute(
          INFO_TEXT_ATTRIBUTE,
          `Response Header Modifications will not show up in the browser network devtools due to technical constraints. Checkout docs for more <a target="_blank" href="https://docs.requestly.com/general/http-rules/rule-types/modify-headers">details</a>.`
        );
      break;
    default:
      return;
  }
};

const notifyRuleAppliedToExplicitWidget = (ruleId: string) => {
  const explicitTestRuleWidget = document.querySelector("rq-explicit-test-rule-widget");

  if (!explicitTestRuleWidget) {
    return;
  }

  if (explicitTestRuleWidget?.getAttribute("applied-status") === "false") {
    if (explicitTestRuleWidget.getAttribute("rule-id") === ruleId) {
      explicitTestRuleWidget.setAttribute("applied-status", "true");
    }

    explicitTestRuleWidget.dispatchEvent(
      new CustomEvent(
        "new-rule-applied",
        cloneDetails({
          detail: {
            appliedRuleId: ruleId,
          },
        })
      )
    );
  }
};

export const showImplicitTestRuleWidget = async () => {
  if (document.querySelector("rq-implicit-test-rule-widget")) {
    return;
  }

  const testRuleWidget = document.createElement("rq-implicit-test-rule-widget");

  testRuleWidget.classList.add("rq-element");
  testRuleWidget.style.display = "none";

  testRuleWidget.addEventListener("view_rule_in_editor", (data: any) => {
    window.open(`${config.WEB_URL}/rules/editor/edit/${data.detail.ruleId}`, "_blank");
  });

  testRuleWidget.addEventListener("open_app_settings", () => {
    window.open(`${config.WEB_URL}/settings/global-settings`, "_blank");
  });

  // testRuleWidget.addEventListener("rule_applied_listener_active", () => {
  //   appliedRuleIds.forEach((ruleId) => {
  //     handleAppliedRuleNotification(ruleId);
  //   });
  // });

  document.documentElement.appendChild(testRuleWidget);

  const appliedRules = await RuleExecutionHandler.getExecutedRules();

  if (appliedRules) {
    appliedRules?.forEach((rule: Rule) => {
      notifyRuleAppliedToImplicitWidget(rule);
    });
  }
};

const notifyRuleAppliedToImplicitWidget = async (rule: Rule) => {
  let ruleName = rule.name;
  let ruleType = rule.ruleType;

  if (!ruleName || !ruleType) {
    const ruleDetails = await rulesStorageService.getRule(rule.id);
    ruleName = ruleDetails.name;
    ruleType = ruleDetails.ruleType;
  }

  if (!shouldShowImplicitWidget(ruleType)) {
    return;
  }

  const implicitTestRuleWidget = document.querySelector("rq-implicit-test-rule-widget") as HTMLElement;

  if (implicitTestRuleWidget) {
    setWidgetInfoText(implicitTestRuleWidget, rule);

    implicitTestRuleWidget.dispatchEvent(
      new CustomEvent(
        "new-rule-applied",
        cloneDetails({
          detail: {
            appliedRuleId: rule.id,
            appliedRuleName: ruleName,
            appliedRuleType: ruleType,
          },
        })
      )
    );
    implicitTestRuleWidget.style.display = "block";
  }
};

const fetchAndStoreImplicitTestRuleWidgetConfig = async () => {
  getRecord(STORAGE_KEYS.IMPLICIT_RULE_TESTING_WIDGET_CONFIG).then((result: any) => {
    if (result) {
      implictTestRuleWidgetConfig = result;
    }
  });
};

export const handleAppliedRuleNotification = async (rule: Rule) => {
  if (implicitTestRuleFlowEnabled) {
    notifyRuleAppliedToImplicitWidget(rule);
  } else if (explicitTestRuleFlowEnabled) {
    notifyRuleAppliedToExplicitWidget(rule.id);
  }
};

const shouldShowImplicitWidget = (ruleType: string) => {
  const implicitConfig = implictTestRuleWidgetConfig;

  if (!implicitConfig || !implicitConfig.enabled) {
    return false;
  }

  if (implicitConfig.visibility === ImplicitWidgetVisibility.SPECIFIC) {
    if (!implicitConfig.ruleTypes.includes(ruleType)) {
      return false;
    }
  }

  return true;
};

enum ImplicitWidgetVisibility {
  ALL = "all",
  SPECIFIC = "specific",
}
