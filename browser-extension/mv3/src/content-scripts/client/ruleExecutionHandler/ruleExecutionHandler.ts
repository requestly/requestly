import { Rule } from "common/types";
import { CLIENT_MESSAGES } from "common/constants";
import { handleAppliedRuleNotification } from "../testRuleHandler";

class RuleExecutionHandler {
  constructor() {
    this.initListeners();
  }

  private initListeners = () => {
    chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
      switch (message.action) {
        case CLIENT_MESSAGES.NOTIFY_RULE_EXECUTED:
          this.onRuleExecuted(message.rule, message.requestDetails);
          break;
      }
    });
  };

  onRuleExecuted = (
    rule: Rule,
    requestDetails: chrome.webRequest.WebRequestDetails | chrome.webRequest.WebResponseDetails
  ) => {
    handleAppliedRuleNotification(rule);
  };
}

const ruleExecutionHandler = new RuleExecutionHandler();
export default ruleExecutionHandler;
