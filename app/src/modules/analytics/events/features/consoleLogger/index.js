import { trackEvent } from "modules/analytics";
import { CONSOLE_LOGGER } from "../constants";

export const trackConsoleLoggerToggled = (uid, state) => {
  const params = {
    uid,
    state,
  };
  trackEvent(CONSOLE_LOGGER.TOGGLED, params);
};
