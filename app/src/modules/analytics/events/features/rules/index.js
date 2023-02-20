import { trackEvent } from "modules/analytics";
import { RULES } from "../constants";

export const trackUploadRulesButtonClicked = (source) => {
  const params = { source };
  trackEvent(RULES.IMPORT.UPLOAD_RULES_BUTTON_CLICKED, params);
};

export const trackRulesImportStarted = () => {
  const params = {};
  trackEvent(RULES.IMPORT.STARTED, params);
};

export const trackRulesImportCompleted = (params) => {
  trackEvent(RULES.IMPORT.COMPLETED, params);
};

export const trackRulesImportFailed = (cause) => {
  const params = { cause };
  trackEvent(RULES.IMPORT.FAILED, params);
};

export const trackRulesJsonParsed = (params) => {
  trackEvent(RULES.IMPORT.JSON_PARSED, params);
};
