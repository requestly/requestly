import { MORE_INFO } from "./constants";
import { trackEvent } from "modules/analytics";

export const trackMoreInfoViewed = (rule_type: string, source: string) => {
  const params = { rule_type, source };
  trackEvent(MORE_INFO.MORE_INFO_VIEWED, params);
};

export const trackMoreInfoClicked = (rule_type: string, source: string) => {
  const params = { rule_type, source };
  trackEvent(MORE_INFO.MORE_INFO_VIEWED, params);
};
