import { trackEvent } from "modules/analytics";
import { SETTINGS_TOGGLED } from "./constants";

export const trackSettingsToggled = (action, value) => {
  const params = { action, value };
  trackEvent(SETTINGS_TOGGLED, params);
};

export const trackBlockListUpdated = ({ action, url, block_list, source }) => {
  const params = { action, url, block_list, source };
  trackEvent("block_list_updated", params);
};
