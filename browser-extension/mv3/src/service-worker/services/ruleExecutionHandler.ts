import { Rule } from "common/types";
import extensionIconManager from "./extensionIconManager";
import { DataScope, TAB_SERVICE_DATA, tabService } from "./tabService";
import rulesStorageService from "../../rulesStorageService";
import { CLIENT_MESSAGES } from "common/constants";
import { sendLogToDevtools } from "./devtools";

interface RulesExecutionLog {
  ruleId: string;
  requestDetails: chrome.webRequest.WebRequestDetails;
}

class RuleExecutionHandler {
  constructor() {}

  getExecutedRules = async (tabId: number) => {
    const rulesExecutionLogs: RulesExecutionLog[] = tabService.getPageData(
      tabId,
      TAB_SERVICE_DATA.RULES_EXECUTION_LOGS,
      []
    );

    const mainFrameRulesExecutionLogs: RulesExecutionLog[] = tabService.getData(
      tabId,
      TAB_SERVICE_DATA.RULES_EXECUTION_LOGS,
      []
    );

    const appliedRuleIds = [...rulesExecutionLogs, ...mainFrameRulesExecutionLogs]
      .map((executionLog) => executionLog.ruleId)
      .filter((id) => !!id);
    const uniqueAppliedRuleIds = Array.from(new Set(appliedRuleIds));
    const appliedRules = await rulesStorageService.getRules(uniqueAppliedRuleIds);

    return appliedRules;
  };

  processTabCachedRulesExecutions = async (tabId: number) => {
    const rulesExecutionLogs: RulesExecutionLog[] =
      tabService.getData(tabId, TAB_SERVICE_DATA.RULES_EXECUTION_LOGS, []) || [];

    const uniqueAppliedRuleIds = Array.from(new Set(rulesExecutionLogs.map((executionLog) => executionLog.ruleId)));

    const appliedRules = (await rulesStorageService.getRules(uniqueAppliedRuleIds)).reduce((acc, rule) => {
      acc[rule.id] = rule;
      return acc;
    }, {} as Record<string, Rule>);

    rulesExecutionLogs.forEach((executionLog) => {
      this.onRuleExecuted(appliedRules[executionLog.ruleId] as Rule, executionLog.requestDetails);
    });

    tabService.removeData(tabId, TAB_SERVICE_DATA.RULES_EXECUTION_LOGS);
  };

  onRuleExecuted = (
    rule: Rule,
    requestDetails: chrome.webRequest.WebRequestDetails,
    isMainOrPrerenderedFrame?: boolean
  ) => {
    const tabDataScope = isMainOrPrerenderedFrame ? DataScope.TAB : DataScope.PAGE;

    extensionIconManager.markRuleExecuted(requestDetails.tabId);

    chrome.tabs.sendMessage(requestDetails.tabId, {
      action: CLIENT_MESSAGES.NOTIFY_RULE_EXECUTED,
      rule,
    });

    sendLogToDevtools(rule, requestDetails);

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
