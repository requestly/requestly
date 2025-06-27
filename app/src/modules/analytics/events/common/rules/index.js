import { trackEvent } from "modules/analytics";
import { RULES } from "../constants";

export const trackRuleCreatedEvent = ({
  rule_type,
  description,
  destination_types,
  source,
  body_types,
  num_characters,
  header_types,
  header_actions,
  save_type,
  resource_type,
}) => {
  const params = {
    rule_type,
    save_type,
  };
  if (description) params.description = description;
  if (destination_types) params.destination_types = destination_types;
  if (source) params.source = source;
  if (body_types) params.body_types = body_types;
  if (num_characters !== undefined) params.num_characters = num_characters;
  if (header_types) params.header_types = header_types;
  if (header_actions) params.header_actions = header_actions;
  if (resource_type) params.resource_type = resource_type;

  trackEvent(RULES.RULE_CREATED, params);
};

export const trackRuleEditedEvent = ({
  rule_type,
  description,
  destination_types,
  source,
  num_characters,
  header_types,
  header_actions,
  save_type,
  resource_type,
}) => {
  const params = {
    rule_type,
    save_type,
  };
  if (description) params.description = description;
  if (destination_types) params.destination_types = destination_types;
  if (source) params.source = source;
  if (num_characters != null) params.num_characters = num_characters;
  if (header_types) params.header_types = header_types;
  if (header_actions) params.header_actions = header_actions;
  if (resource_type) params.resource_type = resource_type;

  trackEvent(RULES.RULE_EDITED, params);
};

export const trackRuleDeletedEvent = (count, rule_type) => {
  const params = {
    count,
    rule_type,
  };
  trackEvent(RULES.RULE_DELETED, params);
};

export const trackRulesDeletedEvent = (count, source, type) => {
  const params = {
    count,
    source,
    type,
  };
  trackEvent(RULES.RULES_DELETED, params);
};

export const trackRuleToggled = (rule_type, source, updated_status) => {
  const params = {
    source,
    rule_type,
    updated_status,
  };

  trackEvent(RULES.RULE_TOGGLED, params);
};

export const trackRuleToggleAttempted = (current_status) => {
  trackEvent(RULES.RULE_TOGGLE_ATTEMPTED, { current_status });
};

export const trackRuleDuplicatedEvent = (rule_type, workspace, source) => {
  const params = {
    rule_type,
    workspace,
    source,
  };
  trackEvent(RULES.RULE_DUPLICATED, params);
};

export const trackGroupDuplicatedEvent = (num_rules, workspace, source) => {
  const params = {
    num_rules,
    workspace,
    source,
  };
  trackEvent(RULES.GROUP_DUPLICATED, params);
};

export const trackRulePinToggled = (rule_id, rule_type, updated_value) => {
  const params = { rule_id, rule_type, updated_value };
  trackEvent(RULES.RULE_PIN_TOGGLED, params);
};

export const trackRuleExportedEvent = (count, rule_type) => {
  const params = {
    rule_type,
    count,
  };
  trackEvent(RULES.RULE_EXPORTED, params);
};

export const trackRulesExportedEvent = (count) => {
  const params = {
    count,
  };
  trackEvent(RULES.RULES_EXPORTED, params);
};

export const trackRulePairCreationAttempted = (rule_type) => {
  trackEvent(RULES.RULE_PAIR_CREATION_ATTEMPTED, { rule_type });
};

export const trackRulePairCreated = ({ current_pairs_count, rule_type }) => {
  const params = {
    current_pairs_count,
    rule_type,
  };
  trackEvent(RULES.RULE_PAIR_CREATED, params);
};

export const trackRulesTrashedEvent = (count, rule_type) => {
  const params = {
    rule_type,
    count,
  };
  trackEvent(RULES.RULES_TRASHED, params);
};

export const trackRulesUngrouped = () => {
  const params = {};
  trackEvent(RULES.RULES_UNGROUPED, params);
};

export const trackRuleExecuted = (type, count, month, year) => {
  const params = { type, count, month, year };
  trackEvent(RULES.RULE_EXECUTED, params);
};

export const trackRuleCreationWorkflowStartedEvent = (ruleType, source) => {
  const params = { ruleType, source };
  trackEvent(RULES.RULE_CREATION_WORKFLOW_STARTED, params);
};

export const trackRuleTutorialModalShownEvent = (rule_type, source) => {
  const params = { rule_type, source };
  trackEvent(RULES.RULE_TUTORIAL_MODAL_SHOWN, params);
};

export const trackRuleFeatureUsageEvent = (counts) => {
  const params = { ...counts };
  trackEvent(RULES.RULE_FEATURE_USAGE, params);
};

export const trackErrorInRuleCreation = (description, rule_type) => {
  const params = { description, rule_type };
  trackEvent(RULES.ERROR_IN_RULE_CREATION, params);
};

export const trackErrorInSavingDNR = ({
  rule_type,
  rule_id,
  error,
  is_migration_triggered,
  source_key,
  source_operator,
  source_value,
  page_path,
}) => {
  const params = {
    rule_type,
    rule_id,
    error,
    is_migration_triggered,
    source_key,
    source_operator,
    source_value,
    page_path,
  };
  trackEvent(RULES.ERROR_IN_SAVING_DNR, params);
};

export const trackRuleEditorClosed = (reason, rule_type, mode) => {
  const params = { reason, rule_type, mode };
  trackEvent(RULES.RULE_EDITOR_CLOSED, params);
};

export const trackRuleEditorHeaderClicked = (action, rule_type, mode, source) => {
  const params = { action, rule_type, mode, source };
  trackEvent(RULES.RULE_EDITOR_HEADER_CLICKED, params);
};

export const trackNewRuleButtonClicked = (source) => {
  const params = { source };
  trackEvent(RULES.NEW_RULE_BUTTON_CLICKED, params);
};

export const trackRuleTypeSwitched = (ruleType, source) => {
  const params = { ruleType, source };
  trackEvent(RULES.RULE_TYPE_SWITCHED, params);
};

export const trackRuleDemoVideoClicked = (ruleType) => {
  const params = { ruleType };
  trackEvent(RULES.RULE_DEMO_VIDEO_CLICKED, params);
};

export const trackGettingStartedVideoPlayed = () => {
  const params = {};
  trackEvent(RULES.GETTING_STARTED_VIDEO_PLAYED, params);
};

export const trackRuleSimulatorTried = (rule_type, rule_saved) => {
  const params = { rule_type, rule_saved };
  trackEvent(RULES.RULE_SIMULATOR_TRIED, params);
};

export const trackDesktopRuleViewedOnExtension = (rule_type) => {
  const params = { rule_type };
  trackEvent(RULES.DESKTOP_RULE_VIEWED_ON_EXTENSION, params);
};

// rule details panel
export const trackRuleDetailsPanelClosed = (rule_type, source) => {
  const params = { rule_type, source };
  trackEvent(RULES.RULE_DETAILS_PANEL_CLOSED, params);
};

export const trackRuleDetailsPanelDocsClicked = (rule_type, source) => {
  const params = { rule_type, source };
  trackEvent(RULES.RULE_DETAILS_PANEL_DOCS_CLICKED, params);
};

export const trackRuleDetailsPanelUseCaseClicked = (rule_type, source, use_case_name, action) => {
  const params = { rule_type, source, use_case_name, action };
  trackEvent(RULES.RULE_DETAILS_USE_CASE_CLICKED, params);
};

// rule editor docs
export const trackDocsSidebarViewed = (rule_type) => {
  const params = { rule_type };
  trackEvent(RULES.DOCS_SIDEBAR_VIEWED, params);
};

export const trackDocsSidebarClosed = (rule_type) => {
  const params = { rule_type };
  trackEvent(RULES.DOCS_SIDEBAR_CLOSED, params);
};

export const trackDocsSidebarPrimaryCategoryClicked = (rule_type, category) => {
  const params = { rule_type, category };
  trackEvent(RULES.DOCS_SIDEBAR_PRIMARY_CATEGORY_CLICKED, params);
};

export const trackDocsSidebarSecondaryCategoryClicked = (rule_type, category) => {
  const params = { rule_type, category };
  trackEvent(RULES.DOCS_SIDEBAR_SECONDARY_CATEGORY_CLICKED, params);
};

export const trackDocsSidebarDemovideoWatched = (rule_type) => {
  const params = { rule_type };
  trackEvent(RULES.DOCS_SIDEBAR_DEMOVIDEO_WATCHED, params);
};

export const trackDocsSidebarContactUsClicked = (rule_type) => {
  const params = { rule_type };
  trackEvent(RULES.DOCS_SIDEBAR_CONTACT_US_CLICKED, params);
};

export const trackRuleSaveClicked = (mode) => {
  trackEvent(RULES.RULE_SAVE_CLICKED, { mode });
};

export const trackRulesEmptyStateClicked = (action) => {
  const params = { action };
  trackEvent(RULES.RULES_EMPTY_STATE_CLICKED, params);
};

export const trackSampleRegexClicked = () => {
  trackEvent(RULES.SAMPLE_REGEX_CLICKED);
};
