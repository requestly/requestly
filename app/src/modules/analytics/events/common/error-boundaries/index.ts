import { trackEvent } from "modules/analytics";

enum EVENT {
  ERROR_BOUNDARY_SHOWN = "error_boundary_shown",
}

export const trackErrorBoundaryShown = <T = unknown>(error: T, errorInfo: T) => {
  const params = { error, errorInfo };
  trackEvent(EVENT.ERROR_BOUNDARY_SHOWN, params);
};
