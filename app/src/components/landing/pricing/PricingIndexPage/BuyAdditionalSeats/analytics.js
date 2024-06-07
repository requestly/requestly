import { trackEvent } from "modules/analytics";

export const EVENTS = {
  BUY_ADDITIONAL_USERS_BUTTON_CLICKED: "buy_additional_users_button_clicked",
};

export function trackBuyAdditionalUsersButtonClicked() {
  trackEvent(EVENTS.BUY_ADDITIONAL_USERS_BUTTON_CLICKED);
}
