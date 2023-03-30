import { MORE_INFO } from "./constants";
import { trackEvent } from "modules/analytics";

export const trackMoreInfoViewed = (context: string, source: string) => {
  const params = { context, source };
  trackEvent(MORE_INFO.MORE_INFO_VIEWED, params);
};

export const trackMoreInfoClicked = (context: string, source: string) => {
  const params = { context, source };
  trackEvent(MORE_INFO.MORE_INFO_CLICKED, params);
};
