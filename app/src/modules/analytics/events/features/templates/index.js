import { trackEvent } from "modules/analytics";
import { TEMPLATES } from "../constants";

export const trackTemplateImportStarted = (name, source) => {
  const params = { name, source };
  trackEvent(TEMPLATES.IMPORT_STARTED, params);
};

export const trackTemplateImportCompleted = (name, source) => {
  const params = { name, source };
  trackEvent(TEMPLATES.IMPORT_COMPLETED, params);
};

export const trackViewAllTemplatesClick = (source, rule_type) => {
  const params = { source, rule_type };
  trackEvent(TEMPLATES.VIEW_ALL_TEMPLATES_CLICK, params);
};
