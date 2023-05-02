import { trackEvent } from "modules/analytics";

enum EVENT {
  ERROR_BOUNDARY_SHOWN = "error_boundary_shown",
}

export const trackErrorBoundaryShown = <T = string>(errorMessage: T, stackTrace: T) => {
  const params = { errorMessage, stackTrace };
  trackEvent(EVENT.ERROR_BOUNDARY_SHOWN, params);
};
