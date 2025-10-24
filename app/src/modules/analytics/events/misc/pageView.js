import { trackEvent } from "modules/analytics";
import { PAGE_VIEW } from "./constants";

export const trackPageViewEvent = (path, params = {}) => {
  // Ignore extension-updated page view events for now
  if (path === "/extension-updated") return;

  trackEvent(PAGE_VIEW, { ...params, path });
};
