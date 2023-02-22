import { trackEvent } from "modules/analytics";
import { SETTINGS_TOGGLED } from "./constants";

export const trackSettingsToggled = (action, value) => {
  const params = { action, value };
  trackEvent(SETTINGS_TOGGLED, params);
};
