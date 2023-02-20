import { trackEvent } from "modules/analytics";
import { TEMPLATES } from "../constants";

export const trackTemplateImportStarted = (name) => {
  const params = { name };
  trackEvent(TEMPLATES.IMPORT_STARTED, params);
};

export const trackTemplateImportCompleted = (name) => {
  const params = { name };
  trackEvent(TEMPLATES.IMPORT_COMPLETED, params);
};
