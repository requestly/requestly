import { trackEvent } from "modules/analytics";
import { RULE_EDITOR } from "../constants";

export const trackServeResponseWithoutRequestEnabled = () => {
  trackEvent(RULE_EDITOR.MODIFY_API_RESPONSE.SERVE_WITHOUT_REQUEST_ENABLED);
};

export const trackTestRuleClicked = (ruleType) => {
  const params = { ruleType };
  trackEvent(RULE_EDITOR.TEST_THIS_RULE.TEST_RULE_CLICKED, params);
};

export const trackTestRuleReportGenerated = (ruleType) => {
  const params = { ruleType };
  trackEvent(RULE_EDITOR.TEST_THIS_RULE.TEST_RULE_REPORT_GENERATED, params);
};

export const trackTroubleshootClicked = (source) => {
  trackEvent(RULE_EDITOR.TROUBLESHOOT_CLICKED, {
    source,
  });
};
