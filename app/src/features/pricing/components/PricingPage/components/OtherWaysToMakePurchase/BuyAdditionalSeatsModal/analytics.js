import { trackEvent } from "modules/analytics";

export const EVENTS = {
  BUY_ADDITIONAL_USERS_FORM_SUBMITTED: "buy_additional_users_form_submitted",
};

export function trackBuyAdditionalUsersFormSubmitted() {
  trackEvent(EVENTS.BUY_ADDITIONAL_USERS_FORM_SUBMITTED);
}
