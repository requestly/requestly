import { trackEvent } from "modules/analytics";
import { COMMAND_BAR } from "./constants";

export const trackCommandBarToggled = () => {
  trackEvent(COMMAND_BAR.COMMAND_BAR_TOGGLED);
};

export const trackCommandBarActionSelected = (action: string) => {
  const params = { action };
  trackEvent(COMMAND_BAR.COMMAND_BAR_ACTION_SELECTED, params);
};
