import { trackEvent } from "modules/analytics";
import { SECONDARY_SIDEBAR } from "./constants";

export const trackSecondarySidebarToggleButtonClicked = (opened: boolean) => {
  trackEvent(SECONDARY_SIDEBAR.SIDEBAR_TOGGLE_BUTTON_CLICKED, { opened });
};
