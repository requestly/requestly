import { trackEvent } from "modules/analytics";
import { GROUPS, RULES, SAMPLE_RULES } from "./constants";

// groups
export const trackGroupStatusToggled = (enabled: boolean) => {
  const params = { enabled };
  trackEvent(GROUPS.GROUP_STATUS_TOGGLED, params);
};

export const trackGroupDeleted = () => {
  const params = {};
  trackEvent(GROUPS.GROUP_DELETED, params);
};

export const trackGroupCreatedEvent = (src: string) => {
  const params = { src };
  trackEvent(GROUPS.GROUP_CREATED, params);
};

export const trackGroupChangedEvent = (src: string) => {
  const params = { src };
  trackEvent(GROUPS.GROUP_CHANGED, params);
};

export const trackGroupRenamed = () => {
  const params = {};
  trackEvent(GROUPS.GROUP_RENAMED, params);
};

export const trackGroupPinToggled = (updated_value: boolean) => {
  const params = { updated_value };
  trackEvent(GROUPS.GROUP_PIN_TOGGLED, params);
};

export const trackNewGroupButtonClicked = (num_groups: number) => {
  const params = { num_groups };
  trackEvent(GROUPS.NEW_GROUP_BUTTON_CLICKED, params);
};

// rules
export const trackRulesListFilterApplied = (
  name: string,
  num_rules: number,
  num_rules_in_filtered_category: number
) => {
  const params = { name, num_rules, num_rules_in_filtered_category };
  trackEvent(RULES.RULES_LIST_FILTER_APPLIED, params);
};

export const trackRulesListSearched = (search_keyword: string) => {
  const params = { search_keyword };
  trackEvent(RULES.RULES_LIST_SEARCHED, params);
};

export const trackRulesListActionsClicked = (category: "rule" | "group") => {
  const params = { category };
  trackEvent(RULES.RULES_LIST_ACTIONS_CLICKED, params);
};

export const trackRulesListBulkActionPerformed = (action: string) => {
  const params = { action };
  trackEvent(RULES.RULES_LIST_BULK_ACTION_PERFORMED, params);
};

// @nsr fix: this also counts groups selected
export const trackRulesSelected = (num_rules: number) => {
  const params = { num_rules };
  trackEvent(RULES.RULES_SELECTED, params);
};

// sample rules
export const trackSampleRulesImported = () => {
  const params = {};
  trackEvent(SAMPLE_RULES.SAMPLE_RULES_IMPORTED, params);
};

export const trackSampleRuleEditorViewed = (rule_name: string) => {
  const params = { rule_name };
  trackEvent(SAMPLE_RULES.SAMPLE_RULE_EDITOR_VIEWED, params);
};

export const trackSampleRuleTested = (rule_name: string, rule_status: string) => {
  const params = { rule_name, rule_status };
  trackEvent(SAMPLE_RULES.SAMPLE_RULE_TESTED, params);
};

export const trackSampleRuleToggled = (rule_name: string, status: string, source: string) => {
  const params = { rule_name, status, source };
  trackEvent(SAMPLE_RULES.SAMPLE_RULES_TOGGLED, params);
};

export const trackSampleRuleCreateRuleClicked = (rule_name: string, rule_type: string) => {
  const params = { rule_name, rule_type };
  trackEvent(SAMPLE_RULES.SAMPLE_RULE_CREATE_RULE_CLICKED, params);
};

export const trackSampleRuleDeleted = () => {
  const params = {};
  trackEvent(SAMPLE_RULES.SAMPLE_RULE_DELETED, params);
};
