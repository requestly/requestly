import { Rule } from "common/types";
import extensionIconManager from "./extensionIconManager";
import { DataScope, TAB_SERVICE_DATA, tabService } from "./tabService";
import rulesStorageService from "../../rulesStorageService";
import { CLIENT_MESSAGES } from "common/constants";
import { Variable, onVariableChange } from "../variable";
import { isExtensionEnabled } from "./utils";

interface RulesExecutionLog {
  ruleId: string;
  requestDetails: chrome.webRequest.WebRequestDetails | chrome.webRequest.WebResponseDetails;
}

class RuleExecutionHandler {
  private isExtensionEnabled = true;

  constructor() {
    isExtensionEnabled().then((status) => (this.isExtensionEnabled = status));
    onVariableChange<boolean>(Variable.IS_EXTENSION_ENABLED, (currentStatus) => {
      this.isExtensionEnabled = currentStatus;
    });
  }

  getExecutedRules = async (tabId: number) => {
    const rulesExecutionLogs: RulesExecutionLog[] =
      tabService.getPageData(tabId, TAB_SERVICE_DATA.RULES_EXECUTION_LOGS, []) || [];

    const appliedRuleIds = rulesExecutionLogs.map((executionLog) => executionLog.ruleId).filter((id) => !!id);
    const uniqueAppliedRuleIds = Array.from(new Set(appliedRuleIds));
    const appliedRules = await rulesStorageService.getRules(uniqueAppliedRuleIds);

    return appliedRules;
  };

  processTabCachedRulesExecutions = (tabId: number) => {
    const rulesExecutionLogs: RulesExecutionLog[] =
      tabService.getData(tabId, TAB_SERVICE_DATA.RULES_EXECUTION_LOGS, []) || [];

    rulesExecutionLogs.forEach((executionLog) => {
      this.onRuleExecuted({ id: executionLog.ruleId } as Rule, executionLog.requestDetails);
    });

    tabService.removeData(tabId, TAB_SERVICE_DATA.RULES_EXECUTION_LOGS);
  };

  onRuleExecuted = (
    rule: Rule,
    requestDetails: chrome.webRequest.WebRequestDetails | chrome.webRequest.WebResponseDetails,
    isMainFrameRequest?: boolean
  ) => {
    if (!this.isExtensionEnabled) {
      return;
    }

    const tabDataScope = isMainFrameRequest ? DataScope.TAB : DataScope.PAGE;

    extensionIconManager.markRuleExecuted(requestDetails.tabId);

    chrome.tabs.sendMessage(requestDetails.tabId, {
      action: CLIENT_MESSAGES.NOTIFY_RULE_EXECUTED,
      rule,
    });

    const rulesExecutionLogs: RulesExecutionLog[] =
      tabService.getDataForScope(tabDataScope, requestDetails.tabId, TAB_SERVICE_DATA.RULES_EXECUTION_LOGS, []) || [];
    rulesExecutionLogs.push({ ruleId: rule.id, requestDetails });
    tabService.setDataForScope(
      tabDataScope,
      requestDetails.tabId,
      TAB_SERVICE_DATA.RULES_EXECUTION_LOGS,
      rulesExecutionLogs
    );
  };
}

const ruleExecutionHandler = new RuleExecutionHandler();
export default ruleExecutionHandler;
