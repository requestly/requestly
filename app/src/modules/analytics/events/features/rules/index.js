import { trackEvent } from "modules/analytics";
import { RULES } from "../constants";

const { IMPORT, CHARLES_SETTINGS, RESOURCE_OVERRIDE_SETTINGS, HEADER_EDITOR_SETTINGS } = RULES;

export const trackUploadRulesButtonClicked = (source) => {
  const params = { source };
  trackEvent(IMPORT.UPLOAD_RULES_BUTTON_CLICKED, params);
};

export const trackRulesImportStarted = () => {
  const params = {};
  trackEvent(IMPORT.STARTED, params);
};

export const trackRulesImportCompleted = (params) => {
  trackEvent(IMPORT.COMPLETED, params);
};

export const trackRulesImportFailed = (cause) => {
  const params = { cause };
  trackEvent(IMPORT.FAILED, params);
};

export const trackRulesJsonParsed = (params) => {
  trackEvent(IMPORT.JSON_PARSED, params);
};

export const trackCharlesSettingsImportViewed = (source) => {
  trackEvent(CHARLES_SETTINGS.VIEWED, { source });
};

export const trackCharlesSettingsImportStarted = (source) => {
  const params = { source };
  trackEvent(CHARLES_SETTINGS.IMPORT_STARTED, params);
};

export const trackCharlesSettingsImportFailed = (cause) => {
  const params = { cause };
  trackEvent(CHARLES_SETTINGS.IMPORT_FAILED, params);
};

export const trackCharlesSettingsParsed = (settings_count, setting_types, not_supported_rule_types_count) => {
  const params = { settings_count, setting_types, not_supported_rule_types_count };
  trackEvent(CHARLES_SETTINGS.PARSED, params);
};

export const trackCharlesSettingsImportComplete = (settings_count, setting_types) => {
  const params = { settings_count, setting_types };
  trackEvent(CHARLES_SETTINGS.IMPORT_COMPLETE, params);
};

export const trackCharlesSettingsImportDocsClicked = (source, trigger) => {
  const params = { source, import_trigger: trigger };
  trackEvent(CHARLES_SETTINGS.DOCS_CLICKED, params);
};

export const trackResourceOverrideSettingsImportViewed = (source) => {
  trackEvent(RESOURCE_OVERRIDE_SETTINGS.VIEWED, { source });
};

export const trackResourceOverrideSettingsImportStarted = (source) => {
  const params = { source };
  trackEvent(RESOURCE_OVERRIDE_SETTINGS.IMPORT_STARTED, params);
};

export const trackResourceOverrideSettingsImportFailed = (cause) => {
  const params = { cause };
  trackEvent(RESOURCE_OVERRIDE_SETTINGS.IMPORT_FAILED, params);
};

export const trackResourceOverrideSettingsParsed = (settings_count, setting_types, not_supported_rule_types_count) => {
  const params = { settings_count, setting_types, not_supported_rule_types_count };
  trackEvent(RESOURCE_OVERRIDE_SETTINGS.PARSED, params);
};

export const trackResourceOverrideSettingsImportComplete = (settings_count, setting_types) => {
  const params = { settings_count, setting_types };
  trackEvent(RESOURCE_OVERRIDE_SETTINGS.IMPORT_COMPLETE, params);
};

export const trackResourceOverrideSettingsImportDocsClicked = (source, trigger) => {
  const params = { source, import_trigger: trigger };
  trackEvent(RESOURCE_OVERRIDE_SETTINGS.DOCS_CLICKED, params);
};

export const trackHeaderEditorSettingsImportViewed = (source) => {
  trackEvent(HEADER_EDITOR_SETTINGS.VIEWED, { source });
};

export const trackHeaderEditorSettingsImportStarted = (source) => {
  const params = { source };
  trackEvent(HEADER_EDITOR_SETTINGS.IMPORT_STARTED, params);
};

export const trackHeaderEditorSettingsImportFailed = (cause) => {
  const params = { cause };
  trackEvent(HEADER_EDITOR_SETTINGS.IMPORT_FAILED, params);
};

export const trackHeaderEditorSettingsParsed = (settings_count, setting_types, not_supported_rule_types_count) => {
  const params = { settings_count, setting_types, not_supported_rule_types_count };
  trackEvent(HEADER_EDITOR_SETTINGS.PARSED, params);
};

export const trackHeaderEditorSettingsImportComplete = (settings_count, setting_types) => {
  const params = { settings_count, setting_types };
  trackEvent(HEADER_EDITOR_SETTINGS.IMPORT_COMPLETE, params);
};

export const trackHeaderEditorSettingsImportDocsClicked = (source, trigger) => {
  const params = { source, import_trigger: trigger };
  trackEvent(HEADER_EDITOR_SETTINGS.DOCS_CLICKED, params);
};
