import { trackEvent } from "modules/analytics";
import { AUTH } from "../../constants";

export const trackPopoverForAuthShown = (source) => {
  const params = {
    source,
  };
  trackEvent(AUTH.POPOVER.SHOWN, params);
};

export const trackPopoverForAuthContinued = (source) => {
  const params = {
    source,
  };
  trackEvent(AUTH.POPOVER.CONTINUED, params);
};

export const trackPopoverForAuthCancelled = (source) => {
  const params = {
    source,
  };
  trackEvent(AUTH.POPOVER.CANCELLED, params);
};
