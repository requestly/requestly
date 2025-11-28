import { trackEvent } from "modules/analytics";
import { TEST_THIS_RULE } from "./constants";

export const trackTestRuleClicked = (rule_type: string, record_test_page: string) => {
  const params = { rule_type, record_test_page };
  trackEvent(TEST_THIS_RULE.TEST_RULE_CLICKED, params);
};

export const trackTestRuleReportGenerated = (rule_type: string, success: boolean) => {
  const params = { rule_type, success };
  trackEvent(TEST_THIS_RULE.TEST_RULE_REPORT_GENERATED, params);
};

export const trackTestRuleResultClicked = (rule_type: string, session_link: string | null) => {
  const params = { rule_type, session_link };
  trackEvent(TEST_THIS_RULE.TEST_RULE_RESULT_CLICKED, params);
};

export const trackTestRuleSessionDraftSaved = (mode: string) => {
  trackEvent(TEST_THIS_RULE.TEST_RULE_SESSION_DRAFT_SAVED, { mode });
};

export const trackTestRuleReportDeleted = (rule_type: string) => {
  trackEvent(TEST_THIS_RULE.TEST_RULE_REPORT_DELETED, { rule_type });
};
