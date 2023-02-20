import { trackEvent } from "modules/analytics";
import { DARK_MODE } from "./constants";

export const trackDarkModeToggled = (enabled) => {
  const params = { enabled };
  trackEvent(DARK_MODE.TOGGLED, params);
};
