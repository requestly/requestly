import { trackEvent } from "modules/analytics";
import { RULE_EDITOR } from "../constants";

export const trackServeResponseWithoutRequestEnabled = () => {
  trackEvent(RULE_EDITOR.MODIFY_API_RESPONSE.SERVE_WITHOUT_REQUEST_ENABLED);
};

export const trackTestRuleClicked = (rule_type, record_test_page) => {
  const params = { rule_type, record_test_page };
  trackEvent(RULE_EDITOR.TEST_THIS_RULE.TEST_RULE_CLICKED, params);
};

export const trackTestRuleReportGenerated = (rule_type, success) => {
  const params = { rule_type, success };
  trackEvent(RULE_EDITOR.TEST_THIS_RULE.TEST_RULE_REPORT_GENERATED, params);
};

export const trackTroubleshootClicked = (source) => {
  trackEvent(RULE_EDITOR.TROUBLESHOOT_CLICKED, {
    source,
  });
};
