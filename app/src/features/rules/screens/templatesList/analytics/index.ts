import { trackEvent } from "modules/analytics";
import { TEMPLATES } from "./constants";

export const trackTemplateImportStarted = (name: string, source: string) => {
  trackEvent(TEMPLATES.TEMPLATE_IMPORT_STARTED, {
    name,
    source,
  });
};

export const trackTemplateImportCompleted = (name: string, source: string) => {
  trackEvent(TEMPLATES.TEMPLATE_IMPORT_COMPLETED, {
    name,
    source,
  });
};
