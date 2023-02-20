import { trackEvent } from "modules/analytics";
import { PAGE_VIEW } from "./constants";

export const trackPageViewEvent = (path, params = {}) => {
  trackEvent(PAGE_VIEW, { ...params, path });
};
