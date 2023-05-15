import { trackEvent } from "modules/analytics";
import { RULES } from "../constants";

const { IMPORT, CHARLES_SETTINGS } = RULES;

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

export const trackCharlesSettingsImportStarted = (source) => {
  const params = { source };
  trackEvent(CHARLES_SETTINGS.IMPORT_STARTED, params);
};
export const trackCharlesSettingsImportFailed = (cause) => {
  const params = { cause };
  trackEvent(CHARLES_SETTINGS.IMPORT_FAILED, params);
};

export const trackCharlesSettingsParsed = (settingsCount, settingTypes) => {
  const params = { settingsCount, settingTypes };
  trackEvent(CHARLES_SETTINGS.PARSED, params);
};

export const trackCharlesSettingsImportComplete = (settingsCount, settingTypes) => {
  const params = { settingsCount, settingTypes };
  trackEvent(CHARLES_SETTINGS.IMPORT_COMPLETE, params);
};

export const trackCharlesSettingsImportDocsClicked = (source) => {
  const params = { source };
  trackEvent(CHARLES_SETTINGS.DOCS_CLICKED, params);
};
