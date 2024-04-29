import { CLIENT_MESSAGES, EXTENSION_MESSAGES } from "common/constants";
import { getRule } from "common/rulesStore";
import { Rule } from "common/types";

const appliedRuleIds = new Set<string>();

export const initRuleExecutionHandler = () => {
  window.addEventListener("message", function (event) {
    if (event.source !== window || event.data.source !== "requestly:client") {
      return;
    }

    switch (event.data.action) {
      case "response_rule_applied":
      case "request_rule_applied":
        appliedRuleIds.add(event.data.ruleId);
        notifyRuleAppliedToExplicitWidget(event.data.ruleId);
        break;
    }
  });

  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.action) {
      case CLIENT_MESSAGES.UPDATE_APPLIED_SCRIPT_RULES:
        message.ruleIds.forEach((ruleId: string) => {
          appliedRuleIds.add(ruleId);
          notifyRuleAppliedToExplicitWidget(ruleId);
        });
        break;
      case CLIENT_MESSAGES.START_EXPLICIT_RULE_TESTING:
        if (message.record) {
          chrome.runtime.sendMessage({
            action: EXTENSION_MESSAGES.START_RECORDING_EXPLICITLY,
            showWidget: false,
          });
        }
        showExplicitTestRuleWidget(message.ruleId);
        break;
      case CLIENT_MESSAGES.GET_APPLIED_RULES:
        sendResponse(Array.from(appliedRuleIds));
        break;
    }
    return false;
  });
};

const showExplicitTestRuleWidget = async (ruleId: string) => {
  if (document.querySelector("rq-explicit-test-rule-widget")) {
    return;
  }

  const ruleDetails = await getRule(ruleId);
  const { name: ruleName } = ruleDetails;

  const testRuleWidget = document.createElement("rq-explicit-test-rule-widget");
  testRuleWidget.classList.add("rq-element");
  testRuleWidget.setAttribute("rule-id", ruleId);
  testRuleWidget.setAttribute("rule-name", ruleName);
  testRuleWidget.setAttribute("applied-status", appliedRuleIds.has(ruleId).toString());
  setWidgetInfoText(testRuleWidget, ruleDetails);

  document.documentElement.appendChild(testRuleWidget);

  testRuleWidget.addEventListener("view-results", () => {
    chrome.runtime.sendMessage({
      action: EXTENSION_MESSAGES.SAVE_TEST_RULE_RESULT,
      ruleId,
      appliedStatus: testRuleWidget?.getAttribute("applied-status") === "true",
    });
  });
};

const setWidgetInfoText = (testRuleWidget: HTMLElement, ruleDetails: Rule) => {
  const { ruleType } = ruleDetails;

  switch (ruleType) {
    case "Response":
      testRuleWidget.setAttribute(
        "rq-test-rule-text",
        `Response Modifications will not show up in the browser network devtools due to technical contraints. Checkout docs for more <a target="_blank" href="https://developers.requestly.io/http-rules/modify-response-body/">details</a>.`
      );
      break;
    case "Headers":
      const responseHeaderExists = ruleDetails.pairs.some((pair) => {
        return pair?.modifications?.Response?.length > 0;
      });
      responseHeaderExists &&
        testRuleWidget.setAttribute(
          "rq-test-rule-text",
          `Response Header Modifications will not show up in the browser network devtools due to technical constraints. Checkout docs for more <a target="_blank" href="https://developers.requestly.io/http-rules/modify-headers/">details</a>.`
        );
      break;
    default:
      return;
  }
};

const notifyRuleAppliedToExplicitWidget = (ruleId: string) => {
  const explicitTestRuleWidget = document.querySelector("rq-explicit-test-rule-widget");

  if (explicitTestRuleWidget?.getAttribute("applied-status") === "false") {
    if (explicitTestRuleWidget.getAttribute("rule-id") === ruleId) {
      explicitTestRuleWidget.setAttribute("applied-status", "true");
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
